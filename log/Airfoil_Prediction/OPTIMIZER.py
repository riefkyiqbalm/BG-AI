"""
OPTIMIZER.py
===================
Optimisation loop that wraps airfoilgenerator (XFoil geometry + polar) and
the trained ML scorer (uav_xfoil_ml model bundle) to find the best airfoil
geometry for a given mission -- without retraining.

Two optimisers -- pure NumPy / SciPy, no extra installs needed:

  Bayesian  (default)
      Gaussian Process surrogate + Expected Improvement acquisition.
      Best for expensive objectives with a small budget (20-60 calls).

  Genetic Algorithm
      Tournament selection + BLX-alpha crossover + Gaussian mutation.
      Best for larger budgets or when you want broader search coverage.

Scorer
------
  Default  : maximise  breguet = CL^1.5 / CD  at mission alpha.
             This is the primary long-endurance UAV figure of merit.
  Others   : max_LD, max_CL, min_CD
  Custom   : pass scorer=callable(pred_df, alpha) -> float

Search spaces (auto-selected by method)
----------------------------------------
  naca4   : m (camber), p (camber pos), t (thickness)           -- 3 params
  cst     : au[0..N], al[0..N]   (Bernstein weights, N=6)       -- 12 params
  parsec  : rle, xu, zu, zxxu, xl, zl, zxxl, zte, dte,
            alpha_te, beta_te                                     -- 11 params

Quick start
-----------
    from airfoiloptimizer import optimize

    best = optimize(
        method     = "naca4",
        mission    = {"reynolds": 300_000, "mach": 0.0, "alpha": 4.0},
        xfoil_path = r"C:\\XFoil\\xfoil.exe",
        model_path = "uav_model.pkl",
        optimizer  = "bayesian",
        objective  = "breguet",
        n_calls    = 40,
        output_dir = "optim_results",
    )
    print(best["params"])   # best geometry dict
    print(best["score"])    # best objective value
"""

import os
import sys
import time
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

# =============================================================================
# 1.  SEARCH SPACES
# =============================================================================

_NACA4_KEYS   = ["m", "p", "t"]
_NACA4_BOUNDS = [
    (0.00, 0.09),   # m -- max camber  (0-9 %)
    (0.20, 0.60),   # p -- camber peak (20-60 % chord)
    (0.06, 0.18),   # t -- thickness   (6-18 %)
]

_CST_N = 6   # Bernstein weights per surface; change here if needed
_CST_BOUNDS = (
    [(0.05, 0.50)] * _CST_N     # au_0 ? au_{N-1}  upper surface
  + [(-0.50, -0.01)] * _CST_N   # al_0 ? al_{N-1}  lower surface
)

_PARSEC_KEYS   = ["rle","xu","zu","zxxu","xl","zl","zxxl",
                  "zte","dte","alpha_te","beta_te"]
_PARSEC_BOUNDS = [
    (0.005, 0.025),   # rle      LE radius
    (0.20,  0.50),    # xu       upper crest x/c
    (0.03,  0.10),    # zu       upper crest height
    (-0.80, -0.10),   # zxxu     upper crest curvature
    (0.20,  0.50),    # xl       lower crest x/c
    (-0.10, -0.01),   # zl       lower crest depth
    (0.10,  0.80),    # zxxl     lower crest curvature
    (0.00,  0.005),   # zte      TE z
    (0.005, 0.020),   # dte      TE thickness
    (-0.10, 0.00),    # alpha_te TE mean-line angle (rad)
    (0.05,  0.30),    # beta_te  TE wedge angle (rad)
]


def _get_bounds(method: str) -> list:
    if method == "naca4":
        return _NACA4_BOUNDS
    elif method == "cst":
        return _CST_BOUNDS
    elif method == "parsec":
        return _PARSEC_BOUNDS
    else:
        raise ValueError(f"Unknown method {method!r} -- choose naca4 / cst / parsec")


def _vec_to_params(method: str, x: np.ndarray) -> dict:
    """Convert raw parameter vector to airfoilgenerator params dict."""
    if method == "naca4":
        return {k: float(v) for k, v in zip(_NACA4_KEYS, x)}
    elif method == "cst":
        n = _CST_N
        return {"au": x[:n].tolist(), "al": x[n:].tolist()}
    elif method == "parsec":
        return {k: float(v) for k, v in zip(_PARSEC_KEYS, x)}


