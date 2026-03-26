"""
INTERFACE.py
=================
Top-level entry point.  You supply a mission dict -- this script outputs
everything: airfoil generation, XFoil polars, ML training (or model load),
optimisation, full geometry synthesis, and a final report.

Workflow
--------
    mission dict
        |
        +- [optional] generate airfoils via airfoilgenerator
        +- [optional] train ML model  OR  load existing uav_model.pkl
        +- [optional] optimise geometry via airfoiloptimizer
        +- full geometry synthesis  (wing + tail + fuselage + propulsion)
        +- print report  +  save outputs

Quick start -- run directly
--------------------------
    python INTERFACE.py

Quick start -- import API
------------------------
    from INTERFACE import run_mission

    result = run_mission({
        "payload_kg"   : 30.0,
        "reynolds"     : 300_000,
        "mach"         : 0.0,
        "alpha"        : 4.0,
        "cruise_speed" : 18.0,
        "altitude_m"   : 500.0,

        "airfoil_method" : "naca4",
        "xfoil_path"     : r"C:\\XFoil\\xfoil.exe",
        "model_path"     : "uav_model.pkl",
        "retrain"        : False,

        "optimize"       : True,
        "optimizer"      : "bayesian",
        "objective"      : "breguet",
        "n_calls"        : 40,

        "output_dir"     : "mission_output",
    })

    print(result["summary"])
    print(result["geometry"])
"""

import os
import sys
import json
import time
import warnings
import argparse

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

# Add current directory to path so sibling modules are found
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# =============================================================================
# 1.  MISSION DEFAULTS
# =============================================================================

_MISSION_DEFAULTS = {
    # -- Payload & flight condition -----------------------------------------
    "payload_kg"     : 30.0,       # payload mass (kg)
    "payload_frac"   : 0.28,       # payload / MTOW structural fraction
    "reynolds"       : 300_000,    # cruise Reynolds number
    "mach"           : 0.0,        # cruise Mach number
    "alpha"          : 4.0,        # design angle of attack (deg)
    "cruise_speed"   : 18.0,       # cruise airspeed (m/s)
    "altitude_m"     : 500.0,      # cruise altitude (m) -- informational

    # -- Airfoil sweep ------------------------------------------------------
    "alpha_start"    : -2.0,       # XFoil sweep start (deg)
    "alpha_end"      : 16.0,       # XFoil sweep end   (deg)
    "alpha_step"     :  1.0,       # XFoil sweep step  (deg)

    # -- Airfoil choice -----------------------------------------------------
    "airfoil_method" : "naca4",    # "naca4" | "cst" | "parsec"
    # Geometry params -- used when use_generator=True
    # If None, a sensible default per method is used
    "airfoil_params" : None,

    # -- Geometry synthesis -------------------------------------------------
    "AR"             : 10.0,       # wing aspect ratio
    "taper"          : 0.45,       # wing taper ratio
    "fuse_frac"      : 0.60,       # fuselage length / wingspan

    # -- XFoil -------------------------------------------------------------
    "xfoil_path"     : None,       # path to xfoil.exe
    "use_generator"  : True,       # generate .dat and polar from params

    # -- ML model ----------------------------------------------------------
    "model_path"     : "uav_model.pkl",
    "retrain"        : False,      # True = always retrain; False = load pkl

    # -- Optimisation ------------------------------------------------------
    "optimize"       : True,      # True = run airfoiloptimizer
    "optimizer"      : "bayesian", # "bayesian" | "genetic"
    "objective"      : "breguet",  # "breguet" | "max_LD" | "max_CL" | "min_CD"
    "n_calls"        : 40,         # optimiser evaluation budget
    "n_init"         : 10,         # Bayesian: random init samples
    "pop_size"       : 20,         # Genetic:  population size

    # -- I/O ---------------------------------------------------------------
    "output_dir"     : "mission_output",
    "polar_source"   : None,       # path to existing polar folder/file
                                   # (used when use_generator=False)
    "geometry_map"   : None,       # {name:{camber,thickness}} for polar_source
    "verbose"        : True,
}

