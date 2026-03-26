"""
=============================================================================
  TRAIN.py
  UAV Aerodynamic ML Optimizer — Training Pipeline
  Mission : Long Endurance  |  Payload : 30 kg
  Re Test : Low (55k) | Medium (300k) | High (1.25M)
=============================================================================
  Runs once to build and save uav_model.pkl.
  After this file completes, run POST_TRAIN.py for predictions,
  sizing, reporting, optimisation, and the full mission pipeline.

  Pipeline:
    1.  Load XFoil polar data (from files or built-in AIRFOILS dict)
    2.  Feature engineering
    3.  Train RF + GBM ensemble  (CL, CD, CDp, CM targets)
    4.  Save model bundle -> uav_model.pkl
=============================================================================
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import warnings
warnings.filterwarnings("ignore")
np.random.seed(42)

# =============================================================================
# 1. XFOIL POLAR DATABASE  (built-in legacy dict)
#    Source: XFoil v6.99, Re=300k, Ncrit=9, Mach=0, free transition
#    Each airfoil: [meta_dict, (alpha,CL,CD,CDp,CM,Top_Xtr,Bot_Xtr), ...]
# =============================================================================

AIRFOILS = {

    "NACA_2412": [
        {"camber": 0.020, "thickness": 0.120, "re_nom": 3e5,
         "description": "NACA 4-digit, 2% camber, 12% thick, general purpose"},
        (-2.000,  0.0307,  0.01118,  0.00440, -0.0516,  0.6871,  0.4412),
        ( 0.000,  0.2340,  0.01088,  0.00438, -0.0465,  0.6078,  0.6069),
        ( 2.000,  0.4369,  0.01116,  0.00484, -0.0411,  0.5327,  0.7506),
        ( 4.000,  0.6328,  0.01212,  0.00602, -0.0338,  0.4671,  0.8946),
        ( 6.000,  0.8916,  0.01423,  0.00800, -0.0405,  0.3950,  0.9789),
        ( 8.000,  1.0593,  0.01609,  0.00965, -0.0333,  0.3253,  1.0000),
        (10.000,  1.1356,  0.01968,  0.01301, -0.0109,  0.2577,  1.0000),
        (12.000,  1.2326,  0.02667,  0.01994,  0.0008,  0.2042,  1.0000),
    ],

    "NACA_0012": [
        {"camber": 0.000, "thickness": 0.120, "re_nom": 3e5,
         "description": "NACA symmetric, 0% camber, 12% thick, symmetric reference"},
        (-2.000, -0.2280,  0.00893,  0.00271, -0.0006,  0.8204,  0.2869),
        ( 0.000,  0.0000,  0.00826,  0.00218,  0.0000,  0.7502,  0.7502),
        ( 2.000,  0.2280,  0.00893,  0.00271,  0.0006,  0.6776,  0.8204),
        ( 4.000,  0.4533,  0.01059,  0.00437,  0.0004,  0.6010,  0.9011),
        ( 6.000,  0.6735,  0.01299,  0.00651, -0.0010,  0.5276,  0.9657),
        ( 8.000,  0.8850,  0.01606,  0.00934, -0.0033,  0.4518,  1.0000),
        (10.000,  1.0347,  0.02048,  0.01346, -0.0049,  0.3707,  1.0000),
        (12.000,  1.1152,  0.02838,  0.02104, -0.0043,  0.2924,  1.0000),
    ],

    "NACA_4412": [
        {"camber": 0.040, "thickness": 0.120, "re_nom": 3e5,
         "description": "NACA 4-digit, 4% camber, 12% thick, classic endurance"},
        (-2.000,  0.1745,  0.01152,  0.00471, -0.1007,  0.7254,  0.3162),
        ( 0.000,  0.4093,  0.01098,  0.00451, -0.0983,  0.6292,  0.5135),
        ( 2.000,  0.6189,  0.01101,  0.00482, -0.0942,  0.5311,  0.6981),
        ( 4.000,  0.7923,  0.01199,  0.00607, -0.0853,  0.4549,  0.8445),
        ( 6.000,  1.0013,  0.01391,  0.00794, -0.0852,  0.3814,  0.9524),
        ( 8.000,  1.1709,  0.01617,  0.01001, -0.0792,  0.3151,  1.0000),
        (10.000,  1.2991,  0.02044,  0.01390, -0.0638,  0.2507,  1.0000),
        (12.000,  1.3945,  0.02803,  0.02105, -0.0430,  0.1987,  1.0000),
    ],

    "NACA_6412": [
        {"camber": 0.060, "thickness": 0.120, "re_nom": 3e5,
         "description": "NACA 4-digit, 6% camber, 12% thick, high-lift variant"},
        (-2.000,  0.3252,  0.01219,  0.00523, -0.1452,  0.7601,  0.2418),
        ( 0.000,  0.5700,  0.01129,  0.00474, -0.1424,  0.6445,  0.4019),
        ( 2.000,  0.7802,  0.01112,  0.00495, -0.1373,  0.5363,  0.5772),
        ( 4.000,  0.9690,  0.01191,  0.00601, -0.1285,  0.4543,  0.7381),
        ( 6.000,  1.1575,  0.01382,  0.00783, -0.1209,  0.3797,  0.8893),
        ( 8.000,  1.3230,  0.01632,  0.01020, -0.1110,  0.3127,  1.0000),
        (10.000,  1.4455,  0.02123,  0.01482, -0.0912,  0.2489,  1.0000),
        (12.000,  1.4983,  0.03117,  0.02400, -0.0571,  0.1981,  1.0000),
    ],

    "NACA_23012": [
        {"camber": 0.020, "thickness": 0.120, "re_nom": 3e5,
         "description": "NACA 5-digit, low CM, 12% thick, low pitching moment"},
        (-2.000,  0.0317,  0.00902,  0.00293, -0.0151,  0.7162,  0.4399),
        ( 0.000,  0.2468,  0.00868,  0.00284, -0.0127,  0.6293,  0.6158),
        ( 2.000,  0.4480,  0.00892,  0.00327, -0.0094,  0.5475,  0.7762),
        ( 4.000,  0.6424,  0.00972,  0.00438, -0.0050,  0.4745,  0.9104),
        ( 6.000,  0.8905,  0.01148,  0.00626, -0.0105,  0.3990,  0.9853),
        ( 8.000,  1.0512,  0.01349,  0.00812, -0.0061,  0.3262,  1.0000),
        (10.000,  1.1428,  0.01758,  0.01183,  0.0134,  0.2574,  1.0000),
        (12.000,  1.2366,  0.02494,  0.01882,  0.0234,  0.2017,  1.0000),
    ],

    "Clark_Y": [
        {"camber": 0.036, "thickness": 0.117, "re_nom": 3e5,
         "description": "Classic Clark Y, flat bottom, 3.6% camber, popular UAV section"},
        (-2.000,  0.1823,  0.01283,  0.00548, -0.0832,  0.7328,  0.3221),
        ( 0.000,  0.4013,  0.01195,  0.00509, -0.0793,  0.6334,  0.5109),
        ( 2.000,  0.6012,  0.01196,  0.00542, -0.0743,  0.5411,  0.6883),
        ( 4.000,  0.7894,  0.01298,  0.00649, -0.0679,  0.4651,  0.8439),
        ( 6.000,  0.9860,  0.01489,  0.00833, -0.0676,  0.3912,  0.9543),
        ( 8.000,  1.1540,  0.01712,  0.01046, -0.0617,  0.3233,  1.0000),
        (10.000,  1.2848,  0.02175,  0.01476, -0.0474,  0.2568,  1.0000),
        (12.000,  1.3619,  0.02997,  0.02261, -0.0241,  0.2028,  1.0000),
    ],

    "Eppler_423": [
        {"camber": 0.060, "thickness": 0.130, "re_nom": 3e5,
         "description": "Eppler 423, high-lift, 6% camber, 13% thick, soaring/endurance"},
        (-2.000,  0.4781,  0.01523,  0.00703, -0.1241,  0.8012,  0.1819),
        ( 0.000,  0.7102,  0.01378,  0.00634, -0.1217,  0.6802,  0.2891),
        ( 2.000,  0.9273,  0.01314,  0.00631, -0.1183,  0.5657,  0.4268),
        ( 4.000,  1.1321,  0.01352,  0.00698, -0.1135,  0.4664,  0.6012),
        ( 6.000,  1.3327,  0.01512,  0.00851, -0.1083,  0.3823,  0.7841),
        ( 8.000,  1.4991,  0.01793,  0.01108, -0.1019,  0.3128,  0.9432),
        (10.000,  1.6241,  0.02284,  0.01567, -0.0911,  0.2527,  1.0000),
        (12.000,  1.6803,  0.03312,  0.02543, -0.0682,  0.2003,  1.0000),
    ],

    "S1223": [
        {"camber": 0.090, "thickness": 0.120, "re_nom": 3e5,
         "description": "Selig S1223, ultra-high-lift, 9% camber, low-Re optimised"},
        (-2.000,  0.6812,  0.01923,  0.00981, -0.1882,  0.8521,  0.1123),
        ( 0.000,  0.9431,  0.01712,  0.00894, -0.1871,  0.7133,  0.1742),
        ( 2.000,  1.1812,  0.01611,  0.00882, -0.1839,  0.5801,  0.2712),
        ( 4.000,  1.3917,  0.01653,  0.00962, -0.1789,  0.4648,  0.4231),
        ( 6.000,  1.5723,  0.01912,  0.01163, -0.1728,  0.3712,  0.6138),
        ( 8.000,  1.7241,  0.02312,  0.01528, -0.1652,  0.2981,  0.8412),
        (10.000,  1.8123,  0.03019,  0.02193, -0.1521,  0.2341,  1.0000),
        (12.000,  1.8432,  0.04312,  0.03381, -0.1311,  0.1912,  1.0000),
    ],

    "MH_60": [
        {"camber": 0.020, "thickness": 0.100, "re_nom": 3e5,
         "description": "Martin Hepperle MH-60, thin low-drag, 2% camber, low-Re model"},
        (-2.000,  0.1023,  0.00812,  0.00281, -0.0631,  0.7823,  0.3412),
        ( 0.000,  0.2981,  0.00778,  0.00272, -0.0612,  0.7012,  0.5231),
        ( 2.000,  0.4912,  0.00793,  0.00298, -0.0588,  0.6183,  0.6981),
        ( 4.000,  0.6783,  0.00869,  0.00401, -0.0551,  0.5421,  0.8512),
        ( 6.000,  0.8641,  0.01032,  0.00571, -0.0531,  0.4681,  0.9631),
        ( 8.000,  1.0213,  0.01281,  0.00812, -0.0492,  0.3912,  1.0000),
        (10.000,  1.1312,  0.01701,  0.01201, -0.0421,  0.3172,  1.0000),
        (12.000,  1.1923,  0.02512,  0.01912, -0.0301,  0.2521,  1.0000),
    ],

    "E387": [
        {"camber": 0.037, "thickness": 0.091, "re_nom": 3e5,
         "description": "Eppler E387, thin low-Re section, 3.7% camber, UIUC benchmark"},
        (-2.000,  0.1512,  0.01023,  0.00382, -0.0712,  0.7912,  0.3021),
        ( 0.000,  0.3512,  0.00981,  0.00371, -0.0681,  0.7023,  0.4981),
        ( 2.000,  0.5481,  0.00993,  0.00398, -0.0643,  0.6181,  0.6721),
        ( 4.000,  0.7321,  0.01083,  0.00512, -0.0591,  0.5381,  0.8312),
        ( 6.000,  0.9123,  0.01272,  0.00701, -0.0572,  0.4591,  0.9512),
        ( 8.000,  1.0712,  0.01523,  0.00942, -0.0521,  0.3812,  1.0000),
        (10.000,  1.1812,  0.01982,  0.01371, -0.0412,  0.3081,  1.0000),
        (12.000,  1.2312,  0.02812,  0.02121, -0.0241,  0.2421,  1.0000),
    ],
}

# ---------------------------------------------------------------------------
# Convenience accessors
# ---------------------------------------------------------------------------
def af_meta(name):
    """Return geometry metadata dict.  af_meta("NACA_2412")["camber"] -> 0.020"""
    return AIRFOILS[name][0]

def af_polar(name):
    """Return list of polar tuples (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr)."""
    return AIRFOILS[name][1:]

# Polar tuple index constants
I_ALPHA, I_CL, I_CD, I_CDP, I_CM, I_TOPXTR, I_BOTXTR = range(7)

# Backward-compatible aliases
XFOIL_POLARS = {name: af_polar(name) for name in AIRFOILS}
AIRFOIL_META = {name: af_meta(name)  for name in AIRFOILS}

# Mission constants
RE_CONDITIONS = {
    "Low_Re  (55k)":   {"re": 5.5e4,  "V_typ": 8.0,  "label": "Low Re  (55k)"},
    "Med_Re  (300k)":  {"re": 3.0e5,  "V_typ": 18.0, "label": "Med Re  (300k)"},
    "High_Re (1.25M)": {"re": 1.25e6, "V_typ": 35.0, "label": "High Re (1.25M)"},
}

AOA_TARGETS = list(range(1, 13))   # 1 to 12 deg

RHO     = 1.225      # kg/m3
G       = 9.81       # m/s2
MU      = 1.789e-5   # Pa.s
PAYLOAD = 30.0       # kg

# =============================================================================
# 2. RE-SCALING  (Re=300k nominal -> any target Re)
# =============================================================================

RE_NOM = 3e5

def scale_polar_to_re(cl_nom, cd_nom, cdp_nom, cm_nom, top_xtr, bot_xtr, re_target):
    """Scale XFoil polar from Re=300k to target Re."""
    re_ratio  = RE_NOM / max(re_target, 1e4)
    cd_scale  = re_ratio ** 0.20
    cl_scale  = 1.0 - 0.12 * max(0.0, 1.0 - re_target / RE_NOM)
    cdp_scale = re_ratio ** 0.20
    cm_delta  = 0.003 * max(0.0, 1.0 - re_target / RE_NOM)
    xtr_scale = min(1.0, re_target / RE_NOM * 1.1)
    return (
        cl_nom * cl_scale,
        cd_nom * cd_scale,
        cdp_nom * cdp_scale,
        cm_nom + cm_delta,
        top_xtr * xtr_scale,
        bot_xtr * min(1.0, xtr_scale + 0.05),
    )

print("=" * 70)
print("  TRAIN.py  --  UAV XFoil ML OPTIMIZER  |  Training Pipeline")
print("=" * 70)

# =============================================================================
# DATA SOURCE SWITCH
#
# USE_POLAR_FILE = True   -> load real XFoil polar .txt files from POLAR_SOURCE
# USE_POLAR_FILE = False  -> use built-in AIRFOILS dict (legacy mode)
# =============================================================================

USE_POLAR_FILE = True
POLAR_SOURCE   = "data"          # <- folder or single .txt file path

import POLARPARSE as parse
GEOMETRY_MAP = parse.generate_geometry_map("coord_ex")

# =============================================================================
# [1/4] BUILD DATASET
# =============================================================================

print("\n[1/4] Building dataset...")

if USE_POLAR_FILE:
    import os
    from POLARPARSE import parse_polar, parse_polar_folder, polar_df_to_train

    if os.path.isdir(POLAR_SOURCE):
        raw_df = parse_polar_folder(POLAR_SOURCE)
        print(f"      Source     : folder '{POLAR_SOURCE}'")
    elif os.path.isfile(POLAR_SOURCE):
        raw_df = parse_polar(POLAR_SOURCE)
        print(f"      Source     : file '{POLAR_SOURCE}'")
    else:
        raise FileNotFoundError(
            f"[1/4] POLAR_SOURCE not found: '{POLAR_SOURCE}'\n"
            f"      Set POLAR_SOURCE to a valid folder or .txt file path."
        )

    df       = polar_df_to_train(raw_df, geometry=GEOMETRY_MAP)
    AF_NAMES = sorted(df["airfoil"].unique())
    AF_ENC   = {name: i for i, name in enumerate(AF_NAMES)}


else:
    # Legacy AIRFOILS dict
    print("      Source     : built-in AIRFOILS dict (legacy mode)")
    rows    = []
    AF_NAMES = list(AIRFOILS.keys())
    AF_ENC   = {name: i for i, name in enumerate(AF_NAMES)}
    RE_LIST  = [5.5e4, 1e5, 2e5, 3e5, 5e5, 8e5, 1.25e6, 2e6]

    for af_name in AF_NAMES:
        meta  = af_meta(af_name)
        polar = af_polar(af_name)
        for re_val in RE_LIST:
            for pt in polar:
                alpha  = pt[I_ALPHA]
                cl_n   = pt[I_CL];   cd_n  = pt[I_CD]
                cdp_n  = pt[I_CDP];  cm_n  = pt[I_CM]
                topx_n = pt[I_TOPXTR]; botx_n = pt[I_BOTXTR]
                cl, cd, cdp, cm, topx, botx = scale_polar_to_re(
                    cl_n, cd_n, cdp_n, cm_n, topx_n, botx_n, re_val
                )
                rows.append({
                    "af_enc":      AF_ENC[af_name],
                    "alpha":       alpha,
                    "alpha_rad":   np.radians(alpha),
                    "sin_alpha":   np.sin(np.radians(alpha)),
                    "cos_alpha":   np.cos(np.radians(alpha)),
                    "alpha_sq":    alpha**2,
                    "camber":      meta["camber"],
                    "thickness":   meta["thickness"],
                    "re_norm":     re_val / 2e6,
                    "re_log":      np.log10(re_val),
                    "top_xtr_n":   topx_n,
                    "bot_xtr_n":   botx_n,
                    "cd_re_ratio": (RE_NOM / re_val) ** 0.20,
                    "CL":  cl,  "CD":  cd,
                    "CDp": cdp, "CM":  cm,
                    "top_xtr": topx, "bot_xtr": botx,
                    "LD":      cl / max(cd, 1e-6),
                    "breguet": cl**1.5 / max(cd, 1e-6),
                    "airfoil": af_name,
                    "re_val":  re_val,
                    "Mach":    0.0,
                })
    df = pd.DataFrame(rows)

print(f"      Airfoils   : {len(AF_NAMES)}  -> {AF_NAMES}")
print(f"      Total rows : {len(df)}")
print(f"      CL range   : {df['CL'].min():.3f} to {df['CL'].max():.3f}")
print(f"      CD range   : {df['CD'].min():.5f} to {df['CD'].max():.5f}")
print(f"      L/D range  : {df['LD'].min():.1f} to {df['LD'].max():.1f}")

# =============================================================================
# [2/4] FEATURE ENGINEERING
# =============================================================================

FEAT = [
    "af_enc",
    "alpha", "alpha_rad", "sin_alpha", "cos_alpha", "alpha_sq",
    "camber", "thickness",
    "re_norm", "re_log",
    "mach", "mach_sq", "prandtl_glauert",
    "ncrit", "xtrf_top", "xtrf_bot",
    "top_xtr_n", "bot_xtr_n",
]
# Keep only features present in df (legacy mode lacks Mach/Ncrit columns)
FEAT = [f for f in FEAT if f in df.columns]
TGTS = ["CL", "CD", "CDp", "CM"]

X = df[FEAT].values
y = df[TGTS].values

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.15, random_state=42)
scaler   = StandardScaler()
X_tr_s   = scaler.fit_transform(X_tr)
X_te_s   = scaler.transform(X_te)

# =============================================================================
# [3/4] TRAIN RandomForest + GBM ENSEMBLE
# =============================================================================

print(f"\n[3/4] Training RF + GBM ensemble  ({len(FEAT)} features, 4 targets)...")
print(f"      Train: {len(X_tr)}  |  Test: {len(X_te)}")

models  = {}
metrics = {}
for i, tgt in enumerate(TGTS):
    yt, ye = y_tr[:, i], y_te[:, i]
    rf = RandomForestRegressor(
        n_estimators=300, max_depth=16,
        min_samples_leaf=2, random_state=42, n_jobs=-1
    )
    gb = GradientBoostingRegressor(
        n_estimators=200, max_depth=5,
        learning_rate=0.06, subsample=0.85, random_state=42
    )
    rf.fit(X_tr_s, yt)
    gb.fit(X_tr_s, yt)
    pred = 0.60 * rf.predict(X_te_s) + 0.40 * gb.predict(X_te_s)
    rmse = np.sqrt(mean_squared_error(ye, pred))
    r2   = r2_score(ye, pred)
    cv   = cross_val_score(rf, X_tr_s, yt, cv=5, scoring="r2").mean()
    models[tgt]  = {"rf": rf, "gb": gb}
    metrics[tgt] = {"RMSE": rmse, "R2": r2, "CV_R2": cv}
    print(f"      {tgt:<5} -> RMSE: {rmse:.6f}   R2: {r2:.6f}   CV-R2: {cv:.6f}")

# Feature importance
imp = np.zeros(len(FEAT))
for tgt in TGTS:
    imp += models[tgt]["rf"].feature_importances_
imp  /= len(TGTS)
fimp  = pd.DataFrame({"Feature": FEAT, "Importance": imp}).sort_values(
            "Importance", ascending=False)

print("\n  Feature importance:")
for _, row in fimp.iterrows():
    print(f"    {row['Feature']:<20} {row['Importance']:.4f}")

# =============================================================================
# [4/4] SAVE MODEL BUNDLE -> uav_model.pkl
#
# Bundle loaded by POST_TRAIN.py, airfoiloptimizer, and run.py.
# Contains everything needed to predict without retraining:
#   models, scaler, FEAT, TGTS, AF_ENC, AF_NAMES,
#   AIRFOILS, RE_CONDITIONS, GEOMETRY_MAP, USE_POLAR_FILE
# =============================================================================

import joblib, os

MODEL_SAVE_PATH = "uav_model.pkl"

_model_bundle = {
    "models"        : models,
    "scaler"        : scaler,
    "FEAT"          : FEAT,
    "TGTS"          : TGTS,
    "AF_ENC"        : AF_ENC,
    "AF_NAMES"      : AF_NAMES,
    "metrics"       : metrics,
    "fimp"          : fimp,
    # pass context needed by predict_aero in POST_TRAIN
    "AIRFOILS"      : AIRFOILS,
    "RE_CONDITIONS" : RE_CONDITIONS,
    "GEOMETRY_MAP"  : GEOMETRY_MAP,
    "USE_POLAR_FILE": USE_POLAR_FILE,
    "RE_NOM"        : RE_NOM,
    "df"            : df,
}

joblib.dump(_model_bundle, MODEL_SAVE_PATH)
print(f"\n[4/4] Model saved -> {os.path.abspath(MODEL_SAVE_PATH)}")
print(f"      Features : {FEAT}")
print(f"      Targets  : {TGTS}")
print(f"      Airfoils : {AF_NAMES}")
print(f"\n  Run POST_TRAIN.py next for predictions, sizing, and optimisation.")
print("=" * 70)
print("  TRAIN.py DONE")
print("=" * 70)