def _infer_geometry(method: str, params: dict, name: str) -> dict:
    """
    Build a geometry dict {name: {camber, thickness}} for polar_df_to_train.
    For NACA4 the values are exact; for CST/PARSEC they are estimates --
    XFoil output will supply the actual transition locations anyway.
    """
    if method == "naca4":
        return {name: {"camber":    params["m"],
                       "thickness": params["t"]}}
    elif method == "cst":
        au = params.get("au", [0.2] * _CST_N)
        return {name: {"camber":    max(float(np.mean(au)) * 0.25, 0.0),
                       "thickness": 0.12}}
    elif method == "parsec":
        zu = params.get("zu", 0.06)
        zl = params.get("zl", -0.05)
        return {name: {"camber":    max((zu + zl) / 2.0, 0.0),
                       "thickness": max(zu - zl, 0.06)}}


# =============================================================================
# 2.  BUILT-IN SCORERS
# =============================================================================

def _at_alpha(pred_df: pd.DataFrame, alpha: float) -> pd.Series:
    """Return the row nearest to the target alpha."""
    idx = (pred_df["alpha"] - alpha).abs().idxmin()
    return pred_df.loc[idx]


def scorer_breguet(pred_df: pd.DataFrame, alpha: float) -> float:
    """Maximise CL^1.5 / CD at mission alpha (Breguet endurance factor)."""
    row = _at_alpha(pred_df, alpha)
    if int(row.get("is_stalled", 0)):
        return -1.0
    cl = float(row["CL_pred"])
    cd = float(row["CD_pred"])
    if cd < 1e-9 or cl <= 0.0:
        return -1.0
    return cl ** 1.5 / cd


def scorer_max_LD(pred_df: pd.DataFrame, alpha: float) -> float:
    """Maximise lift-to-drag ratio at mission alpha."""
    row = _at_alpha(pred_df, alpha)
    if int(row.get("is_stalled", 0)):
        return -1.0
    cl = float(row["CL_pred"])
    cd = float(row["CD_pred"])
    return cl / max(cd, 1e-9)


def scorer_max_CL(pred_df: pd.DataFrame, alpha: float) -> float:
    """Maximise peak CL across the sweep (stall resistance)."""
    clean = pred_df[pred_df.get("is_stalled", pd.Series(0, index=pred_df.index)) == 0]
    if len(clean) == 0:
        return -1.0
    return float(clean["CL_pred"].max())


def scorer_min_CD(pred_df: pd.DataFrame, alpha: float) -> float:
    """Minimise drag at mission alpha -- returns negative CD so higher = better."""
    row = _at_alpha(pred_df, alpha)
    if int(row.get("is_stalled", 0)):
        return -1.0
    return -float(row["CD_pred"])


_SCORERS = {
    "breguet": scorer_breguet,
    "max_LD" : scorer_max_LD,
    "max_CL" : scorer_max_CL,
    "min_CD" : scorer_min_CD,
}


# =============================================================================
# 3.  ML SCORER -- single evaluation
#     generate airfoil -> XFoil polar -> ML prediction -> objective score
# =============================================================================

