"""
POST_TRAIN.py
=============
Orchestrator — run this after TRAIN.py has saved uav_model.pkl.

This file is the single bridge between TRAIN.py and INTERFACE.py.
It does NOT duplicate predict/size/report logic — all of that lives in
INTERFACE.run_mission() which is called here.

Pipeline
--------
  TRAIN.py          -> uav_model.pkl            (run once)
  POST_TRAIN.py     -> loads model, validates,
                       calls INTERFACE.run_mission()   (run per mission)
  INTERFACE.py      -> generate + XFoil + predict + optimise + geometry + report

Run
---
  python POST_TRAIN.py
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# =============================================================================
# CONFIG  <-- USER EDITS THIS SECTION ONLY
# =============================================================================

MODEL_PATH = "uav_model.pkl"       # saved by TRAIN.py

MISSION = {
    # -- Flight condition ------------------------------------------------------
    "payload_kg"     : 30.0,        # payload mass (kg)
    "payload_frac"   : 0.28,        # payload / MTOW structural fraction
    "reynolds"       : 300_000,     # cruise Reynolds number
    "mach"           : 0.0,         # cruise Mach number
    "alpha"          : 4.0,         # design AoA (deg)
    "cruise_speed"   : 18.0,        # cruise airspeed (m/s)
    "altitude_m"     : 500.0,       # cruise altitude (m)

    # -- XFoil sweep -----------------------------------------------------------
    "alpha_start"    : -4.0,
    "alpha_end"      : 16.0,
    "alpha_step"     :  1.0,

    # -- Airfoil ---------------------------------------------------------------
    "airfoil_method" : "naca4",
    "airfoil_params" : None,        # None = NACA 4412 default

    # -- Wing geometry ---------------------------------------------------------
    "AR"             : 10.0,
    "taper"          : 0.45,
    "fuse_frac"      : 0.60,

    # -- XFoil executable ------------------------------------------------------
    "xfoil_path"     : r"./Xfoil6.99/xfoil.exe",
    "use_generator"  : True,

    # -- ML model --------------------------------------------------------------
    "model_path"     : MODEL_PATH,
    "retrain"        : False,       # True = re-run TRAIN.py before mission

    # -- Optimisation ----------------------------------------------------------
    "optimize"       : True,       # True = run OPTIMIZER
    "optimizer"      : "bayesian",
    "objective"      : "breguet",
    "n_calls"        : 40,
    "n_init"         : 10,
    "pop_size"       : 20,

    # -- Output ----------------------------------------------------------------
    "output_dir"     : "mission_output",
    "verbose"        : True,
}

# =============================================================================
# INTERNAL HELPERS
# =============================================================================

def _load_or_train(model_path: str):
    """
    Load uav_model.pkl.
    If it does not exist, run TRAIN.py automatically to build it.
    """
    import joblib

    if not os.path.isfile(model_path):
        print(f"[POST_TRAIN] Model not found: {model_path}")
        print("[POST_TRAIN] Running TRAIN.py to build the model...")
        import subprocess
        proc = subprocess.run([sys.executable, "TRAIN.py"], capture_output=False)
        if proc.returncode != 0:
            raise RuntimeError("[POST_TRAIN] TRAIN.py failed — check errors above.")
        if not os.path.isfile(model_path):
            raise FileNotFoundError(
                f"[POST_TRAIN] TRAIN.py ran but model not found: {model_path}"
            )

    bundle = joblib.load(model_path)
    print(f"\n[POST_TRAIN] Model loaded  : {os.path.abspath(model_path)}")
    print(f"  Airfoils  : {bundle['AF_NAMES']}")
    print(f"  Features  : {bundle['FEAT']}")
    print(f"  Targets   : {bundle['TGTS']}")
    if "metrics" in bundle:
        print(f"  Accuracy  :")
        for tgt, m in bundle["metrics"].items():
            print(f"    {tgt:<5} RMSE={m['RMSE']:.6f}  "
                  f"R2={m['R2']:.4f}  CV-R2={m['CV_R2']:.4f}")
    return bundle


def _sanity_check(bundle: dict) -> bool:
    """
    Quick one-point prediction on the first training airfoil.
    Confirms the model is physically consistent before starting a
    potentially long XFoil + optimisation run.
    Returns True if all checks pass.
    """
    models   = bundle["models"]
    scaler   = bundle["scaler"]
    FEAT     = bundle["FEAT"]
    TGTS     = bundle["TGTS"]
    AF_ENC   = bundle["AF_ENC"]
    AF_NAMES = bundle["AF_NAMES"]
    RE_NOM   = bundle.get("RE_NOM", 3e5)
    geom_map = bundle.get("GEOMETRY_MAP", {})

    af_name  = AF_NAMES[0]
    enc      = AF_ENC[af_name]
    geom     = geom_map.get(af_name, {"camber": 0.04, "thickness": 0.12})
    alpha    = 4.0
    re_val   = 300_000.0

    feat_map = {
        "af_enc"         : enc,
        "alpha"          : alpha,
        "alpha_rad"      : np.radians(alpha),
        "sin_alpha"      : np.sin(np.radians(alpha)),
        "cos_alpha"      : np.cos(np.radians(alpha)),
        "alpha_sq"       : alpha ** 2,
        "camber"         : geom.get("camber",    0.04),
        "thickness"      : geom.get("thickness", 0.12),
        "re_norm"        : re_val / 2e6,
        "re_log"         : np.log10(re_val),
        "altitude_m"     : 0.0,
        "mach"           : 0.0,
        "mach_sq"        : 0.0,
        "prandtl_glauert": 1.0,
        "ncrit"          : 9.0,
        "xtrf_top"       : 1.0,
        "xtrf_bot"       : 1.0,
        "top_xtr_n"      : 0.5,
        "bot_xtr_n"      : 0.5,
        "top_turb_frac"  : 0.5,
        "bot_turb_frac"  : 0.5,
        "lam_frac"       : 0.5,
        "xtr_asymmetry"  : 0.0,
        "dCL_dalpha"     : 0.10,
        "is_stalled"     : 0,
        "stall_margin"   : 0.3,
        "cd_re_ratio"    : (RE_NOM / re_val) ** 0.20,
    }

    fv   = np.array([[feat_map.get(f, 0.0) for f in FEAT]])
    fv_s = scaler.transform(fv)

    preds = {}
    for tgt in TGTS:
        rf_p = models[tgt]["rf"].predict(fv_s)[0]
        gb_p = models[tgt]["gb"].predict(fv_s)[0]
        preds[tgt] = 0.60 * rf_p + 0.40 * gb_p

    CL  = preds["CL"]
    CD  = max(preds["CD"], 0.001)
    LD  = CL / CD
    brg = CL ** 1.5 / CD

    print(f"\n[POST_TRAIN] Sanity check  : {af_name}  "
          f"alpha={alpha:.1f}deg  Re={re_val:.0f}")
    print(f"  CL={CL:.4f}  CD={CD:.6f}  L/D={LD:.2f}  breguet={brg:.3f}")

    checks = {
        "CL in [0.0, 3.0]" : 0.0 < CL < 3.0,
        "CD in [0.001, 0.2]": 0.001 < CD < 0.2,
        "L/D in [1, 80]"   : 1.0 < LD < 80.0,
        "breguet > 0"       : brg > 0.0,
    }
    all_ok = True
    for desc, passed in checks.items():
        status = "OK" if passed else "WARN"
        if not passed:
            all_ok = False
            print(f"  [{status}] {desc}")

    if all_ok:
        print("  All checks passed -- model is ready.")
    else:
        print("  One or more checks failed -- consider retraining (retrain=True).")

    return all_ok


# =============================================================================
# MAIN PIPELINE FUNCTION
# =============================================================================

def run(mission: dict = None) -> dict:
    """
    Full pipeline orchestrator.

    1. Load uav_model.pkl  (auto-trains via TRAIN.py if missing)
    2. Sanity-check the model with a quick single-point prediction
    3. Call INTERFACE.run_mission() for the full pipeline:
         GENERATOR -> XFoil -> ML predict -> OPTIMIZER -> geometry -> report

    Parameters
    ----------
    mission : dict
        Mission parameters. Uses module-level MISSION dict if None.
        See MISSION dict at top of this file for all available keys.

    Returns
    -------
    Same dict as INTERFACE.run_mission():
        mission, aero, geometry, generate_result, optim_result, summary
    """
    if mission is None:
        mission = MISSION

    # Always keep model_path consistent
    mission.setdefault("model_path", MODEL_PATH)

    sep = "=" * 62
    print(f"\n{sep}")
    print("  POST_TRAIN.py  --  Mission Pipeline Orchestrator")
    print(sep)

    # -----------------------------------------------------------------
    # STEP 1: Load or auto-train model
    # -----------------------------------------------------------------
    if mission.get("retrain", False):
        print("[POST_TRAIN] retrain=True -- running TRAIN.py...")
        import subprocess
        proc = subprocess.run([sys.executable, "TRAIN.py"], capture_output=False)
        if proc.returncode != 0:
            raise RuntimeError("[POST_TRAIN] TRAIN.py failed.")

    bundle = _load_or_train(mission["model_path"])

    # -----------------------------------------------------------------
    # STEP 2: Sanity check
    # -----------------------------------------------------------------
    _sanity_check(bundle)

    # -----------------------------------------------------------------
    # STEP 3: Generate airfoil + XFoil + ML predict via INTERFACE
    # -----------------------------------------------------------------
    from INTERFACE import generate_and_predict
    from INTERFACE import geometry_synthesis

    print(f"\n[POST_TRAIN] STEP 3 -- Generate + XFoil + ML predict")
    print(f"  payload    : {mission.get('payload_kg')} kg")
    print(f"  reynolds   : {mission.get('reynolds', 300_000):.0f}")
    print(f"  mach       : {mission.get('mach', 0.0):.4f}")
    print(f"  alpha      : {mission.get('alpha', 4.0)} deg")
    print(f"  method     : {mission.get('airfoil_method', 'naca4').upper()}")
    print(f"  xfoil      : {mission.get('xfoil_path')}")
    print(f"  output_dir : {mission.get('output_dir', 'mission_output')}")

    io_result = generate_and_predict(mission, bundle)
    aero      = io_result["aero"]
    polar_df  = io_result["polar_df"]

    # -----------------------------------------------------------------
    # STEP 4: Optimisation (if requested)
    # -----------------------------------------------------------------
    optim_result = None
    best_params  = None
    best_score   = None

    if mission.get("optimize", False):
        print(f"\n[POST_TRAIN] STEP 4 -- Optimise airfoil geometry")
        print(f"  optimizer : {mission.get('optimizer', 'bayesian')}")
        print(f"  objective : {mission.get('objective', 'breguet')}")
        print(f"  n_calls   : {mission.get('n_calls', 40)}")

        from OPTIMIZER import optimize

        method = mission.get("airfoil_method", "naca4")
        out    = mission.get("output_dir", "mission_output")

        optim_result = optimize(
            method     = method,
            mission    = {
                "reynolds"   : mission.get("reynolds",    300_000),
                "mach"       : mission.get("mach",          0.0),
                "alpha"      : mission.get("alpha",          4.0),
                "alpha_start": mission.get("alpha_start",   -4.0),
                "alpha_end"  : mission.get("alpha_end",     16.0),
                "alpha_step" : mission.get("alpha_step",     1.0),
            },
            xfoil_path = mission.get("xfoil_path"),
            bundle     = bundle,
            optimizer  = mission.get("optimizer",  "bayesian"),
            objective  = mission.get("objective",  "breguet"),
            n_calls    = mission.get("n_calls",    40),
            n_init     = mission.get("n_init",     10),
            pop_size   = mission.get("pop_size",   20),
            output_dir = os.path.join(out, "optimisation"),
            verbose    = mission.get("verbose",    True),
        )

        best_params = optim_result["params"]
        best_score  = optim_result["score"]
        print(f"\n[POST_TRAIN] Best params : {best_params}")
        print(f"[POST_TRAIN] Best score  : {best_score:.6f}  "
              f"({mission.get('objective', 'breguet')})")

        # Update aero from optimised polar if XFoil produced data
        if len(optim_result["result"]["polar"]):
            opt_io = generate_and_predict(
                {**mission, "airfoil_params": best_params,
                 "airfoil_method": method},
                bundle
            )
            aero = opt_io["aero"]

    # -----------------------------------------------------------------
    # STEP 5: Full geometry synthesis
    # -----------------------------------------------------------------
    print(f"\n[POST_TRAIN] STEP 5 -- Full geometry synthesis")

    CL_op = float(aero.get("CL_pred", aero.get("CL", 0.5)))
    geo   = geometry_synthesis(CL_op, mission.get("cruise_speed", 18.0), mission)

    # -----------------------------------------------------------------
    # STEP 6: Save POST_TRAIN report
    # -----------------------------------------------------------------
    out = mission.get("output_dir", "mission_output")
    os.makedirs(out, exist_ok=True)

    report_lines = [
        sep,
        "  POST_TRAIN -- FULL PIPELINE REPORT",
        sep,
        "",
        "  MISSION INPUTS",
        f"    Payload        : {mission.get('payload_kg', 30)} kg",
        f"    Reynolds       : {mission.get('reynolds', 300_000):.0f}",
        f"    Mach           : {mission.get('mach', 0.0):.4f}",
        f"    Design AoA     : {mission.get('alpha', 4.0):.1f} deg",
        f"    Cruise Speed   : {mission.get('cruise_speed', 18.0):.1f} m/s",
        f"    Altitude       : {mission.get('altitude_m', 500):.0f} m",
        "",
        "  MODEL",
        f"    Path           : {bundle.get('__path__', mission.get('model_path', 'uav_model.pkl'))}",
        f"    Airfoils       : {bundle['AF_NAMES']}",
        f"    Features       : {len(bundle['FEAT'])}",
    ]

    if "metrics" in bundle:
        report_lines.append("")
        report_lines.append("  MODEL ACCURACY")
        for tgt, m_acc in bundle["metrics"].items():
            report_lines.append(
                f"    {tgt:<5}  RMSE={m_acc['RMSE']:.6f}  "
                f"R2={m_acc['R2']:.4f}  CV-R2={m_acc['CV_R2']:.4f}"
            )

    report_lines += [
        "",
        "  ML PREDICTION  (design AoA)",
        f"    CL             : {aero.get('CL_pred', 0):.5f}",
        f"    CD             : {aero.get('CD_pred', 0):.6f}",
        f"    L/D            : {aero.get('LD_pred', 0):.3f}",
        f"    Breguet        : {aero.get('breguet_pred', 0):.4f}",
        f"    CM             : {aero.get('CM_pred', 0):.5f}",
    ]

    if optim_result:
        report_lines += [
            "",
            "  OPTIMISED AIRFOIL",
            f"    Params         : {best_params}",
            f"    Score          : {best_score:.6f}  ({mission.get('objective', 'breguet')})",
        ]

    report_lines += [
        "",
        "  UAV GEOMETRY SYNTHESIS",
        f"    MTOW           : {geo.get('MTOW_kg', '?')} kg",
        f"    Wingspan       : {geo.get('wingspan_m', '?')} m",
        f"    Wing area      : {geo.get('S_m2', '?')} m2",
        f"    Aspect ratio   : {geo.get('AR', '?')}",
        f"    Mean chord     : {geo.get('c_mean_m', '?')} m",
        f"    Root chord     : {geo.get('c_root_m', '?')} m",
        f"    Tip chord      : {geo.get('c_tip_m', '?')} m",
        f"    H-tail area    : {geo.get('S_h_m2', '?')} m2",
        f"    V-tail area    : {geo.get('S_v_m2', '?')} m2",
        f"    Fuselage len   : {geo.get('l_fus_m', '?')} m",
        f"    Motor power    : {geo.get('P_motor_W', '?')} W",
        f"    Propeller diam : {geo.get('d_prop_m', '?')} m",
        "",
        "  OUTPUT FILES",
        f"    {out}/mission_report.txt       (airfoil generate + predict)",
        f"    {out}/post_train_report.txt    (this file)",
        f"    {out}/geometry.json",
    ]
    if optim_result:
        report_lines += [
            f"    {out}/optimisation/convergence.png",
            f"    {out}/optimisation/optim_history.csv",
        ]
    report_lines.append(sep)

    pt_report = "\n".join(report_lines)
    print("\n" + pt_report)

    pt_report_path = os.path.join(out, "post_train_report.txt")
    with open(pt_report_path, "w", encoding="utf-8") as f:
        f.write(pt_report)

    geo_path = os.path.join(out, "geometry.json")
    import json
    with open(geo_path, "w", encoding="utf-8") as f:
        json.dump(geo, f, indent=2)

    print(f"\n[POST_TRAIN] Report saved : {pt_report_path}")
    print(f"[POST_TRAIN] Geometry JSON: {geo_path}")
    print(sep)

    return {
        "io_result"   : io_result,
        "aero"        : aero,
        "geometry"    : geo,
        "optim_result": optim_result,
        "bundle"      : bundle,
        "report"      : pt_report,
    }


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    run(MISSION)