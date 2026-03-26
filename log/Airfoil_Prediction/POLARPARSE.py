"""
POLARPARSE.py
===============
Parse a single XFoil polar .txt file into a pandas DataFrame,
including header metadata (airfoil name, Mach, Re, Ncrit).

Functions
---------
parse_polar(filepath)
    Parse one XFoil polar file -> pd.DataFrame with metadata columns.

parse_polar_folder(folder)
    Parse all polar .txt files in a folder -> combined pd.DataFrame.
"""

import os
import re
import glob
import pandas as pd
import numpy as np
import subprocess


# Column names matching XFoil polar table header
_POLAR_COLS = ["alpha", "CL", "CD", "CDp", "CM", "Top_Xtr", "Bot_Xtr"]


def parse_polar(filepath):
    """
    Parse a single XFoil polar .txt file into a labelled DataFrame.

    Extracts the following metadata from the file header and adds them
    as columns to every row:
        airfoil  : airfoil name from 'Calculated polar for:' line
        Mach     : Mach number
        Re       : Reynolds number (full integer value)
        Ncrit    : free-stream turbulence parameter

    Parameters
    ----------
    filepath : str
        Path to the XFoil polar .txt file.

    Returns
    -------
    pd.DataFrame
        Columns: alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr,
                 airfoil, Mach, Re, Ncrit.
        Returns an empty DataFrame if the file cannot be parsed.

    Example
    -------
    >>> df = parse_polar("pre/naca2412_polar.txt")
    >>> print(df[["alpha", "CL", "CD", "Mach", "Re"]])
    """
    if not os.path.exists(filepath):
        print(f"[polar_parser] File not found: {filepath}")
        return pd.DataFrame()

    with open(filepath, "r", errors="replace") as f:
        lines = f.readlines()

    # ── Extract metadata from header ────────────────────────────────────────

    airfoil = "unknown"
    mach    = 0.0
    re_val  = 0.0
    ncrit   = 9.0

    for line in lines:
        line_s = line.strip()

        # Airfoil name: "Calculated polar for: NACA 2421"
        if line_s.lower().startswith("calculated polar for:"):
            airfoil = line_s.split(":", 1)[1].strip()

        # Mach, Re, Ncrit: "Mach =   0.000     Re =     8.167 e 6     Ncrit =   9.000"
        if "Mach" in line_s and "Re" in line_s and "Ncrit" in line_s:
            m = re.search(r"Mach\s*=\s*([\d.]+)", line_s)
            r = re.search(r"Re\s*=\s*([\d.]+)\s*e\s*([\d]+)", line_s)
            n = re.search(r"Ncrit\s*=\s*([\d.]+)", line_s)
            if m:
                mach  = float(m.group(1))
            if r:
                re_val = float(r.group(1)) * 10 ** int(r.group(2))
            if n:
                ncrit = float(n.group(1))

    # ── Find the data block (lines after the dashed separator) ──────────────

    data_start = None
    for i, line in enumerate(lines):
        if re.match(r"\s*-{4,}", line):   # line of dashes = end of header
            data_start = i + 1
            break

    if data_start is None:
        print(f"[polar_parser] Could not find data block in: {filepath}")
        return pd.DataFrame()

    # ── Parse data rows ─────────────────────────────────────────────────────

    rows = []
    for line in lines[data_start:]:
        stripped = line.strip()
        if not stripped:
            continue
        parts = stripped.split()
        if len(parts) != len(_POLAR_COLS):
            continue
        try:
            rows.append([float(x) for x in parts])
        except ValueError:
            continue

    if not rows:
        print(f"[polar_parser] No data rows found in: {filepath}")
        return pd.DataFrame()

    df = pd.DataFrame(rows, columns=_POLAR_COLS)

    # ── Attach metadata columns ─────────────────────────────────────────────

    df["airfoil"] = airfoil
    df["Mach"]    = mach
    df["Re"]      = re_val
    df["Ncrit"]   = ncrit

    return df.sort_values("alpha").reset_index(drop=True)