def _evaluate(x:          np.ndarray,
              method:     str,
              name:       str,
              mission:    dict,
              xfoil_path: str,
              bundle:     dict,
              scorer_fn,
              work_dir:   str) -> float:
    """
    Evaluate one candidate parameter vector.

    Returns float score (higher = better).
    Returns -2.0 for any invalid candidate (bad geometry, XFoil failure, etc.).
    """
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # ── Set XFOIL_PATH env var BEFORE importing xfoilrun ------------------
    # xfoilrun._xfoil_exe() reads os.environ["XFOIL_PATH"] at call time.
    # Setting it here ensures every subprocess call uses the correct binary
    # regardless of import order.
    if xfoil_path and os.path.isfile(xfoil_path):
        os.environ["XFOIL_PATH"] = xfoil_path
    elif not os.environ.get("XFOIL_PATH"):
        import shutil
        found = shutil.which("xfoil") or shutil.which("xfoil.exe")
        if found:
            os.environ["XFOIL_PATH"] = found
        else:
            print("    [eval] ERROR: XFoil not found. Set xfoil_path= or "
                  "add xfoil.exe to PATH or set XFOIL_PATH env var.")
            return -2.0

    try:
        from GENERATOR  import generate
        from POLARPARSE import polar_df_to_train
    except ImportError as e:
        raise ImportError(
            f"[optimizer] Cannot import required module: {e}\n"
            f"  Make sure airfoilgenerator.py and polar_df_to_train.py are "
            f"in the same folder as airfoiloptimizer.py"
        )

    params   = _vec_to_params(method, x)
    geometry = _infer_geometry(method, params, name)

    re          = mission["reynolds"]
    mach        = mission["mach"]
    alpha       = mission["alpha"]
    alpha_start = mission["alpha_start"]
    alpha_end   = mission["alpha_end"]
    alpha_step  = mission["alpha_step"]

    # -- Step 1: generate .dat + run XFoil --------------------------------
    try:
        gen = generate(
            params      = params,
            name        = name,
            reynolds    = re,
            mach        = mach,
            alpha_start = alpha_start,
            alpha_end   = alpha_end,
            alpha_step  = alpha_step,
            output_dir  = work_dir,
            run_xfoil   = True,
            xfoil_path  = xfoil_path,
            plot        = False,
            show_plot   = False,
        )
    except Exception as _e:
        print(f"    [eval] generate() failed: {_e}")
        return -2.0

    polar_df = gen["polar"]
    if polar_df is None or len(polar_df) == 0:
        # XFoil found but returned no data -- show which path was used
        from GENERATOR import _resolve_xfoil
        exe = _resolve_xfoil(xfoil_path)
        print(f"    [eval] XFoil returned no polar data.")
        print(f"           exe resolved to: {exe!r}")
        print(f"           params: {params}")
        return -2.0

    # -- Step 2: feature engineering ---------------------------------------
    try:
        df_feat = polar_df_to_train(polar_df, geometry=geometry)
    except Exception as _e:
        print(f"    [eval] polar_df_to_train failed: {_e}")
        return -2.0

    # -- Step 3: ML prediction ---------------------------------------------
    models = bundle["models"]
    scaler = bundle["scaler"]
    FEAT   = bundle["FEAT"]
    TGTS   = bundle["TGTS"]

    # Fill any features the polar lacks with 0 (graceful degradation)
    for f in FEAT:
        if f not in df_feat.columns:
            df_feat[f] = 0.0

    try:
        X_s = scaler.transform(df_feat[FEAT].values)
    except Exception:
        return -2.0

    preds = {}
    for tgt in TGTS:
        rf_p = bundle["models"][tgt]["rf"].predict(X_s)
        gb_p = bundle["models"][tgt]["gb"].predict(X_s)
        preds[tgt] = 0.60 * rf_p + 0.40 * gb_p

    pred_df = pd.DataFrame({
        "alpha"     : df_feat["alpha"].values,
        "CL_pred"   : preds["CL"],
        "CD_pred"   : np.clip(preds["CD"], 0.001, None),
        "CDp_pred"  : preds["CDp"],
        "CM_pred"   : preds["CM"],
        "is_stalled": df_feat["is_stalled"].values
                      if "is_stalled" in df_feat.columns
                      else np.zeros(len(df_feat), dtype=int),
    })
    pred_df["LD_pred"]      = pred_df["CL_pred"] / pred_df["CD_pred"]
    pred_df["breguet_pred"] = pred_df["CL_pred"] ** 1.5 / pred_df["CD_pred"]

    # -- Step 4: score -----------------------------------------------------
    try:
        score = float(scorer_fn(pred_df, alpha))
    except Exception:
        return -2.0

    return score if np.isfinite(score) else -2.0


# =============================================================================
# 4.  BAYESIAN OPTIMISER  (Gaussian Process + Expected Improvement)
# =============================================================================