# ISA constants
_RHO0 = 1.225    # kg/m3  sea level density
_T0   = 288.15   # K      sea level temperature
_L    = 0.0065   # K/m    lapse rate
_G    = 9.81     # m/s2
_R    = 287.05   # J/(kg?K)
_MU   = 1.789e-5 # Pa?s


def _isa_density(altitude_m: float) -> float:
    """Return ISA air density at given altitude (m)."""
    T   = _T0 - _L * altitude_m
    p   = 101325.0 * (T / _T0) ** (_G / (_L * _R))
    rho = p / (_R * T)
    return rho


# =============================================================================
# 2.  GEOMETRY SYNTHESIS  (wing + tail + fuselage + propulsion)
# =============================================================================

def geometry_synthesis(CL_op: float,
                       V:     float,
                       mission: dict) -> dict:
    """
    Full first-order UAV geometry synthesis from aerodynamic operating point.

    Inputs
    ------
    CL_op   : operating lift coefficient at cruise
    V       : cruise airspeed (m/s)
    mission : mission dict (uses payload_kg, AR, taper, fuse_frac, altitude_m)

    Outputs
    -------
    dict -- complete geometry with wing, tail, fuselage, propulsion fields
    """
    alt          = float(mission.get("altitude_m",   500.0))
    rho          = _isa_density(alt)
    payload_kg   = float(mission.get("payload_kg",    30.0))
    payload_frac = float(mission.get("payload_frac",   0.28))
    AR           = float(mission.get("AR",            10.0))
    taper        = float(mission.get("taper",          0.45))
    fuse_frac    = float(mission.get("fuse_frac",      0.60))

    # -- Mass -------------------------------------------------------------
    MTOW_kg = payload_kg / payload_frac
    W_N     = MTOW_kg * _G

    # -- Wing -------------------------------------------------------------
    q       = 0.5 * rho * V ** 2
    S       = W_N / (q * max(CL_op, 0.05))
    b       = np.sqrt(AR * S)
    c_mean  = S / b
    Re_c    = rho * V * c_mean / _MU
    c_root  = 2.0 * c_mean / (1.0 + taper)
    c_tip   = taper * c_root

    # Sweep angle estimate (keep tip Mach < 0.85 * freestream Mach)
    sweep_deg = 0.0  # straight wing for low-speed UAV default

    # -- Tail (tail volume coefficient method) -----------------------------
    l_tail  = 0.50 * b                         # tail moment arm ? 50% span
    S_h     = 0.35 * S * c_mean / l_tail       # horizontal tail  (V_h = 0.35)
    S_v     = 0.04 * S * b      / l_tail       # vertical tail    (V_v = 0.04)
    AR_ht   = 4.0;  AR_vt = 1.5
    b_h     = np.sqrt(AR_ht * S_h)
    b_v     = np.sqrt(AR_vt * S_v)
    c_h     = S_h / b_h                        # HT mean chord
    c_v     = S_v / b_v                        # VT mean chord

    # -- Fuselage ----------------------------------------------------------
    l_fus   = fuse_frac * b
    d_fus   = max(0.08, 0.012 * b)             # rough diameter from span
    vol_pay = payload_kg / 300.0               # payload volume estimate (m3)
                                               # assumes ~300 kg/m3 payload density

    # -- Propulsion (actuator disk approximation) --------------------------
    # At cruise, thrust ? drag.  At max climb, thrust ? weight.
    # Loiter: T ? W / (L/D)  -- use conservative L/D = 10
    LD_est  = 12.0                             # conservative cruise L/D
    T_cruise= W_N / LD_est
    T_max   = 1.3 * W_N                       # ~1.3g climb thrust
    d_prop  = 0.20 * b                         # heuristic: 20% of span

    # Motor / ESC estimate  (P = T * v_exit, disk loading ~200 N/m2)
    disk_load = 200.0
    A_disk    = T_max / disk_load
    d_disk    = np.sqrt(4.0 * A_disk / np.pi)  # minimum disk diameter
    v_exit    = np.sqrt(2.0 * T_max / (rho * A_disk))
    P_motor   = 0.5 * rho * A_disk * v_exit ** 3  # shaft power estimate (W)

    return {
        # Mass
        "payload_kg"    : round(payload_kg,   2),
        "MTOW_kg"       : round(MTOW_kg,      2),
        "payload_frac"  : round(payload_frac, 3),
        # Flight condition
        "altitude_m"    : round(alt,          1),
        "rho_kgm3"      : round(rho,          4),
        "V_ms"          : round(V,            2),
        "V_kmh"         : round(V * 3.6,      1),
        "q_Pa"          : round(q,            2),
        "CL_op"         : round(CL_op,        4),
        "Re_chord_k"    : round(Re_c / 1e3,   1),
        # Wing
        "S_m2"          : round(S,            3),
        "AR"            : round(AR,           2),
        "wingspan_m"    : round(b,            3),
        "c_mean_m"      : round(c_mean,       3),
        "c_root_m"      : round(c_root,       3),
        "c_tip_m"       : round(c_tip,        3),
        "taper"         : round(taper,        3),
        "sweep_deg"     : round(sweep_deg,    1),
        # Tail
        "S_h_m2"        : round(S_h,          3),
        "S_v_m2"        : round(S_v,          3),
        "b_h_m"         : round(b_h,          3),
        "b_v_m"         : round(b_v,          3),
        "c_h_m"         : round(c_h,          3),
        "c_v_m"         : round(c_v,          3),
        "l_tail_m"      : round(l_tail,       3),
        # Fuselage
        "l_fus_m"       : round(l_fus,        3),
        "d_fus_m"       : round(d_fus,        3),
        "vol_payload_m3": round(vol_pay,      4),
        # Propulsion
        "T_cruise_N"    : round(T_cruise,     2),
        "T_max_N"       : round(T_max,        2),
        "d_prop_m"      : round(d_prop,       3),
        "d_disk_min_m"  : round(d_disk,       3),
        "P_motor_W"     : round(P_motor,      1),
    }