def parse_polar_folder(folder, mach=None):
    """
    Parse all XFoil polar .txt files in a folder into one DataFrame.

    Optionally filter to a specific Mach number so only polars generated
    at that Mach are included.

    Parameters
    ----------
    folder : str
        Path to the folder containing polar .txt files.
    mach   : float or None, optional
        If given, only files whose parsed Mach value matches are included.
        Comparison uses a tolerance of 0.001.  Default None (include all).

    Returns
    -------
    pd.DataFrame
        Combined DataFrame for all matched polar files.
        Returns an empty DataFrame if no files are found or parsed.

    Example
    -------
    >>> df = parse_polar_folder("pre", mach=0.2)
    >>> print(df.groupby("airfoil")[["CL", "CD"]].max())
    """
    files = sorted(glob.glob(os.path.join(folder, "*.txt")))

    if not files:
        print(f"[polar_parser] No .txt files found in: {folder}")
        return pd.DataFrame()

    frames = []
    for fpath in files:
        df = parse_polar(fpath)
        if df.empty:
            continue
        # Filter by Mach if requested
        if mach is not None and abs(df["Mach"].iloc[0] - mach) > 0.001:
            continue
        frames.append(df)

    if not frames:
        print(f"[polar_parser] No matching polar data found in: {folder}")
        return pd.DataFrame()

    return pd.concat(frames, ignore_index=True)


"""
polar_df_to_train.py
====================
Standalone module — convert a raw XFoil polar DataFrame into an ML-ready
training DataFrame with full multi-Re / multi-Mach / multi-Ncrit / multi-xtrf
feature engineering.

This function was originally embedded in uav_xfoil_ml.py after the pipeline
block, making it unreachable via normal import.  It lives here so it can be
imported cleanly without running the pipeline.

Usage
-----
    from polar_df_to_train import polar_df_to_train
    from polar_parser      import parse_polar_folder

    raw = parse_polar_folder("polars")
    df  = polar_df_to_train(raw, geometry={
        "naca23012": {"camber": 0.020, "thickness": 0.120},
    })

    # plug straight into ML pipeline
    FEAT = [c for c in df.columns
            if c not in ("CL","CD","CDp","CM","top_xtr","bot_xtr",
                         "LD","breguet","airfoil","re_val","Mach")]
    X = df[FEAT].values
    y = df[["CL","CD","CDp","CM"]].values
"""
# ---------------------------------------------------------------------------
# ISA atmosphere helpers
# ---------------------------------------------------------------------------
 
def _altitude_series(re_series: pd.Series,
                     V_ref: float = 20.0,
                     c_ref: float = 0.25) -> pd.Series:
    """
    Vectorised ISA altitude estimate (m) from Reynolds number.
 
    Re = rho * V * c / mu
    Solving for rho, then inverting ISA density:
        h = (T0/L) * [1 - (rho/rho0)^(L*R/g)]
    """
    mu   = 1.789e-5   # Pa·s, dynamic viscosity (near-constant in troposphere)
    rho0 = 1.225      # kg/m³
    T0   = 288.15     # K
    L    = 0.0065     # K/m lapse rate
    R    = 287.05     # J/kg·K
    g    = 9.80665
 
    rho = (re_series * mu) / (V_ref * c_ref)
    rho = rho.clip(1e-4, rho0)
    exp = L * R / g
    h   = (T0 / L) * (1.0 - (rho / rho0) ** exp)
    return h.clip(0, 11_000)
 
 
# ---------------------------------------------------------------------------
# FEAT / TGTS (importable so the pipeline does not repeat them)
# ---------------------------------------------------------------------------
 
TGTS = ["CL", "CD", "CDp", "CM"]
 