def _bayesian_optimize(obj_fn,
                       bounds:  list,
                       n_calls: int   = 40,
                       n_init:  int   = 10,
                       xi:      float = 0.01,
                       verbose: bool  = True) -> dict:
    """
    Gaussian Process Bayesian optimisation with Expected Improvement.

    Parameters
    ----------
    obj_fn   : callable(x, call_index) -> float   higher = better
    bounds   : [(low, high), ...]
    n_calls  : total evaluations including random initialisation
    n_init   : random samples before GP surrogate is used
    xi       : exploration-exploitation trade-off (larger = more explore)
    verbose  : print progress per call

    Returns
    -------
    dict: x_best, score_best, history_x, history_y
    """
    from scipy.stats     import norm as _norm
    from scipy.optimize  import minimize as _sp_min
    from sklearn.gaussian_process             import GaussianProcessRegressor
    from sklearn.gaussian_process.kernels     import Matern, ConstantKernel

    lo  = np.array([b[0] for b in bounds])
    hi  = np.array([b[1] for b in bounds])
    dim = len(bounds)
    rng = np.random.RandomState(42)

    # Normalise to [0,1] cube for the GP
    def _to_unit(x):   return (x - lo) / (hi - lo)
    def _from_unit(z): return lo + z * (hi - lo)

    history_x: list = []
    history_y: list = []

    # -- Phase 1: random initialisation -----------------------------------
    for i in range(n_init):
        x = lo + rng.rand(dim) * (hi - lo)
        y = obj_fn(x, i)
        history_x.append(x.copy())
        history_y.append(y)
        if verbose:
            print(f"    [init {i+1:02d}/{n_init}]  "
                  f"score={y:+.5f}   best={max(history_y):+.5f}")

    # -- Phase 2: GP-guided search -----------------------------------------
    kernel = ConstantKernel(1.0, constant_value_bounds=(1e-3, 1e3)) \
           * Matern(length_scale=np.ones(dim),
                    length_scale_bounds=[(1e-2, 10.0)] * dim,
                    nu=2.5)
    gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-6,
                                   normalize_y=True,
                                   n_restarts_optimizer=5)

    for i in range(n_init, n_calls):
        X_obs = np.array([_to_unit(x) for x in history_x])
        y_obs = np.array(history_y)

        # Only valid evaluations for GP fitting
        valid = y_obs > -1.5
        if valid.sum() < 3:
            # Not enough valid data yet -- keep sampling randomly
            x = lo + rng.rand(dim) * (hi - lo)
        else:
            gp.fit(X_obs[valid], y_obs[valid])
            y_best = float(y_obs[valid].max())

            def _neg_ei(z):
                z  = np.clip(z, 0.0, 1.0).reshape(1, -1)
                mu, sigma = gp.predict(z, return_std=True)
                sigma = float(max(sigma[0], 1e-9))
                imp   = float(mu[0]) - y_best - xi
                Z     = imp / sigma
                ei    = imp * _norm.cdf(Z) + sigma * _norm.pdf(Z)
                return -float(ei)

            # Multi-start L-BFGS-B to find EI maximum
            best_val = np.inf
            best_z   = rng.rand(dim)
            for _ in range(30):
                z0 = rng.rand(dim)
                res = _sp_min(_neg_ei, z0, method="L-BFGS-B",
                              bounds=[(0.0, 1.0)] * dim,
                              options={"maxiter": 200})
                if res.fun < best_val:
                    best_val = res.fun
                    best_z   = res.x
            x = _from_unit(np.clip(best_z, 0.0, 1.0))

        y = obj_fn(x, i)
        history_x.append(x.copy())
        history_y.append(y)

        if verbose:
            print(f"    [bay  {i+1:02d}/{n_calls}]  "
                  f"score={y:+.5f}   best={max(history_y):+.5f}")

    best_idx = int(np.argmax(history_y))
    return {
        "x_best":     history_x[best_idx],
        "score_best": history_y[best_idx],
        "history_x":  history_x,
        "history_y":  history_y,
    }


# =============================================================================
# 5.  GENETIC ALGORITHM  (BLX-alpha crossover + Gaussian mutation)
# =============================================================================

