"""
GENERATOR.py
====================
Generate airfoil geometry from three parameterisations, run XFoil polars,
and produce a shape + polar plot -- all from a single function call.

Parameterisations
-----------------
  NACA 4-digit
      3 free parameters: max-camber fraction (m), camber-peak position (p),
      thickness fraction (t).  Fast analytical formula, always produces a
      valid, smooth, closed airfoil.  Best starting point for a new design.

  CST  (Class-Shape Transform, Kulfan 2008)
      Bernstein-polynomial weights on upper and lower surfaces.
      N_cst weights per surface (default 6) -- total 2.N free parameters.
      Can represent any smooth airfoil; use to perturb a known baseline.

  PARSEC  (Sobieczky 1998)
      11 physical parameters: LE radius, upper/lower crest positions,
      crest curvatures, TE thickness and angle.  Physically meaningful --
      every parameter has a direct geometric interpretation.

Auto-select
-----------
  Pass method="auto" (default) and the function picks the parameterisation
  from the params dict:
    ? keys  m / p / t               -> NACA 4-digit
    ? keys  au / al  (or a_upper)   -> CST
    ? keys  rle / xu_crest / xl_crest ?  -> PARSEC
  If multiple key sets are present, preference order: NACA > CST > PARSEC.

Quick start
-----------
    from airfoil_generator import generate

    # NACA 4-digit
    result = generate({"m": 0.04, "p": 0.4, "t": 0.12},
                      name="my_naca", reynolds=300_000)

    # CST -- perturb a NACA baseline
    result = generate({"au": [0.15,0.28,0.20,0.15,0.12,0.10],
                       "al": [-0.14,-0.10,-0.07,-0.05,-0.04,-0.03]},
                      name="cst_wing", reynolds=300_000)

    # PARSEC
    result = generate({
        "rle": 0.0110, "xu": 0.300, "zu": 0.065, "zxxu": -0.40,
        "xl": 0.300,   "zl": -0.050,"zxxl":  0.40,
        "zte": 0.0,    "dte": 0.010,"alpha_te": -0.05, "beta_te": 0.15,
    }, name="parsec_wing", reynolds=300_000)

    # Access results
    print(result["polar"])          # pd.DataFrame
    result["fig"].savefig("out.png")
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

# ---------------------------------------------------------------------------
# Optional XFoil runner (graceful if not on path)
# ---------------------------------------------------------------------------

def _resolve_xfoil(xfoil_path: str = None) -> str:
    """
    Resolve XFoil executable using this priority order:
      1. xfoil_path argument passed directly by the caller
      2. XFOIL_PATH environment variable  (set once, works everywhere)
      3. 'xfoil' / 'xfoil.exe' on the system PATH
    Returns the resolved path string, or None if not found.
    """
    import shutil

    if xfoil_path:
        if os.path.isfile(xfoil_path):
            return xfoil_path
        print(f"[airfoil_generator] WARNING: xfoil_path not found: {xfoil_path!r}")

    env_path = os.environ.get("XFOIL_PATH", "")
    if env_path:
        if os.path.isfile(env_path):
            return env_path
        print(f"[airfoil_generator] WARNING: XFOIL_PATH env var set but "
              f"file not found: {env_path!r}")

    found = shutil.which("xfoil") or shutil.which("xfoil.exe")
    if found:
        return found

    return None


def _xfoil_available(xfoil_path: str = None) -> bool:
    """Return True if XFoil can be located."""
    return _resolve_xfoil(xfoil_path) is not None


# ============================================================================
# 1.  NACA 4-digit
# ============================================================================

def naca4_coords(m: float, p: float, t: float,
                 n_points: int = 100) -> tuple:
    """
    Return (x, y_upper, y_lower) for a NACA 4-digit airfoil.

    Parameters
    ----------
    m        : max camber as fraction of chord  (e.g. 0.04 for NACA x4xx)
    p        : chordwise position of max camber  (e.g. 0.4  for NACA xx4x)
    t        : max thickness as fraction of chord (e.g. 0.12 for NACA xxx2)
    n_points : number of x stations (default 100)

    Returns
    -------
    x        : (n,) x/c stations from 0 to 1
    y_upper  : (n,) upper surface y/c
    y_lower  : (n,) lower surface y/c
    """
    # Cosine spacing -- denser near LE and TE
    beta   = np.linspace(0, np.pi, n_points)
    x      = 0.5 * (1 - np.cos(beta))

    # Thickness distribution (NACA formula)
    yt = (t / 0.2) * (0.2969*np.sqrt(x)
                      - 0.1260*x
                      - 0.3516*x**2
                      + 0.2843*x**3
                      - 0.1015*x**4)

    # Camber line
    yc    = np.zeros_like(x)
    dyc   = np.zeros_like(x)

    if m > 0 and p > 0:
        fwd       = x < p
        yc[fwd]   = (m / p**2) * (2*p*x[fwd] - x[fwd]**2)
        yc[~fwd]  = (m / (1-p)**2) * ((1 - 2*p) + 2*p*x[~fwd] - x[~fwd]**2)
        dyc[fwd]  = (2*m / p**2)   * (p - x[fwd])
        dyc[~fwd] = (2*m / (1-p)**2) * (p - x[~fwd])

    theta   = np.arctan(dyc)
    x_upper = x  - yt * np.sin(theta)
    x_lower = x  + yt * np.sin(theta)
    y_upper = yc + yt * np.cos(theta)
    y_lower = yc - yt * np.cos(theta)

    # Re-interpolate onto uniform x grid for cleaner output
    y_upper = np.interp(x, x_upper, y_upper)
    y_lower = np.interp(x, x_lower, y_lower)

    return x, y_upper, y_lower


def naca4_to_selig(m: float, p: float, t: float,
                   n_points: int = 100) -> np.ndarray:
    """Return Selig-format coordinates array (2N-1, 2): TE->upper->LE->lower->TE."""
    x, yu, yl = naca4_coords(m, p, t, n_points)
    upper = np.column_stack([x[::-1], yu[::-1]])   # TE -> LE
    lower = np.column_stack([x[1:],   yl[1:]])     # LE -> TE (skip duplicate LE)
    return np.vstack([upper, lower])


# ============================================================================
# 2.  CST  (Class-Shape Transform)
# ============================================================================

def _bernstein(n: int, k: int, x: np.ndarray) -> np.ndarray:
    """Bernstein polynomial B(n,k,x)."""
    from scipy.special import comb
    return comb(n, k, exact=True) * x**k * (1 - x)**(n - k)


def cst_surface(weights: np.ndarray, x: np.ndarray,
                zte: float = 0.0) -> np.ndarray:
    """
    Evaluate one CST surface (upper OR lower) at x stations.

    y(x) = C(x) . ? w_k . B(N,k,x)  +  x . zte/2

    where C(x) = x^0.5 . (1-x)^1.0  is the NACA class function.

    Parameters
    ----------
    weights : (N+1,) Bernstein weights
    x       : (n,)   x/c stations in [0, 1]
    zte     : trailing-edge thickness (half-gap, default 0)
    """
    N   = len(weights) - 1
    C   = np.sqrt(x) * (1 - x)
    S   = sum(w * _bernstein(N, k, x) for k, w in enumerate(weights))
    return C * S + x * zte


def cst_to_selig(au: np.ndarray, al: np.ndarray,
                 n_points: int = 100,
                 zte: float = 0.0) -> np.ndarray:
    """
    Return Selig-format coordinates from CST upper/lower weights.

    Parameters
    ----------
    au       : upper surface Bernstein weights  (N+1,)
    al       : lower surface Bernstein weights  (N+1,)
    n_points : x stations per surface
    zte      : trailing-edge thickness (default 0 = sharp)
    """
    beta = np.linspace(0, np.pi, n_points)
    x    = 0.5 * (1 - np.cos(beta))    # cosine spacing

    yu = cst_surface(np.asarray(au), x,  zte/2)
    yl = cst_surface(np.asarray(al), x, -zte/2)

    upper = np.column_stack([x[::-1], yu[::-1]])
    lower = np.column_stack([x[1:],   yl[1:]])
    return np.vstack([upper, lower])


def naca4_to_cst_weights(m: float, p: float, t: float,
                          n_cst: int = 6,
                          n_fit: int = 200) -> tuple:
    """
    Fit CST weights to a NACA 4-digit airfoil by least squares.
    Returns (au, al) as numpy arrays of length n_cst.
    Useful to get a CST starting point that matches a known airfoil.
    """
    x_fit, yu, yl = naca4_coords(m, p, t, n_fit)
    x_fit = x_fit[1:-1]    # drop LE/TE for better conditioning
    yu    = yu[1:-1]
    yl    = yl[1:-1]

    N   = n_cst - 1
    C   = np.sqrt(x_fit) * (1 - x_fit)

    # Build Bernstein basis matrix
    B = np.column_stack([_bernstein(N, k, x_fit) for k in range(n_cst)])
    A = C[:, None] * B   # element-wise scale each column by C(x)

    au, _, _, _ = np.linalg.lstsq(A, yu, rcond=None)
    al, _, _, _ = np.linalg.lstsq(A, yl, rcond=None)
    return au, al


# ============================================================================
# 3.  PARSEC  (11-parameter)
# ============================================================================

def parsec_to_selig(rle:      float,   # leading-edge radius
                    xu:       float,   # upper crest x/c
                    zu:       float,   # upper crest z/c (positive)
                    zxxu:     float,   # upper crest curvature (negative)
                    xl:       float,   # lower crest x/c
                    zl:       float,   # lower crest z/c (negative)
                    zxxl:     float,   # lower crest curvature (positive)
                    zte:      float,   # TE z/c (half-thickness)
                    dte:      float,   # TE wedge angle (rad)
                    alpha_te: float,   # TE mean-line angle (rad)
                    beta_te:  float,   # TE load parameter (rad)
                    n_points: int = 100) -> np.ndarray:
    """
    Return Selig-format coordinates from PARSEC 11 parameters.

    PARSEC solves a 6?6 linear system for each surface to find the
    polynomial coefficients that satisfy the boundary conditions
    (LE tangency, crest location, crest curvature, TE conditions).
    """
    beta  = np.linspace(0, np.pi, n_points)
    x     = 0.5 * (1 - np.cos(beta))

    def _solve_surface(x_crest, z_crest, zxx_crest, z_te, dz_te):
        """
        Solve for 6 polynomial coefficients of z = ? a_k . x^(k-0.5).
        Boundary conditions:
          z(0)  = 0  (LE)          via ?x behaviour
          dz/dx at x->0 = ?(2.rle)  (LE radius)
          z(x_crest) = z_crest     (crest height)
          dz/dx(x_crest) = 0       (crest is extremum)
          d2z/dx2(x_crest) = zxx_crest  (crest curvature)
          z(1)  = z_te             (TE z)
          dz/dx(1) = dz_te         (TE angle)
        6 unknowns, 6 equations -> exactly determined.
        """
        C = np.zeros((6, 6))
        rhs = np.zeros(6)

        # Rows: LE radius, crest height, crest dz=0, crest d2z,
        #       TE height, TE angle
        powers  = np.array([0.5, 1.5, 2.5, 3.5, 4.5, 5.5])
        dpowers = powers - 1          # exponents for dz/dx
        d2pows  = dpowers - 1         # exponents for d2z/dx2

        # 1. LE tangency: coefficient of x^0.5 = ?(2.rle)
        C[0, 0] = 1.0
        rhs[0]  = np.sqrt(2 * rle)

        # 2. Crest height
        C[1, :] = x_crest ** powers
        rhs[1]  = z_crest

        # 3. Crest slope = 0
        C[2, :] = powers * x_crest ** dpowers
        rhs[2]  = 0.0

        # 4. Crest curvature
        C[3, :] = powers * dpowers * x_crest ** d2pows
        rhs[3]  = zxx_crest

        # 5. TE height
        C[4, :] = 1.0 ** powers          # x=1 -> x^p = 1
        rhs[4]  = z_te

        # 6. TE slope
        C[5, :] = powers * 1.0 ** dpowers
        rhs[5]  = dz_te

        try:
            a = np.linalg.solve(C, rhs)
        except np.linalg.LinAlgError:
            # Degenerate parameters -- fall back to zeros
            a = np.zeros(6)
        return a

    # Upper surface boundary conditions
    z_te_u  =  zte + 0.5 * dte
    dz_te_u =  np.tan(alpha_te + beta_te)
    au = _solve_surface(xu, zu, zxxu, z_te_u, dz_te_u)

    # Lower surface boundary conditions
    z_te_l  =  zte - 0.5 * dte
    dz_te_l =  np.tan(alpha_te - beta_te)
    al = _solve_surface(xl, zl, zxxl, z_te_l, dz_te_l)

    powers = np.array([0.5, 1.5, 2.5, 3.5, 4.5, 5.5])
    yu     = sum(au[i] * x**powers[i] for i in range(6))
    yl     = sum(al[i] * x**powers[i] for i in range(6))

    # Clip any LE NaN from x=0
    yu[0] = yl[0] = 0.0

    upper = np.column_stack([x[::-1], yu[::-1]])
    lower = np.column_stack([x[1:],   yl[1:]])
    return np.vstack([upper, lower])


# ============================================================================
# 4.  Auto-select
# ============================================================================

_NACA_KEYS   = {"m", "p", "t"}
_CST_KEYS    = {"au", "al", "a_upper", "a_lower"}
_PARSEC_KEYS = {"rle", "xu", "xl", "xu_crest", "xl_crest",
                "zu", "zl", "zxxu", "zxxl"}


def _detect_method(params: dict) -> str:
    k = set(params.keys())
    if k & _NACA_KEYS:
        return "naca4"
    if k & _CST_KEYS:
        return "cst"
    if k & _PARSEC_KEYS:
        return "parsec"
    raise ValueError(
        f"[airfoil_generator] Cannot auto-detect method from params keys: {sorted(k)}\n"
        f"  NACA4  needs: m, p, t\n"
        f"  CST    needs: au, al\n"
        f"  PARSEC needs: rle, xu, xl, zu, zl, zxxu, zxxl, zte, dte, alpha_te, beta_te"
    )


def _build_coords(method: str, params: dict, n_points: int) -> np.ndarray:
    """
    Dispatch to the correct parameterisation and return Selig coords (N,2).
    """
    if method == "naca4":
        m = float(params.get("m", 0.0))
        p = float(params.get("p", 0.4))
        t = float(params.get("t", 0.12))
        return naca4_to_selig(m, p, t, n_points)

    elif method == "cst":
        au = np.asarray(params.get("au", params.get("a_upper")), dtype=float)
        al = np.asarray(params.get("al", params.get("a_lower")), dtype=float)
        zte = float(params.get("zte", 0.0))
        return cst_to_selig(au, al, n_points, zte)

    elif method == "parsec":
        keys = ["rle","xu","zu","zxxu","xl","zl","zxxl",
                "zte","dte","alpha_te","beta_te"]
        defaults = dict(rle=0.01, xu=0.3, zu=0.06, zxxu=-0.4,
                        xl=0.3, zl=-0.05, zxxl=0.4,
                        zte=0.0, dte=0.01, alpha_te=-0.05, beta_te=0.15)
        kw = {k: float(params.get(k, defaults[k])) for k in keys}
        return parsec_to_selig(**kw, n_points=n_points)

    else:
        raise ValueError(f"Unknown method: {method!r}")


# ============================================================================
# 5.  .dat writer
# ============================================================================

def write_dat(coords: np.ndarray, name: str, filepath: str) -> str:
    """
    Write Selig-format .dat file.

    Parameters
    ----------
    coords   : (N, 2) array -- Selig order (TE -> upper -> LE -> lower -> TE)
    name     : airfoil name written as the header line
    filepath : output file path (created or overwritten)

    Returns
    -------
    filepath
    """
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(f"{name}\n")
        for x, y in coords:
            f.write(f" {x:10.6f} {y:10.6f}\n")
    return filepath


# ============================================================================
# 6.  XFoil runner (wraps xfoilrun.runCustom)
# ============================================================================

def _run_xfoil(dat_path,
               reynolds    = 300_000,
               mach        = 0.0,
               alpha_start = -4.0,
               alpha_end   = 16.0,
               alpha_step  = 1.0,
               xfoil_path  = None,
               ncrit       = 4.0,
               xtr_top     = 0.3,
               xtr_bottom  = 0.3,
               iter_max    = 200):
    """
    Run XFoil on a single .dat file by delegating to xfoilrun.runMultiMachRe().

    runMultiMachRe() uses the proven working XFoil script order:
        LOAD -> PANE -> VPAR -> N -> XTR -> blank ->
        OPER -> MACH -> VISC -> ITER -> INIT ->
        PACC -> ASEQ -> PACC -> QUIT

    A single (mach, reynolds) pair is passed so the result is one polar
    DataFrame identical to what a direct XFoil run would produce.

    Parameters
    ----------
    dat_path    : full path to the .dat file
    reynolds    : Reynolds number
    mach        : Mach number
    alpha_start : AoA sweep start (deg)
    alpha_end   : AoA sweep end   (deg)
    alpha_step  : AoA sweep step  (deg)
    xfoil_path  : path to xfoil.exe  (or set XFOIL_PATH env var)
    ncrit       : XFoil Ncrit transition criterion  (default 9)
    xtr_top     : forced transition x/c upper surface (default 1.0 = free)
    xtr_bottom  : forced transition x/c lower surface (default 1.0 = free)
    iter_max    : Newton iteration limit  (default 200)

    Returns
    -------
    pd.DataFrame  columns: alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr,
                           airfoil, Re, Mach
    """
    import importlib

    # -- Resolve and register XFoil executable ----------------------------
    exe = _resolve_xfoil(xfoil_path)
    if exe is None:
        print("[airfoil_generator] XFoil not found -- skipping polar run.")
        print("  Pass xfoil_path= or set XFOIL_PATH env var.")
        return pd.DataFrame()

    os.environ["XFOIL_PATH"] = exe
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # -- Import xfoilrun and force reload so it picks up XFOIL_PATH -------
    try:
        from ...Data_Prep.Airfoil_Prediction_Dataset import XFOILRUN as xf
        importlib.reload(xf)
    except ImportError:
        print("[airfoil_generator] xfoilrun.py not found -- cannot run XFoil")
        return pd.DataFrame()

    # -- Patch xfoilrun internals before calling --------------------------
    # runMultiMachRe has hardcoded N 4 and XTR 0.05 0.05 in its script.
    # We monkey-patch the function to inject our ncrit/xtr/iter values
    # by wrapping _run_script so it rewrites those lines before sending.
    original_iter       = xf._DEFAULT_IT
    xf._DEFAULT_IT      = iter_max

    # Save original _run_script and _run_script_timeout
    _orig_run_script    = xf._run_script
    _orig_run_timeout   = xf._run_script_timeout

    def _patched_run_script(script):
        script = script.replace("N 4",           "N " + str(ncrit))
        script = script.replace("XTR 0.05 0.05", "XTR " + str(xtr_top)
                                                  + " " + str(xtr_bottom))
        return _orig_run_script(script)

    def _patched_run_timeout(script, timeout=60):
        script = script.replace("N 4",           "N " + str(ncrit))
        script = script.replace("XTR 0.05 0.05", "XTR " + str(xtr_top)
                                                  + " " + str(xtr_bottom))
        return _orig_run_timeout(script, timeout=timeout)

    xf._run_script         = _patched_run_script
    xf._run_script_timeout = _patched_run_timeout

    # -- Determine output folder ------------------------------------------
    out_dir = os.path.dirname(os.path.abspath(dat_path))
    t_path  = os.path.join(out_dir, "xfoil_tmp_")

    print("[airfoil_generator] XFoil exe  : " + exe)
    print("[airfoil_generator] dat file   : " + dat_path)
    print("[airfoil_generator] Re=" + str(int(reynolds)) +
          "  M=" + str(round(mach, 4)) +
          "  Ncrit=" + str(ncrit) +
          "  xtr=" + str(xtr_top) + "/" + str(xtr_bottom) +
          "  iter=" + str(iter_max))
    print("[airfoil_generator] sweep      : " +
          str(alpha_start) + " to " + str(alpha_end) +
          " step " + str(alpha_step) + " deg")
    print("[airfoil_generator] calling xfoilrun.runMultiMachRe() ...")

    # -- Call runMultiMachRe with single mach+re pair ---------------------
    try:
        df = xf.runmultiMachRe(
            airfoils        = [dat_path],
            d_path          = "run_output",
            t_path          = t_path,
            mach_list       = [mach],
            reynolds_list   = [reynolds],
            alpha_start     = alpha_start,
            alpha_end       = alpha_end,
            alpha_step      = alpha_step,
            xtr_top         = xtr_top,
            xtr_bottom      = xtr_bottom
        )
    except Exception as e:
        print("[airfoil_generator] runMultiMachRe() failed: " + str(e))
        df = pd.DataFrame()
    finally:
        xf._DEFAULT_IT         = original_iter
        xf._run_script         = _orig_run_script
        xf._run_script_timeout = _orig_run_timeout

    if df is None or len(df) == 0:
        print("[airfoil_generator] XFoil returned no data.")
        return pd.DataFrame()

    # -- Ensure Mach column is present ------------------------------------
    if "Mach" not in df.columns:
        df["Mach"] = mach

    print("[airfoil_generator] Polar OK: " + str(len(df)) + " rows  " +
          "CL=[" + str(round(df["CL"].min(), 3)) + "," +
          str(round(df["CL"].max(), 3)) + "]  " +
          "CD=[" + str(round(df["CD"].min(), 5)) + "," +
          str(round(df["CD"].max(), 5)) + "]")

    return df.reset_index(drop=True)


def _plot(coords:   np.ndarray,
          polar_df: pd.DataFrame,
          name:     str,
          method:   str,
          params:   dict,
          save_path: str = None) -> plt.Figure:
    """
    Two-panel figure:
      Left  -- airfoil shape with camber line (NACA4 only) and geometry labels
      Right -- polar plots: CL-alpha, CD-alpha, L/D-alpha, CL-CD
    """
    fig = plt.figure(figsize=(14, 7), facecolor="white")
    fig.suptitle(f"{name}  [{method.upper()}]", fontsize=13, fontweight="bold", y=0.98)

    gs  = gridspec.GridSpec(2, 3, figure=fig,
                            left=0.07, right=0.97,
                            top=0.91,  bottom=0.10,
                            wspace=0.38, hspace=0.45)

    ax_shape = fig.add_subplot(gs[:, 0])   # full left column
    ax_cl    = fig.add_subplot(gs[0, 1])
    ax_cd    = fig.add_subplot(gs[0, 2])
    ax_ld    = fig.add_subplot(gs[1, 1])
    ax_clcd  = fig.add_subplot(gs[1, 2])

    # -- Shape panel -------------------------------------------------------
    x_c = coords[:, 0]
    y_c = coords[:, 1]
    le  = np.argmin(x_c)

    ax_shape.plot(x_c[:le+1], y_c[:le+1], "b-", lw=1.5, label="upper")
    ax_shape.plot(x_c[le:],   y_c[le:],   "r-", lw=1.5, label="lower")
    ax_shape.plot([x_c[0], x_c[-1]], [y_c[0], y_c[-1]], "ko", ms=4, zorder=5)

    # Camber line (NACA4 only -- analytically exact)
    if method == "naca4":
        m = params.get("m", 0.0)
        p = params.get("p", 0.4)
        t = params.get("t", 0.12)
        x_lin = np.linspace(0, 1, 200)
        yc = np.zeros_like(x_lin)
        if m > 0 and p > 0:
            fwd        = x_lin < p
            yc[fwd]    = (m/p**2)     * (2*p*x_lin[fwd]  - x_lin[fwd]**2)
            yc[~fwd]   = (m/(1-p)**2) * ((1-2*p) + 2*p*x_lin[~fwd] - x_lin[~fwd]**2)
        ax_shape.plot(x_lin, yc, "g--", lw=1.0, alpha=0.7, label="camber")

    # Geometry annotation
    x_arr = coords[:, 0]
    y_arr = coords[:, 1]
    le_i  = np.argmin(x_arr)
    y_upper_max = y_arr[:le_i+1].max()
    y_lower_min = y_arr[le_i:].min()
    thickness   = y_upper_max - y_lower_min

    ax_shape.annotate("", xy=(0.5, y_upper_max), xytext=(0.5, y_lower_min),
                      arrowprops=dict(arrowstyle="<->", color="gray", lw=0.8))
    ax_shape.text(0.52, (y_upper_max + y_lower_min)/2,
                  f"t={thickness:.3f}c", fontsize=7.5, color="gray", va="center")

    ax_shape.set_xlim(-0.05, 1.10)
    ax_shape.set_aspect("equal")
    ax_shape.axhline(0, color="k", lw=0.4, ls="--", alpha=0.4)
    ax_shape.set_xlabel("x/c", fontsize=9)
    ax_shape.set_ylabel("y/c", fontsize=9)
    ax_shape.set_title("Airfoil shape", fontsize=9)
    ax_shape.legend(fontsize=7.5, loc="upper right")
    ax_shape.tick_params(labelsize=8)

    # Parameter box
    if method == "naca4":
        pstr = f"m={params.get('m',0):.3f}  p={params.get('p',0):.2f}  t={params.get('t',0):.3f}"
    elif method == "cst":
        n = len(params.get("au", []))
        pstr = f"CST order {n-1}  zte={params.get('zte',0):.4f}"
    else:
        pstr = f"rle={params.get('rle',0):.4f}  xu={params.get('xu',0):.3f}"
    ax_shape.text(0.02, 0.04, pstr, transform=ax_shape.transAxes,
                  fontsize=7.0, color="#555", va="bottom")

    # -- Polar panels ------------------------------------------------------
    def _polar_axes(ax, xlabel, ylabel, title):
        ax.set_xlabel(xlabel, fontsize=8)
        ax.set_ylabel(ylabel, fontsize=8)
        ax.set_title(title,   fontsize=8.5)
        ax.tick_params(labelsize=7.5)
        ax.grid(True, lw=0.4, alpha=0.5)

    if polar_df is not None and len(polar_df) > 0:
        a  = polar_df["alpha"]
        cl = polar_df["CL"]
        cd = polar_df["CD"]
        ld = cl / cd.clip(1e-9)

        # CL vs alpha -- mark stall
        ax_cl.plot(a, cl, "b-o", ms=3, lw=1.2)
        stall_idx = cl.idxmax()
        ax_cl.axvline(a[stall_idx], color="r", lw=0.8, ls="--", alpha=0.7,
                      label=f"stall alpha={a[stall_idx]:.1f} deg")
        ax_cl.legend(fontsize=6.5)
        _polar_axes(ax_cl, "alpha ( deg)", "CL", "Lift curve")

        # CD vs alpha
        ax_cd.plot(a, cd*1e4, "r-o", ms=3, lw=1.2)
        _polar_axes(ax_cd, "alpha ( deg)", "CD ? 10?", "Drag")

        # L/D vs alpha -- mark peak
        ax_ld.plot(a, ld, "g-o", ms=3, lw=1.2)
        ld_peak = ld.idxmax()
        ax_ld.axvline(a[ld_peak], color="purple", lw=0.8, ls="--", alpha=0.7,
                      label=f"peak alpha={a[ld_peak]:.1f} deg")
        ax_ld.legend(fontsize=6.5)
        _polar_axes(ax_ld, "alpha ( deg)", "L/D", "Lift-to-drag")

        # Drag polar (CL vs CD)
        ax_clcd.plot(cd*1e4, cl, "k-o", ms=3, lw=1.2)
        _polar_axes(ax_clcd, "CD ? 10?", "CL", "Drag polar")

    else:
        for ax in [ax_cl, ax_cd, ax_ld, ax_clcd]:
            ax.text(0.5, 0.5, "XFoil not run\nor no data",
                    ha="center", va="center", transform=ax.transAxes,
                    fontsize=8, color="gray")

    if save_path:
        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"[airfoil_generator] Plot saved: {save_path}")

    return fig


# ============================================================================
# 8.  Main public function
# ============================================================================

def generate(params:      dict,
             name:        str   = "airfoil",
             method:      str   = "auto",
             n_points:    int   = 100,
             reynolds:    float = 300_000,
             mach:        float = 0.0,
             alpha_start: float = -4.0,
             alpha_end:   float = 16.0,
             alpha_step:  float = 1.0,
             output_dir:  str   = "generated",
             run_xfoil:   bool  = True,
             plot:        bool  = True,
             show_plot:   bool  = False,
             xfoil_path:  str   = None) -> dict:
    """
    Generate an airfoil, run XFoil, and produce a shape + polar plot.

    Parameters
    ----------
    params      : geometry parameters (see module docstring for each method)
    name        : airfoil name -- used for the .dat filename and plot title
    method      : "auto" | "naca4" | "cst" | "parsec"
    n_points    : coordinate points per surface (default 100)
    reynolds    : Reynolds number for XFoil run
    mach        : Mach number for XFoil run
    alpha_start : AoA sweep start (degrees)
    alpha_end   : AoA sweep end   (degrees)
    alpha_step  : AoA sweep step  (degrees)
    output_dir  : folder to write .dat and .png files
    run_xfoil   : whether to run XFoil  (default True)
    plot        : whether to produce a figure (default True)
    show_plot   : whether to call plt.show() (default False -- save only)
    xfoil_path  : full path to xfoil.exe  e.g. r"C:\\XFoil\\xfoil.exe"
                  If None, falls back to XFOIL_PATH env var, then system PATH.

    Returns
    -------
    dict with keys:
        "name"      : str           airfoil name
        "method"    : str           parameterisation used
        "coords"    : np.ndarray    Selig coordinates (N, 2)
        "dat_path"  : str           path to written .dat file
        "polar"     : pd.DataFrame  XFoil polar (empty if run_xfoil=False)
        "fig"       : plt.Figure    matplotlib figure (None if plot=False)
        "plot_path" : str           path to saved .png (None if plot=False)
        "params"    : dict          params as passed
    """

    # -- Auto-detect method ------------------------------------------------
    if method == "auto":
        method = _detect_method(params)
    print(f"[airfoil_generator] Method: {method.upper()}   name: {name}")

    # -- Build coordinates -------------------------------------------------
    coords = _build_coords(method, params, n_points)
    print(f"[airfoil_generator] Coordinates: {len(coords)} points")

    # Sanity check -- x range should be ~[0, 1]
    x_min, x_max = coords[:, 0].min(), coords[:, 0].max()
    if x_max > 1.05 or x_min < -0.01:
        print(f"[airfoil_generator] WARNING: unusual x range "
              f"[{x_min:.4f}, {x_max:.4f}] -- check parameters")

    # -- Write .dat --------------------------------------------------------
    os.makedirs(output_dir, exist_ok=True)
    dat_path  = os.path.join(output_dir, f"{name}.dat")
    write_dat(coords, name, dat_path)
    print(f"[airfoil_generator] .dat written: {dat_path}")

    # -- Run XFoil ---------------------------------------------------------
    polar_df = pd.DataFrame()
    if run_xfoil:
        exe = _resolve_xfoil(xfoil_path)
        if exe:
            print(f"[airfoil_generator] XFoil executable : {exe}")
            print(f"[airfoil_generator] Running XFoil  "
                  f"Re={reynolds:.0f}  M={mach:.3f}  "
                  f"alpha={alpha_start} deg to {alpha_end} deg  step={alpha_step} deg")
            polar_df = _run_xfoil(
                dat_path    = dat_path,
                reynolds    = reynolds,
                mach        = mach,
                alpha_start = alpha_start,
                alpha_end   = alpha_end,
                alpha_step  = alpha_step,
                xfoil_path  = xfoil_path,
            )
            if len(polar_df):
                print(f"[airfoil_generator] Polar: {len(polar_df)} alpha points  "
                      f"CL=[{polar_df['CL'].min():.3f}, {polar_df['CL'].max():.3f}]  "
                      f"CD=[{polar_df['CD'].min():.5f}, {polar_df['CD'].max():.5f}]")
            else:
                print("[airfoil_generator] XFoil returned no data")
        else:
            print("[airfoil_generator] XFoil not found.\n"
                  "  Pass xfoil_path=r'C:\\XFoil\\xfoil.exe'  OR\n"
                  "  set environment variable XFOIL_PATH=C:\\XFoil\\xfoil.exe")

    # -- Plot --------------------------------------------------------------
    fig        = None
    plot_path  = None
    if plot:
        plot_path = os.path.join(output_dir, f"{name}_plot.png")
        fig = _plot(coords, polar_df if len(polar_df) else None,
                    name, method, params, save_path=plot_path)
        if show_plot:
            plt.show()

    return {
        "name":      name,
        "method":    method,
        "coords":    coords,
        "dat_path":  dat_path,
        "polar":     polar_df,
        "fig":       fig,
        "plot_path": plot_path,
        "params":    params,
    }


# ============================================================================
# 9.  CLI
# ============================================================================

if __name__ == "__main__":
    """
    Quick self-test -- generates one of each method, writes .dat, plots shape.
    Does NOT require XFoil to be installed.
    """
    import argparse

    parser = argparse.ArgumentParser(description="Airfoil generator self-test")
    parser.add_argument("--method", choices=["naca4","cst","parsec","all"],
                        default="all")
    parser.add_argument("--re", type=float, default=300_000)
    parser.add_argument("--outdir", default="generated")
    args = parser.parse_args()

    methods = ["naca4","cst","parsec"] if args.method == "all" else [args.method]

    test_params = {
        "naca4": {"m": 0.04, "p": 0.40, "t": 0.12},
        "cst":   {
            "au": [0.170, 0.290, 0.200, 0.155, 0.115, 0.095],
            "al": [-0.140,-0.100,-0.070,-0.050,-0.038,-0.028],
        },
        "parsec": {
            "rle": 0.0110, "xu": 0.300, "zu":  0.065, "zxxu": -0.40,
            "xl":  0.300,  "zl": -0.050,"zxxl":  0.40,
            "zte": 0.0,    "dte": 0.010,"alpha_te": -0.05, "beta_te": 0.15,
        },
    }

    for m in methods:
        r = generate(
            params      = test_params[m],
            name        = f"test_{m}",
            method      = m,
            reynolds    = args.re,
            output_dir  = args.outdir,
            run_xfoil   = _xfoil_available(),
            plot        = True,
            show_plot   = False,
        )
        print(f"  -> dat:  {r['dat_path']}")
        print(f"  -> plot: {r['plot_path']}")
        print()