# =============================================================================
# 3.  REPORT PRINTER
# =============================================================================

def _print_report(mission: dict, aero: dict, geo: dict,
                  best_params: dict = None, best_score: float = None,
                  opt_method: str = None, objective: str = None):
    """Print a formatted mission-to-UAV report to stdout."""
    sep  = "=" * 64
    dash = "-" * 64

    print(f"\n{sep}")
    print("  MISSION -> UAV  FULL DESIGN REPORT")
    print(sep)

    print(f"\n  MISSION INPUTS")
    print(dash)
    print(f"    Payload          : {mission['payload_kg']:.1f} kg")
    print(f"    Payload Fraction : {mission['payload_frac']:.2f}")
    print(f"    Reynolds Number  : {mission['reynolds']:.0f}")
    print(f"    Mach Number      : {mission['mach']:.3f}")
    print(f"    Design AoA       : {mission['alpha']:.1f} deg")
    print(f"    Cruise Speed     : {mission['cruise_speed']:.1f} m/s  "
          f"({mission['cruise_speed']*3.6:.1f} km/h)")
    print(f"    Altitude         : {mission['altitude_m']:.0f} m")

    if best_params is not None:
        print(f"\n  OPTIMISED AIRFOIL  [{opt_method.upper()}]  "
              f"objective={objective}")
        print(dash)
        for k, v in best_params.items():
            if isinstance(v, (list, np.ndarray)):
                print(f"    {k:<12}: {[round(float(x),4) for x in v]}")
            else:
                print(f"    {k:<12}: {float(v):.6f}")
        print(f"    Best score       : {best_score:.6f}  ({objective})")

    print(f"\n  AERODYNAMIC PERFORMANCE  (ML prediction at design AoA)")
    print(dash)
    print(f"    CL               : {aero.get('CL_pred', aero.get('CL', 0)):.5f}")
    print(f"    CD               : {aero.get('CD_pred', aero.get('CD', 0)):.6f}")
    print(f"    L/D              : {aero.get('LD_pred', aero.get('LD', 0)):.3f}")
    print(f"    Breguet factor   : {aero.get('breguet_pred', aero.get('breguet', 0)):.4f}")
    print(f"    CM               : {aero.get('CM_pred', aero.get('CM', 0)):.5f}")

    print(f"\n  GEOMETRY SYNTHESIS")
    print(dash)
    print(f"    MASS")
    print(f"      Payload        : {geo['payload_kg']:.2f} kg")
    print(f"      MTOW           : {geo['MTOW_kg']:.2f} kg")
    print(f"    FLIGHT CONDITION")
    print(f"      Altitude       : {geo['altitude_m']:.0f} m  "
          f"(rho={geo['rho_kgm3']:.4f} kg/m3)")
    print(f"      Speed          : {geo['V_ms']:.2f} m/s  ({geo['V_kmh']:.1f} km/h)")
    print(f"      Dyn. Pressure  : {geo['q_Pa']:.2f} Pa")
    print(f"      Operating CL   : {geo['CL_op']:.4f}")
    print(f"      Re at chord    : {geo['Re_chord_k']:.1f} k")
    print(f"    WING PLANFORM")
    print(f"      Wing Area      : {geo['S_m2']:.3f} m2")
    print(f"      Aspect Ratio   : {geo['AR']:.2f}")
    print(f"      Wingspan       : {geo['wingspan_m']:.3f} m")
    print(f"      Mean Chord     : {geo['c_mean_m']:.3f} m")
    print(f"      Root Chord     : {geo['c_root_m']:.3f} m")
    print(f"      Tip Chord      : {geo['c_tip_m']:.3f} m")
    print(f"      Taper Ratio    : {geo['taper']:.3f}")
    print(f"      Sweep Angle    : {geo['sweep_deg']:.1f} deg")
    print(f"    TAIL SURFACES")
    print(f"      H-Tail Area    : {geo['S_h_m2']:.3f} m2")
    print(f"      H-Tail Span    : {geo['b_h_m']:.3f} m")
    print(f"      H-Tail Chord   : {geo['c_h_m']:.3f} m")
    print(f"      V-Tail Area    : {geo['S_v_m2']:.3f} m2")
    print(f"      V-Tail Span    : {geo['b_v_m']:.3f} m")
    print(f"      V-Tail Chord   : {geo['c_v_m']:.3f} m")
    print(f"      Tail Arm       : {geo['l_tail_m']:.3f} m")
    print(f"    FUSELAGE")
    print(f"      Length         : {geo['l_fus_m']:.3f} m")
    print(f"      Diameter       : {geo['d_fus_m']:.3f} m")
    print(f"      Payload Volume : {geo['vol_payload_m3']:.4f} m3")
    print(f"    PROPULSION")
    print(f"      Cruise Thrust  : {geo['T_cruise_N']:.2f} N")
    print(f"      Max Thrust     : {geo['T_max_N']:.2f} N")
    print(f"      Propeller Diam : {geo['d_prop_m']:.3f} m")
    print(f"      Min Disk Diam  : {geo['d_disk_min_m']:.3f} m")
    print(f"      Motor Power    : {geo['P_motor_W']:.1f} W")
    print(f"\n{sep}")
    print("  DONE")
    print(sep)