def _genetic_optimize(obj_fn,
                      bounds:          list,
                      n_calls:         int   = 60,
                      pop_size:        int   = 20,
                      elite_frac:      float = 0.20,
                      crossover_alpha: float = 0.30,
                      mutation_sigma:  float = 0.05,
                      verbose:         bool  = True) -> dict:
    """
    Genetic algorithm with BLX-alpha crossover and Gaussian mutation.

    Parameters
    ----------
    obj_fn          : callable(x, call_index) -> float   higher = better
    bounds          : [(low, high), ...]
    n_calls         : total evaluation budget
    pop_size        : individuals per generation
    elite_frac      : fraction carried unchanged to next generation
    crossover_alpha : BLX-alpha blending range beyond parent interval
    mutation_sigma  : Gaussian mutation std as fraction of parameter range
    verbose         : print progress per generation

    Returns
    -------
    dict: x_best, score_best, history_x, history_y
    """
    lo  = np.array([b[0] for b in bounds])
    hi  = np.array([b[1] for b in bounds])
    dim = len(bounds)
    rng = np.random.RandomState(42)

    n_elite  = max(1, int(pop_size * elite_frac))
    n_budget = [0]

    history_x: list = []
    history_y: list = []

    def _clip(x):
        return np.clip(x, lo, hi)

    def _eval(x):
        idx = n_budget[0]
        y   = obj_fn(x, idx)
        n_budget[0] += 1
        history_x.append(x.copy())
        history_y.append(y)
        return y

    def _tournament(pop, fits, k=3):
        """k-tournament selection -- returns one individual."""
        idx  = rng.choice(len(pop), size=k, replace=False)
        best = idx[np.argmax([fits[i] for i in idx])]
        return pop[best].copy()

    # -- Generation 0: random population ----------------------------------
    pop  = [_clip(lo + rng.rand(dim) * (hi - lo)) for _ in range(pop_size)]
    fits = [_eval(x) for x in pop]

    gen = 0
    if verbose:
        valid_fits = [f for f in fits if f > -1.5]
        print(f"    [gen {gen:02d}]  best={max(fits):+.5f}  "
              f"valid={len(valid_fits)}/{pop_size}  calls={n_budget[0]}")

    # -- Evolution loop ----------------------------------------------------
    while n_budget[0] < n_calls:
        gen += 1

        # Sort: best first
        order = np.argsort(fits)[::-1]
        pop   = [pop[i]  for i in order]
        fits  = [fits[i] for i in order]

        new_pop  = [pop[i].copy()  for i in range(n_elite)]
        new_fits = [fits[i]        for i in range(n_elite)]

        while len(new_pop) < pop_size and n_budget[0] < n_calls:
            p1 = _tournament(pop, fits)
            p2 = _tournament(pop, fits)

            # BLX-alpha crossover
            lo_c  = np.minimum(p1, p2) - crossover_alpha * np.abs(p1 - p2)
            hi_c  = np.maximum(p1, p2) + crossover_alpha * np.abs(p1 - p2)
            child = _clip(lo_c + rng.rand(dim) * (hi_c - lo_c))

            # Gaussian mutation
            child = _clip(child + rng.randn(dim) * (hi - lo) * mutation_sigma)

            f = _eval(child)
            new_pop.append(child)
            new_fits.append(f)

        pop  = new_pop
        fits = new_fits

        if verbose:
            valid_fits = [f for f in fits if f > -1.5]
            print(f"    [gen {gen:02d}]  best={max(fits):+.5f}  "
                  f"mean={np.mean(valid_fits) if valid_fits else 0:+.5f}  "
                  f"valid={len(valid_fits)}/{len(fits)}  calls={n_budget[0]}")

    best_idx = int(np.argmax(history_y))
    return {
        "x_best":     history_x[best_idx],
        "score_best": history_y[best_idx],
        "history_x":  history_x,
        "history_y":  history_y,
    }


# =============================================================================
# 6.  CONVERGENCE PLOT
# =============================================================================

def _plot_convergence(history_y: list,
                      method:    str,
                      optimizer: str,
                      objective: str,
                      save_path: str = None) -> plt.Figure:
    """Score-per-call plot with running best line."""
    scores = np.array(history_y, dtype=float)
    calls  = np.arange(1, len(scores) + 1)
    valid  = scores > -1.5

    # Running best (forward-fill over invalid calls)
    best_so_far = np.full_like(scores, np.nan)
    cur_best    = -np.inf
    for i, (s, v) in enumerate(zip(scores, valid)):
        if v:
            cur_best = max(cur_best, s)
        best_so_far[i] = cur_best if cur_best > -np.inf else np.nan

    fig, ax = plt.subplots(figsize=(9, 4), facecolor="white")
    ax.scatter(calls[valid],  scores[valid],  s=20, alpha=0.55,
               color="#5a9fd4", label="valid evaluation", zorder=3)
    ax.scatter(calls[~valid], np.full((~valid).sum(), scores[valid].min()
               if valid.any() else 0), s=20, alpha=0.35,
               color="#e07070", marker="x", label="invalid (XFoil fail)", zorder=3)
    ax.plot(calls, best_so_far, color="#d45a5a", lw=2.0,
            label="best so far", zorder=4)

    ax.set_xlabel("Evaluation number", fontsize=9)
    ax.set_ylabel(objective, fontsize=9)
    ax.set_title(
        f"Optimisation convergence -- {method.upper()} / {optimizer} / {objective}",
        fontsize=10, fontweight="bold")
    ax.legend(fontsize=8)
    ax.grid(True, lw=0.4, alpha=0.5)
    ax.tick_params(labelsize=8)
    fig.tight_layout()

    if save_path:
        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"[optimizer] Convergence plot  : {save_path}")

    return fig