FEAT = [
    # airfoil identity
    "af_enc",
    # angle of attack
    "alpha", "alpha_rad", "sin_alpha", "cos_alpha", "alpha_sq",
    # geometry
    "camber", "thickness",
    # Reynolds / altitude
    "re_norm", "re_log", "altitude_m",
    # Mach / compressibility
    "mach", "mach_sq", "prandtl_glauert",
    # XFoil transition settings (inputs)
    "ncrit", "xtrf_top", "xtrf_bot",
    # XFoil transition locations (BL solver outputs)
    "top_xtr_n", "bot_xtr_n",
    # turbulence state
    "top_turb_frac", "bot_turb_frac", "lam_frac", "xtr_asymmetry",
    # stall awareness
    "dCL_dalpha", "is_stalled", "stall_margin",
]

def polar_df_to_train(polar_df, geometry=None):
    """
    Convert a raw XFoil polar DataFrame into an ML-ready training DataFrame.

    Handles data with multiple Re, Mach, Ncrit, and xtrf values — each row
    is treated as an independent XFoil run and no re-scaling is applied.

    Input columns (from parse_polar / parse_polar_folder)
    -------------------------------------------------------
    Required  : alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re
    Optional  : Mach, Ncrit, xtrf_top, xtrf_bot
                (all default to standard XFoil values if absent)

    Output features built
    ---------------------
    Airfoil   : af_enc
    Alpha     : alpha, alpha_rad, sin_alpha, cos_alpha, alpha_sq
    Geometry  : camber, thickness
    Reynolds  : re_norm, re_log
    Mach      : mach, mach_sq, prandtl_glauert
    Transition: ncrit, xtrf_top, xtrf_bot, top_xtr_n, bot_xtr_n
    Targets   : CL, CD, CDp, CM
    Derived   : LD, breguet, top_xtr, bot_xtr
    Metadata  : airfoil, re_val, Mach

    Parameters
    ----------
    polar_df : pd.DataFrame
        Raw polar data. Duplicate rows on (airfoil, alpha, Re, Mach,
        Ncrit, xtrf_top, xtrf_bot) are dropped, keeping first occurrence.

    geometry : dict[str, dict] or None
        Camber and thickness per airfoil name:
            {"naca23012": {"camber": 0.020, "thickness": 0.120}, ...}
        If None or an airfoil is missing, camber/thickness default to 0.0
        with a warning printed.

    Returns
    -------
    pd.DataFrame   ML-ready, all features + targets in fixed column order.

    Raises
    ------
    ValueError   If required columns are missing from polar_df.

    Example
    -------
    >>> from polar_parser import parse_polar_folder
    >>> raw  = parse_polar_folder("polars")
    >>> geom = {"naca23012": {"camber": 0.020, "thickness": 0.120}}
    >>> df   = polar_df_to_train(raw, geometry=geom)
    >>> X    = df[FEAT].values
    >>> y    = df[TGTS].values
    """

    # ── 1. Validate required columns ────────────────────────────────────────
    required = {"alpha", "CL", "CD", "CDp", "CM", "Top_Xtr", "Bot_Xtr",
                "airfoil", "Re"}
    missing  = required - set(polar_df.columns)
    if missing:
        raise ValueError(
            f"[polar_df_to_train] Missing required columns: {sorted(missing)}\n"
            f"  Available: {list(polar_df.columns)}"
        )

    df = polar_df.copy()

    # ── 2. Fill optional columns with XFoil defaults if absent ──────────────
    if "Mach"     not in df.columns: df["Mach"]     = 0.0
    if "Ncrit"    not in df.columns: df["Ncrit"]    = 9.0
    if "xtrf_top" not in df.columns: df["xtrf_top"] = 1.0  # free transition
    if "xtrf_bot" not in df.columns: df["xtrf_bot"] = 1.0

    # ── 3. Deduplicate ───────────────────────────────────────────────────────
    key_cols = ["airfoil", "alpha", "Re", "Mach", "Ncrit", "xtrf_top", "xtrf_bot"]
    n_before  = len(df)
    df        = df.drop_duplicates(subset=key_cols, keep="first")
    n_dropped = n_before - len(df)
    if n_dropped:
        print(f"[polar_df_to_train] Dropped {n_dropped} duplicate row(s) "
              f"({n_before} -> {len(df)})")
    df = df.reset_index(drop=True)

    # ── 4. Geometry (camber, thickness) ─────────────────────────────────────
    if geometry is None:
        print("[polar_df_to_train] Warning: no geometry dict — "
              "camber and thickness set to 0.0 for all airfoils.")
        df["camber"]    = 0.0
        df["thickness"] = 0.0
    else:
        missing_afs = sorted(set(df["airfoil"].unique()) - set(geometry.keys()))
        if missing_afs:
            print(f"[polar_df_to_train] Warning: no geometry for "
                  f"{missing_afs} — camber/thickness = 0.0 for those.")
        df["camber"] = df["airfoil"].map(
            {k: v.get("camber",    0.0) for k, v in geometry.items()}
        ).fillna(0.0)
        df["thickness"] = df["airfoil"].map(
            {k: v.get("thickness", 0.0) for k, v in geometry.items()}
        ).fillna(0.0)

    # ── 5. Airfoil integer encoding ──────────────────────────────────────────
    af_names   = sorted(df["airfoil"].unique())
    af_enc_map = {name: i for i, name in enumerate(af_names)}
    df["af_enc"] = df["airfoil"].map(af_enc_map)

    # ── 6. Alpha features ────────────────────────────────────────────────────
    a_rad           = np.radians(df["alpha"])
    df["alpha_rad"] = a_rad
    df["sin_alpha"] = np.sin(a_rad)
    df["cos_alpha"] = np.cos(a_rad)
    df["alpha_sq"]  = df["alpha"] ** 2

    # ── 7. Reynolds features ─────────────────────────────────────────────────
    re              = df["Re"].clip(lower=1.0)
    df["re_norm"]   = re / 2e6          # normalised to 2M
    df["re_log"]    = np.log10(re)      # order-of-magnitude Re effect

    # ── 8. Mach features ─────────────────────────────────────────────────────
    mach                    = df["Mach"].clip(lower=0.0, upper=0.99)
    df["mach"]              = mach
    df["mach_sq"]           = mach ** 2
    df["prandtl_glauert"]   = 1.0 / np.sqrt(          # compressibility factor
        (1.0 - mach ** 2).clip(lower=1e-6)            # 1/√(1-M²)  → ∞ near M=1
    )

    # ── 9. Transition setting features ──────────────────────────────────────
    # Ncrit: higher = more laminar-friendly (quiet tunnel / low turbulence)
    df["ncrit"]    = df["Ncrit"]
    # xtrf: forced transition chord fraction (1.0 = free transition)
    df["xtrf_top"] = df["xtrf_top"]
    df["xtrf_bot"] = df["xtrf_bot"]

    # ── 10. Transition location features (XFoil BL solver output) ───────────
    df["top_xtr_n"] = df["Top_Xtr"]    # normalised 0-1
    df["bot_xtr_n"] = df["Bot_Xtr"]
    df["top_xtr"]   = df["Top_Xtr"]
    df["bot_xtr"]   = df["Bot_Xtr"]

    # ── 11. Derived aerodynamic quantities ───────────────────────────────────
    df["LD"]      = df["CL"] / df["CD"].clip(lower=1e-9)
    df["breguet"] = df["CL"] ** 1.5 / df["CD"].clip(lower=1e-9)

    # ── 12. Metadata passthrough ─────────────────────────────────────────────
    df["re_val"] = df["Re"]       # alias used by rest of pipeline

    # ── 13. Final column order ───────────────────────────────────────────────
    keep = [
        # identity
        "af_enc",
        # alpha
        "alpha", "alpha_rad", "sin_alpha", "cos_alpha", "alpha_sq",
        # geometry
        "camber", "thickness",
        # Reynolds
        "re_norm", "re_log",
        # Mach
        "mach", "mach_sq", "prandtl_glauert",
        # transition settings (inputs to XFoil)
        "ncrit", "xtrf_top", "xtrf_bot",
        # transition locations (outputs from XFoil BL solver)
        "top_xtr_n", "bot_xtr_n",
        # targets
        "CL", "CD", "CDp", "CM",
        # derived
        "top_xtr", "bot_xtr", "LD", "breguet",
        # metadata (not used as features but useful for analysis)
        "airfoil", "re_val", "Mach",
    ]
    df = df[keep].reset_index(drop=True)

    # ── 14. Summary ──────────────────────────────────────────────────────────
    uniq = lambda col: df[col].nunique()
    print(f"[polar_df_to_train] Ready")
    print(f"  Rows     : {len(df)}")
    print(f"  Airfoils : {len(af_names)}  -> {af_names}")
    print(f"  Re       : {uniq('re_val')} unique  "
          f"({df['re_val'].min():.0f} — {df['re_val'].max():.0f})")
    print(f"  Mach     : {uniq('mach')} unique  "
          f"({df['mach'].min():.3f} — {df['mach'].max():.3f})")
    print(f"  Ncrit    : {uniq('ncrit')} unique  "
          f"({df['ncrit'].min():.1f} — {df['ncrit'].max():.1f})")
    print(f"  xtrf_top : {uniq('xtrf_top')} unique  "
          f"({df['xtrf_top'].min():.3f} — {df['xtrf_top'].max():.3f})")
    print(f"  xtrf_bot : {uniq('xtrf_bot')} unique  "
          f"({df['xtrf_bot'].min():.3f} — {df['xtrf_bot'].max():.3f})")
    print(f"  alpha    : {df['alpha'].min():.1f} — {df['alpha'].max():.1f} deg")
    print(f"  CL       : {df['CL'].min():.4f} — {df['CL'].max():.4f}")
    print(f"  CD       : {df['CD'].min():.6f} — {df['CD'].max():.6f}")
    print(f"  Features : {[c for c in keep if c not in ('CL','CD','CDp','CM','top_xtr','bot_xtr','LD','breguet','airfoil','re_val','Mach')]}")

    return df