# =============================================================================
# 4.  MAIN PIPELINE FUNCTION
# =============================================================================

def generate_and_predict(mission: dict, bundle: dict) -> dict:
    """
    Generate airfoil, run XFoil, predict aero with ML, save final report.

    Model load, optimisation, and geometry synthesis are handled by
    POST_TRAIN.py which calls this function with a pre-loaded bundle.

    Parameters
    ----------
    mission : dict  -- flight condition and airfoil parameters.
                       Uses _MISSION_DEFAULTS for any missing keys.
    bundle  : dict  -- pre-loaded model bundle from joblib.load(model_path).
                       Must contain: models, scaler, FEAT, TGTS.

    Returns
    -------
    dict with keys:
        mission        : final mission dict (with defaults filled in)
        gen_result     : generate() output  (coords, polar, .dat path, fig)
        polar_df       : raw XFoil polar DataFrame
        pred_df        : full prediction DataFrame (all alpha points)
        aero           : prediction dict at design AoA
        report_path    : path to saved mission_report.txt
    """

    # -- Fill defaults -----------------------------------------------------
    m = {**_MISSION_DEFAULTS, **mission}

    output_dir = m["output_dir"]
    os.makedirs(output_dir, exist_ok=True)
    verbose = m["verbose"]
    t0      = time.time()

    # -- Step 1: resolve airfoil params ------------------------------------
    method = m["airfoil_method"]
    params = m["airfoil_params"]

    if params is None:
        if method == "naca4":
            params = {"m": 0.04, "p": 0.40, "t": 0.12}
        elif method == "cst":
            from GENERATOR import naca4_to_cst_weights
            au, al = naca4_to_cst_weights(0.04, 0.40, 0.12, n_cst=6)
            params = {"au": au.tolist(), "al": al.tolist()}
        elif method == "parsec":
            params = {
                "rle": 0.011, "xu": 0.30, "zu": 0.065, "zxxu": -0.40,
                "xl":  0.30,  "zl":-0.050,"zxxl":  0.40,
                "zte": 0.0,  "dte": 0.010,"alpha_te":-0.05,"beta_te":0.15,
            }
        m["airfoil_params"] = params

    if verbose:
        print(f"\n[INPUT_OUTPUT] {'='*50}")
        print(f"[INPUT_OUTPUT] GENERATE + PREDICT")
        print(f"[INPUT_OUTPUT] Payload    : {m['payload_kg']} kg")
        print(f"[INPUT_OUTPUT] Reynolds   : {m['reynolds']:.0f}")
        print(f"[INPUT_OUTPUT] Mach       : {m['mach']}")
        print(f"[INPUT_OUTPUT] Design AoA : {m['alpha']} deg")
        print(f"[INPUT_OUTPUT] Method     : {method.upper()}")
        print(f"[INPUT_OUTPUT] {'='*50}\n")

    # -- Step 2: generate airfoil + XFoil polar ----------------------------
    from GENERATOR import generate

    if verbose:
        print(f"[INPUT_OUTPUT] [1/3] Generating airfoil ({method.upper()})...")

    gen_result = generate(
        params      = params,
        name        = f"mission_{method}",
        reynolds    = m["reynolds"],
        mach        = m["mach"],
        alpha_start = m["alpha_start"],
        alpha_end   = m["alpha_end"],
        alpha_step  = m["alpha_step"],
        output_dir  = output_dir,
        run_xfoil   = m["use_generator"],
        xfoil_path  = m["xfoil_path"],
        plot        = True,
        show_plot   = False,
    )

    polar_df = gen_result["polar"]
    if verbose:
        if len(polar_df):
            print(f"    XFoil OK : {len(polar_df)} alpha points  "
                  f"CL=[{polar_df['CL'].min():.3f},{polar_df['CL'].max():.3f}]  "
                  f"CD=[{polar_df['CD'].min():.5f},{polar_df['CD'].max():.5f}]")
            print(f"    Airfoil plot : {gen_result['plot_path']}")
        else:
            print("    WARNING: XFoil returned no polar data")

    # -- Step 3: ML prediction at design AoA -------------------------------
    aero    = {}
    pred_df = pd.DataFrame()

    if bundle is not None and len(polar_df):
        if verbose:
            print(f"\n[INPUT_OUTPUT] [2/3] ML prediction "
                  f"(alpha={m['alpha']} deg  Re={m['reynolds']:.0f})...")

        from POLARPARSE import polar_df_to_train

        if method == "naca4":
            geom = {f"mission_{method}": {
                "camber":    params.get("m", 0.0),
                "thickness": params.get("t", 0.12),
            }}
        else:
            geom = {f"mission_{method}": {"camber": 0.04, "thickness": 0.12}}

        df_feat = polar_df_to_train(polar_df, geometry=geom)

        FEAT   = bundle["FEAT"]
        TGTS   = bundle["TGTS"]
        scaler = bundle["scaler"]

        for f in FEAT:
            if f not in df_feat.columns:
                df_feat[f] = 0.0

        X_s   = scaler.transform(df_feat[FEAT].values)
        preds = {}
        for tgt in TGTS:
            preds[tgt] = (0.60 * bundle["models"][tgt]["rf"].predict(X_s)
                        + 0.40 * bundle["models"][tgt]["gb"].predict(X_s))

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

        idx  = (pred_df["alpha"] - m["alpha"]).abs().idxmin()
        aero = pred_df.loc[idx].to_dict()

        if verbose:
            print(f"    CL={aero['CL_pred']:.4f}  "
                  f"CD={aero['CD_pred']:.6f}  "
                  f"L/D={aero['LD_pred']:.2f}  "
                  f"breguet={aero['breguet_pred']:.3f}")
    else:
        if verbose and bundle is None:
            print("[INPUT_OUTPUT] No bundle provided -- skipping ML prediction")

    # -- Step 4: save report -----------------------------------------------
    if verbose:
        print(f"\n[INPUT_OUTPUT] [3/3] Saving report...")

    report_lines = [
        "=" * 60,
        "  INPUT_OUTPUT -- GENERATE + PREDICT REPORT",
        "=" * 60,
        "",
        "  MISSION",
        f"    Payload        : {m['payload_kg']:.1f} kg",
        f"    Reynolds       : {m['reynolds']:.0f}",
        f"    Mach           : {m['mach']:.4f}",
        f"    Design AoA     : {m['alpha']:.1f} deg",
        f"    Cruise Speed   : {m['cruise_speed']:.1f} m/s",
        f"    Altitude       : {m['altitude_m']:.0f} m",
        "",
        "  AIRFOIL GENERATED",
        f"    Method         : {method.upper()}",
        f"    Params         : {params}",
        f"    .dat file      : {gen_result.get('dat_path', 'N/A')}",
        f"    Shape plot     : {gen_result.get('plot_path', 'N/A')}",
        f"    XFoil rows     : {len(polar_df)}",
    ]

    if aero:
        report_lines += [
            "",
            "  ML PREDICTION  (at design AoA)",
            f"    CL             : {aero.get('CL_pred', 0):.5f}",
            f"    CD             : {aero.get('CD_pred', 0):.6f}",
            f"    L/D            : {aero.get('LD_pred', 0):.3f}",
            f"    Breguet        : {aero.get('breguet_pred', 0):.4f}",
            f"    CM             : {aero.get('CM_pred', 0):.5f}",
            f"    Stalled        : {bool(aero.get('is_stalled', 0))}",
        ]

    if len(pred_df):
        report_lines += [
            "",
            "  FULL POLAR PREDICTION",
            f"    {'alpha':>6}  {'CL_pred':>8}  {'CD_pred':>10}  "
            f"{'L/D':>8}  {'breguet':>9}  {'stall':>6}",
            "    " + "-" * 60,
        ]
        for _, row in pred_df.iterrows():
            mk = " <STALL" if row["is_stalled"] else ""
            report_lines.append(
                f"    {row['alpha']:>6.1f}  {row['CL_pred']:>8.4f}  "
                f"{row['CD_pred']:>10.6f}  {row['LD_pred']:>8.3f}  "
                f"{row['breguet_pred']:>9.4f}{mk}"
            )

    t_total = time.time() - t0
    report_lines += [
        "",
        f"  Elapsed : {t_total:.1f} s",
        "=" * 60,
        "  NOTE: Geometry synthesis and optimisation results are in",
        "        the POST_TRAIN report (post_train_report.txt).",
        "=" * 60,
    ]

    report = "\n".join(report_lines)
    print("\n" + report)

    report_path = os.path.join(output_dir, "mission_report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    if verbose:
        print(f"\n[INPUT_OUTPUT] Report saved : {report_path}")
        print(f"[INPUT_OUTPUT] Total time   : {t_total:.1f} s")

    return {
        "mission"    : m,
        "gen_result" : gen_result,
        "polar_df"   : polar_df,
        "pred_df"    : pred_df,
        "aero"       : aero,
        "report_path": report_path,
    }


# keep backward-compatible alias so existing callers don't break
def run_mission(mission: dict) -> dict:
    """
    Backward-compatible wrapper.
    Loads the model from mission['model_path'] then calls generate_and_predict().
    For new code use POST_TRAIN.run() which pre-loads the bundle once and
    also handles optimisation + geometry synthesis.
    """
    import joblib
    model_path = mission.get("model_path", "uav_model.pkl")
    bundle = None
    if os.path.isfile(model_path):
        bundle = joblib.load(model_path)
    else:
        print(f"[INPUT_OUTPUT] WARNING: model not found at {model_path!r} "
              "-- prediction skipped")
    return generate_and_predict(mission, bundle)


# =============================================================================
# 5.  CLI
# =============================================================================

if __name__ == "__main__":
    ap = argparse.ArgumentParser(
        description="INTERFACE -- full UAV design pipeline from mission dict",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    ap.add_argument("--payload",    type=float, default=30.0,
                    help="Payload mass (kg)")
    ap.add_argument("--reynolds",   type=float, default=300_000,
                    help="Cruise Reynolds number")
    ap.add_argument("--mach",       type=float, default=0.0,
                    help="Cruise Mach number")
    ap.add_argument("--alpha",      type=float, default=4.0,
                    help="Design angle of attack (deg)")
    ap.add_argument("--speed",      type=float, default=18.0,
                    help="Cruise airspeed (m/s)")
    ap.add_argument("--altitude",   type=float, default=500.0,
                    help="Cruise altitude (m)")
    ap.add_argument("--method",     default="naca4",
                    choices=["naca4","cst","parsec"],
                    help="Airfoil parameterisation")
    ap.add_argument("--xfoil",      default=None,
                    help="Full path to xfoil.exe")
    ap.add_argument("--model",      default="uav_model.pkl",
                    help="Path to trained model .pkl")
    ap.add_argument("--retrain",    action="store_true",
                    help="Force model retrain (runs uav_xfoil_ml.py)")
    ap.add_argument("--optimize",   action="store_true",
                    help="Run airfoil optimisation loop")
    ap.add_argument("--optimizer",  default="bayesian",
                    choices=["bayesian","genetic"])
    ap.add_argument("--objective",  default="breguet",
                    choices=["breguet","max_LD","max_CL","min_CD"])
    ap.add_argument("--n_calls",    type=int, default=30,
                    help="Optimiser evaluation budget")
    ap.add_argument("--AR",         type=float, default=10.0,
                    help="Wing aspect ratio")
    ap.add_argument("--outdir",     default="mission_output",
                    help="Output folder")
    args = ap.parse_args()

    result = run_mission({
        "payload_kg"     : args.payload,
        "reynolds"       : args.reynolds,
        "mach"           : args.mach,
        "alpha"          : args.alpha,
        "cruise_speed"   : args.speed,
        "altitude_m"     : args.altitude,
        "airfoil_method" : args.method,
        "xfoil_path"     : args.xfoil,
        "model_path"     : args.model,
        "retrain"        : args.retrain,
        "optimize"       : args.optimize,
        "optimizer"      : args.optimizer,
        "objective"      : args.objective,
        "n_calls"        : args.n_calls,
        "AR"             : args.AR,
        "output_dir"     : args.outdir,
    })