# =============================================================================
# 7.  MAIN PUBLIC API
# =============================================================================

def optimize(method:     str   = "naca4",
             mission:    dict  = None,
             xfoil_path: str   = None,
             model_path: str   = "uav_model.pkl",
             bundle:     dict  = None,
             optimizer:  str   = "bayesian",
             objective:  str   = "breguet",
             scorer               = None,
             n_calls:    int   = 40,
             n_init:     int   = 10,
             pop_size:   int   = 20,
             bounds:     list  = None,
             output_dir: str   = "optim_results",
             verbose:    bool  = True) -> dict:
    """
    Find the best airfoil geometry for a given mission condition.

    Parameters
    ----------
    method      : "naca4" | "cst" | "parsec"
    mission     : dict -- supported keys:
                    reynolds    : mission Reynolds number     (default 300 000)
                    mach        : mission Mach number         (default 0.0)
                    alpha       : target angle of attack deg  (default 4.0)
                    alpha_start : XFoil sweep start  deg      (default alpha-6)
                    alpha_end   : XFoil sweep end    deg      (default alpha+10)
                    alpha_step  : XFoil sweep step   deg      (default 1.0)
    xfoil_path  : full path to xfoil.exe
                  Falls back to XFOIL_PATH env var then system PATH if None.
    model_path  : path to uav_model.pkl saved by uav_xfoil_ml.py
    bundle      : pre-loaded model bundle from joblib.load() -- skips disk read.
                  Useful when calling optimize() in a loop.
    optimizer   : "bayesian" | "genetic"
    objective   : "breguet" | "max_LD" | "max_CL" | "min_CD"
    scorer      : custom callable(pred_df, alpha) -> float
                  Overrides objective when provided.
    n_calls     : total XFoil evaluations (budget)
    n_init      : Bayesian only -- random samples before GP kicks in
    pop_size    : Genetic only  -- population size per generation
    bounds      : custom [(low,high), ...] -- overrides built-in bounds
    output_dir  : folder for .dat files, plots, and history CSV
    verbose     : print progress

    Returns
    -------
    dict with keys:
        params          : dict  -- best geometry parameters
        score           : float -- best objective value achieved
        method          : str   -- parameterisation used
        optimizer       : str   -- optimiser used
        objective       : str   -- objective label
        mission         : dict  -- mission conditions
        history         : pd.DataFrame -- full evaluation history
                          columns: call, score, best_so_far, param_*
        convergence_fig : matplotlib Figure -- score vs call plot
        result          : dict -- full generate() output for best airfoil
                          keys: coords, dat_path, polar, fig, plot_path
    """

    # -- Set XFOIL_PATH immediately so all downstream code finds it --------
    if xfoil_path and os.path.isfile(xfoil_path):
        os.environ["XFOIL_PATH"] = xfoil_path
        print(f"[optimizer] XFoil path set : {xfoil_path}")
    else:
        import shutil
        found = shutil.which("xfoil") or shutil.which("xfoil.exe")
        env   = os.environ.get("XFOIL_PATH", "")
        if found:
            os.environ["XFOIL_PATH"] = found
            print(f"[optimizer] XFoil found on PATH : {found}")
        elif env and os.path.isfile(env):
            print(f"[optimizer] XFoil from XFOIL_PATH env : {env}")
        else:
            print("[optimizer] WARNING: XFoil not found!")
            print("  Pass xfoil_path=r'C:\\XFoil\\xfoil.exe'  OR")
            print("  set env var XFOIL_PATH before running.")

    # -- Defaults ----------------------------------------------------------
    if mission is None:
        mission = {}

    alpha = float(mission.get("alpha", 4.0))
    mission = {
        "reynolds"   : float(mission.get("reynolds",    300_000)),
        "mach"       : float(mission.get("mach",          0.0)),
        "alpha"      : alpha,
        "alpha_start": float(mission.get("alpha_start", max(alpha - 6.0, -6.0))),
        "alpha_end"  : float(mission.get("alpha_end",   alpha + 10.0)),
        "alpha_step" : float(mission.get("alpha_step",  1.0)),
    }

    os.makedirs(output_dir, exist_ok=True)
    work_dir = os.path.join(output_dir, "_candidates")
    os.makedirs(work_dir, exist_ok=True)

    # -- Load ML model bundle ----------------------------------------------
    if bundle is None:
        import joblib
        if not os.path.isfile(model_path):
            raise FileNotFoundError(
                f"[optimizer] Model file not found: {model_path!r}\n"
                f"  Run uav_xfoil_ml.py first to train and save the model.\n"
                f"  Expected path: {os.path.abspath(model_path)}"
            )
        bundle = joblib.load(model_path)
        print(f"[optimizer] Model loaded from : {model_path}")
        print(f"  Trained on airfoils : {bundle.get('AF_NAMES', 'unknown')}")
        print(f"  Features            : {len(bundle['FEAT'])}")

    # -- Scorer ------------------------------------------------------------
    if scorer is not None:
        scorer_fn  = scorer
        obj_label  = "custom"
    elif objective in _SCORERS:
        scorer_fn  = _SCORERS[objective]
        obj_label  = objective
    else:
        raise ValueError(
            f"[optimizer] Unknown objective {objective!r}\n"
            f"  Choose from: {list(_SCORERS.keys())}\n"
            f"  Or pass scorer=callable(pred_df, alpha) -> float"
        )

    # -- Search bounds -----------------------------------------------------
    search_bounds = bounds if bounds is not None else _get_bounds(method)
    n_dim         = len(search_bounds)

    # -- Print header ------------------------------------------------------
    sep = "=" * 54
    print(f"\n[optimizer] {sep}")
    print(f"[optimizer]  Method     : {method.upper()}  ({n_dim} parameters)")
    print(f"[optimizer]  Optimiser  : {optimizer}")
    print(f"[optimizer]  Objective  : {obj_label}")
    print(f"[optimizer]  Budget     : {n_calls} XFoil evaluations")
    print(f"[optimizer]  Mission    : Re={mission['reynolds']:.0f}  "
          f"M={mission['mach']:.3f}  alpha={mission['alpha']:.1f} deg")
    print(f"[optimizer]  AoA sweep  : {mission['alpha_start']:.1f} deg -> "
          f"{mission['alpha_end']:.1f} deg  step {mission['alpha_step']:.1f} deg")
    print(f"[optimizer] {sep}\n")

    t_start = time.time()

    # -- Wrapped objective exposed to optimiser ----------------------------
    def _obj(x: np.ndarray, call_idx: int) -> float:
        return _evaluate(
            x          = x,
            method     = method,
            name       = f"cand_{call_idx:04d}",
            mission    = mission,
            xfoil_path = xfoil_path,
            bundle     = bundle,
            scorer_fn  = scorer_fn,
            work_dir   = work_dir,
        )

    # -- Run chosen optimiser ----------------------------------------------
    if optimizer == "bayesian":
        raw = _bayesian_optimize(
            _obj, search_bounds,
            n_calls = n_calls,
            n_init  = min(n_init, max(3, n_calls // 4)),
            verbose = verbose,
        )
    elif optimizer == "genetic":
        raw = _genetic_optimize(
            _obj, search_bounds,
            n_calls  = n_calls,
            pop_size = pop_size,
            verbose  = verbose,
        )
    else:
        raise ValueError(
            f"[optimizer] Unknown optimizer {optimizer!r} -- "
            f"choose 'bayesian' or 'genetic'"
        )

    t_elapsed = time.time() - t_start

    # -- Best result -------------------------------------------------------
    best_x      = raw["x_best"]
    best_score  = raw["score_best"]
    best_params = _vec_to_params(method, best_x)
    best_geom   = _infer_geometry(method, best_params, "best_airfoil")

    print(f"\n[optimizer] {sep}")
    print(f"[optimizer]  DONE  --  {t_elapsed:.1f} s  "
          f"({n_calls} evaluations)")
    print(f"[optimizer]  Best score  : {best_score:+.6f}  ({obj_label})")
    print(f"[optimizer]  Best params : {best_params}")
    print(f"[optimizer] {sep}\n")

    # -- Re-run best with full plot -----------------------------------------
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from GENERATOR import generate

    print("[optimizer] Re-running best airfoil with full plot...")
    best_result = generate(
        params      = best_params,
        name        = "best_airfoil",
        reynolds    = mission["reynolds"],
        mach        = mission["mach"],
        alpha_start = mission["alpha_start"],
        alpha_end   = mission["alpha_end"],
        alpha_step  = mission["alpha_step"],
        output_dir  = output_dir,
        run_xfoil   = True,
        xfoil_path  = xfoil_path,
        plot        = True,
        show_plot   = False,
    )
    print(f"[optimizer] Best .dat    : {best_result['dat_path']}")
    print(f"[optimizer] Best plot    : {best_result['plot_path']}")

    # -- Build history DataFrame -------------------------------------------
    rows = []
    best_seen = -np.inf
    for i, (x, y) in enumerate(zip(raw["history_x"], raw["history_y"])):
        if y > -1.5:
            best_seen = max(best_seen, y)
        p   = _vec_to_params(method, x)
        row = {
            "call"        : i + 1,
            "score"       : y,
            "best_so_far" : best_seen if best_seen > -np.inf else np.nan,
            "valid"       : int(y > -1.5),
        }
        if method == "cst":
            row.update({f"au_{j}": v for j, v in enumerate(p["au"])})
            row.update({f"al_{j}": v for j, v in enumerate(p["al"])})
        else:
            row.update({f"p_{k}": v for k, v in p.items()})
        rows.append(row)

    history_df = pd.DataFrame(rows)
    csv_path   = os.path.join(output_dir, "optim_history.csv")
    history_df.to_csv(csv_path, index=False)
    print(f"[optimizer] History CSV  : {csv_path}")

    # -- Convergence plot ---------------------------------------------------
    conv_path = os.path.join(output_dir, "convergence.png")
    conv_fig  = _plot_convergence(
        raw["history_y"],
        method    = method,
        optimizer = optimizer,
        objective = obj_label,
        save_path = conv_path,
    )

    return {
        "params"          : best_params,
        "score"           : best_score,
        "method"          : method,
        "optimizer"       : optimizer,
        "objective"       : obj_label,
        "mission"         : mission,
        "history"         : history_df,
        "convergence_fig" : conv_fig,
        "result"          : best_result,
    }


# =============================================================================
# 8.  CLI
# =============================================================================

if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(
        description="Airfoil optimiser -- wraps XFoil + ML scorer",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    ap.add_argument("--method",    default="naca4",
                    choices=["naca4", "cst", "parsec"],
                    help="Airfoil parameterisation")
    ap.add_argument("--optimizer", default="bayesian",
                    choices=["bayesian", "genetic"],
                    help="Optimisation algorithm")
    ap.add_argument("--objective", default="breguet",
                    choices=["breguet", "max_LD", "max_CL", "min_CD"],
                    help="Objective function")
    ap.add_argument("--reynolds",  type=float, default=300_000,
                    help="Mission Reynolds number")
    ap.add_argument("--mach",      type=float, default=0.0,
                    help="Mission Mach number")
    ap.add_argument("--alpha",     type=float, default=4.0,
                    help="Mission angle of attack (deg)")
    ap.add_argument("--n_calls",   type=int,   default=30,
                    help="Total XFoil evaluation budget")
    ap.add_argument("--n_init",    type=int,   default=8,
                    help="Bayesian: random init samples")
    ap.add_argument("--pop_size",  type=int,   default=15,
                    help="Genetic: population size")
    ap.add_argument("--xfoil",     default=None, metavar="PATH",
                    help="Full path to xfoil.exe")
    ap.add_argument("--model",     default="uav_model.pkl", metavar="PATH",
                    help="Path to trained model .pkl")
    ap.add_argument("--outdir",    default="optim_results", metavar="DIR",
                    help="Output folder for results")
    args = ap.parse_args()

    result = optimize(
        method     = args.method,
        mission    = {
            "reynolds": args.reynolds,
            "mach"    : args.mach,
            "alpha"   : args.alpha,
        },
        xfoil_path = args.xfoil,
        model_path = args.model,
        optimizer  = args.optimizer,
        objective  = args.objective,
        n_calls    = args.n_calls,
        n_init     = args.n_init,
        pop_size   = args.pop_size,
        output_dir = args.outdir,
        verbose    = True,
    )

    print("\n-- FINAL RESULT -------------------------------------")
    print(f"  Best params : {result['params']}")
    print(f"  Best score  : {result['score']:.6f}  ({result['objective']})")
    print(f"  .dat file   : {result['result']['dat_path']}")
    print(f"  Plot        : {result['result']['plot_path']}")
    print(f"  History CSV : {result['mission']}")