# ---------------------------------------------------------------------------
# Generate Geometry Map for key in training file.
# ---------------------------------------------------------------------------

def extract_geometry(airfoil_path, xfoil_path='./Xfoil6.99/xfoil.exe'):
    """Memanggil XFOIL untuk mendapatkan data camber dan thickness."""
    # Perintah XFOIL: Load file, Pane (untuk proses geometri), lalu Quit
    commands = f"LOAD {airfoil_path}\nPANE\nQUIT\n"
    
    try:
        process = subprocess.Popen(
            [xfoil_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, _ = process.communicate(input=commands, timeout=5)
        
        thickness = 0.0
        camber = 0.0
        
        # Parsing output teks XFOIL
        for line in stdout.split('\n'):
            if "Max thickness" in line:
                # Mengambil angka setelah '=' dan sebelum 'at'
                thickness = float(line.split('=')[1].split('at')[0].strip())
            if "Max camber" in line:
                camber = float(line.split('=')[1].split('at')[0].strip())
                
        return {"camber": camber, "thickness": thickness}
    except Exception as e:
        print(f"Error processing {airfoil_path}: {e}")
        return {"camber": 0.0, "thickness": 0.0}


def generate_geometry_map(folder_path):
    # Cari semua file .dat di folder data
    dat_files = glob.glob(os.path.join(folder_path, "*.dat"))
    geometry_map = {}
    
    print(f"Processing {len(dat_files)} airfoils...")
    
    for i, file_path in enumerate(dat_files):
        # Ambil nama file tanpa ekstensi sebagai key
        af_name = os.path.basename(file_path).replace('.dat', '').lower()
        
        # Ekstrak data
        geo_data = extract_geometry(file_path)
        geometry_map[af_name] = geo_data
        
        if (i + 1) % 10 == 0:
            print(f"Progress: {i + 1}/{len(dat_files)}")
            
    return geometry_map
