"""
=============================================================================
  load.py
  ---------------------
  Secondary Function:

 - Reads Xfoil.dat files from a folder and return as files variable.
  Parse data structure to json format for debugging.
 - Utility functions for reading XFoil coordinate (.dat) files from a folder
  and exporting data to JSON format.
 - Scan the 'coord/' sub-folder (located next to this script) and return
  only the .dat files whose filename stem contains the substring 'custom'
  (case-insensitive).  All other .dat files in the folder are ignored.

    Functions
    ---------
    get(folder)
        Scan the 'coord/' folder for all .dat files.
        Returns either full paths or bare filenames depending on the flag.
    getCustom(folder, return_names)
    json_d(data, name)
        Serialise a Python object to a pretty-printed JSON file.

    Parameters
    ----------
    folder : Path to folder file
    data : Folder/File path contain data to Convert to JSON  
    name : Name of JSON file
    return_names : bool, optional
        - False (default) : return a list of full absolute file paths.
        - True            : return a list of bare filename stems
                            (no directory path, no .dat extension).

    Example
    -------
    if __name__ == "__main__":
        name = get("coord") ---> Case file in folder name coord/*.dat
        print("Full paths:", get("coord"))
        print("Names only:", get("coord"))
    if __name__ == "__main__":
        x = 'coord/dict' --> Case file was in folder coord and has name file dict
        json_d(x,"json") --> JSON file will named json.json
    
    if __name__ == "__main__":
        print(getCustom("custom")) --> Case file was in folder "custom"
>>> ['/path/to/coord/custom_wing.dat', '/path/to/coord/naca2412_custom.dat']

        print(getCustom("custom", return_names=True)) --> Default return_names was FALSE
>>> ['custom_wing', 'naca2412_custom']

  -----------------------------------------------------------------
  Main function:

  Reads XFoil polar.txt files from a folder and builds the AIRFOILS
  dict-list-tuple structure used machine learning.
  Output structure :
  ---------------------------------------------------------------------------
  AIRFOILS = {
      "NACA_2421": [
          {"camber": ..., "thickness": ..., "re_nom": ...,   # [0]  meta dict
           "description": ..., "mach": ..., "ncrit": ...},
          (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr),       # [1]  1st polar tuple
          (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr),       # [2]  ...
          ...
      ],
      "NACA_4412": [...],
      ...
  }

  Polar tuple index constants (re-exported for caller convenience):
      I_ALPHA=0  I_CL=1  I_CD=2  I_CDP=3  I_CM=4  I_TOPXTR=5  I_BOTXTR=6

  Usage
  -----
  from xfoil_polar_loader import load_polar_folder, af_meta, af_polar

  AIRFOILS = load_polar_folder("pre")          # load all .txt in folder "pre"

  meta  = af_meta(AIRFOILS, "NACA_2421")       # -> dict
  polar = af_polar(AIRFOILS, "NACA_2421")      # -> list of tuples
  cl_at_row0 = af_polar(AIRFOILS,"NACA_2421")[0][I_CL]

  # Or drop-in replace the hardcoded AIRFOILS in main.py:
  #   from xfoil_polar_loader import load_polar_folder, af_meta, af_polar, I_ALPHA,...
  #   AIRFOILS = load_polar_folder("pre")

  XFoil file format expected
  --------------------------
  Any .txt file that contains lines like:

      Calculated polar for: NACA 2421
      Mach =   0.000     Re =     8.167 e 6     Ncrit =   9.000
        alpha    CL        CD       CDp       CM     Top_Xtr  Bot_Xtr
       ------ -------- ...
       -2.000   0.0251   0.00618 ...
        0.000   0.2568   ...
        ...

  The parser is tolerant of:
    - leading/trailing whitespace
    - blank lines
    - comment lines starting with any non-numeric character
    - "Re = 8.167 e 6" notation (with or without space before 'e')
    - uppercase/lowercase airfoil names
    - any filename convention (NACA_2421.txt, naca2421_polar.txt, E387.txt, ...)

  Geometry inference
  ------------------
  If the airfoil is a standard NACA 4-digit or 5-digit series, camber and
  thickness are derived analytically from the digits.
  For named sections (Clark_Y, S1223, E387, MH_60, Eppler_423) a lookup
  table is used.
  For unknown sections, camber=0 and thickness=0.12 are used as defaults
  and a warning is printed.
=============================================================================
"""

import os
import glob
import json
import warnings
import re
from pathlib import Path
import argparse
import sys

# ---------------------------------------------------------------------------
#  Polar column index constants
# ---------------------------------------------------------------------------
I_ALPHA, I_CL, I_CD, I_CDP, I_CM, I_TOPXTR, I_BOTXTR = range(7)

# ---------------------------------------------------------------------------
#  Known geometry table for non-NACA named airfoils
# ---------------------------------------------------------------------------
_KNOWN_GEOMETRY = {
    # name (lower, no spaces/dashes) : (camber, thickness)
    "clarky": (0.036, 0.117),
    "clark_y": (0.036, 0.117),
    "clark y": (0.036, 0.117),
    "s1223": (0.090, 0.120),
    "eppler423": (0.060, 0.130),
    "eppler_423": (0.060, 0.130),
    "e423": (0.060, 0.130),
    "e387": (0.037, 0.091),
    "eppler387": (0.037, 0.091),
    "mh60": (0.020, 0.100),
    "mh_60": (0.020, 0.100),
    "mh 60": (0.020, 0.100),
    "fx63137": (0.065, 0.137),
    "sd7037": (0.030, 0.092),
    "ag35": (0.035, 0.098),
    "rg15": (0.020, 0.086),
    "naca0009": (0.000, 0.090),
    "naca0010": (0.000, 0.100),
    "naca0015": (0.000, 0.150),
    "naca0018": (0.000, 0.180),
    "naca0021": (0.000, 0.210),
    "naca0024": (0.000, 0.240),
}

# ---------------------------------------------------------------------------
# Load Xfoil.dat file in folder
# ---------------------------------------------------------------------------


def get(folder):
    """
    Ambil semua file .dat dari folder coord.
    Jika return_names=True -> hanya nama file tanpa path dan ekstensi.
    Jika return_names=False -> full path file .dat.
    """
    base_dir = os.path.dirname(__file__)
    folder = os.path.join(base_dir, folder)

    # Cari semua file .dat (case-insensitive)
    files = glob.glob(os.path.join(folder, "*.dat")) + glob.glob(
        os.path.join(folder, "*.DAT")
    )

    return files


def getCustom(folder,return_names: bool = False) -> list:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    folder_path   = os.path.join(base_dir, folder)

    if not os.path.isdir(folder_path):
        print(f"[coord_utils] Warning: {folder}/ folder not found — '{folder}'",
              file=sys.stderr)
        return []

    # Collect all .dat/.DAT files from coord/
    files = glob.glob(os.path.join(folder_path, "*.dat")) \
          + glob.glob(os.path.join(folder_path, "*.DAT"))

    # Remove duplicates that arise on case-insensitive file systems
    files = list({os.path.normcase(f): f for f in files}.values())

    # Keep only files whose stem contains 'custom' (case-insensitive)
    matched = [
        f for f in files
        if "custom" in os.path.splitext(os.path.basename(f))[0].lower()
    ]

    if not matched:
        print("[load_file] Warning: no 'custom' files found in coord/",
              file=sys.stderr)
        return []

    matched.sort()

    if return_names:
        return [os.path.splitext(os.path.basename(f))[0] for f in matched]

    return matched

# ---------------------------------------------------------------------------
# Polar Json Parser
# ---------------------------------------------------------------------------


def json_d(data, name):
    with open(name + ".txt", "w") as f:
        json.dump(data, f, indent=4)


# ---------------------------------------------------------------------------
#  NACA geometry inference
# ---------------------------------------------------------------------------


def _naca4_geometry(digits: str):
    """
    Parse NACA 4-digit series MPXX.
    Returns (camber, thickness) as fractions of chord.
    Example: '2412' -> camber=0.02, thickness=0.12
    """
    if len(digits) != 4 or not digits.isdigit():
        return None
    m = int(digits[0]) / 100.0  # max camber
    # p = int(digits[1]) / 10.0  # position of max camber (not needed here)
    t = int(digits[2:]) / 100.0  # max thickness
    return m, t


def _naca5_geometry(digits: str):
    """
    Parse NACA 5-digit series.
    First digit * 0.15 / 2 ≈ design CL; camber ≈ design_CL * 0.045 (approx).
    Thickness = last two digits / 100.
    Example: '23012' -> camber≈0.020, thickness=0.12
    """
    if len(digits) != 5 or not digits.isdigit():
        return None
    # design lift coefficient (approximate from first digit)
    cl_design = int(digits[0]) * 3 / 20.0  # e.g. 2 -> 0.30
    camber = cl_design * 0.065  # empirical fit
    t = int(digits[3:]) / 100.0
    return round(camber, 3), t


def _infer_geometry(airfoil_name: str):
    """
    Infer (camber, thickness) from airfoil name.
    Returns (camber, thickness) or (0.0, 0.12) as fallback.
    """
    name_clean = airfoil_name.strip().lower().replace("-", "").replace(" ", "_")

    # 1. Check known-geometry table
    name_no_sep = name_clean.replace("_", "").replace(" ", "")
    if name_no_sep in _KNOWN_GEOMETRY:
        return _KNOWN_GEOMETRY[name_no_sep]
    if name_clean in _KNOWN_GEOMETRY:
        return _KNOWN_GEOMETRY[name_clean]

    # 2. Try NACA 4-digit:  NACA_2412, naca2412, NACA 2412
    m4 = re.search(r"naca[_\s]?(\d{4})$", name_clean)
    if m4:
        result = _naca4_geometry(m4.group(1))
        if result:
            return result

    # 3. Try NACA 5-digit:  NACA_23012, naca23012
    m5 = re.search(r"naca[_\s]?(\d{5})$", name_clean)
    if m5:
        result = _naca5_geometry(m5.group(1))
        if result:
            return result

    # 4. Fallback
    warnings.warn(
        f"[xfoil_polar_loader] Cannot infer geometry for '{airfoil_name}'. "
        f"Using defaults: camber=0.0, thickness=0.12. "
        f"Add it to _KNOWN_GEOMETRY dict if needed.",
        UserWarning,
        stacklevel=3,
    )
    return 0.0, 0.12


# ---------------------------------------------------------------------------
#  Name normalisation
# ---------------------------------------------------------------------------


def _normalise_name(raw: str) -> str:
    """
    Turn 'NACA 2421', 'naca2421', 'NACA_2421' -> 'NACA_2421'
    Turn 'Clark Y', 'clark_y' -> 'Clark_Y'
    Turn 'E387', 'Eppler 387' -> 'E387' / 'Eppler_387'
    General rule: strip, title-case words, join with underscore.
    """
    s = raw.strip()
    # Collapse multiple spaces/underscores/dashes to single space
    s = re.sub(r"[\s_\-]+", " ", s)
    # Title-case each word then join with _
    parts = s.split()
    # Special handling: 'NACA 2412' -> 'NACA_2412'
    # Detect all-upper acronyms and keep them upper
    result = []
    for p in parts:
        if p.upper() == p and len(p) >= 2:
            result.append(p.upper())
        else:
            result.append(p.capitalize())
    return "_".join(result)


# ---------------------------------------------------------------------------
#  Re parsing: handles "8.167 e 6", "8.167e6", "8167000"
# ---------------------------------------------------------------------------


def _parse_re(line: str) -> float:
    """Extract Reynolds number from an XFoil header line."""
    # pattern: Re = <number> [e|E] <exp>  or just <number>
    m = re.search(r"[Rr]e\s*=\s*([\d.]+)\s*[eE]?\s*([\d]*)", line)
    if not m:
        return 3e5  # safe default
    mantissa = float(m.group(1))
    exp_str = m.group(2).strip()
    exponent = int(exp_str) if exp_str else 0
    return mantissa * (10**exponent)


# ---------------------------------------------------------------------------
#  Single-file parser
# ---------------------------------------------------------------------------


def parse_xfoil_file(filepath: str) -> dict:
    """
    Parse one XFoil polar .txt file.

    Returns a dict:
    {
        "name":        str,                  normalised airfoil name
        "re_nom":      float,                Reynolds number
        "mach":        float,
        "ncrit":       float,
        "camber":      float,
        "thickness":   float,
        "description": str,
        "polar":       list of tuples        (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr)
    }

    Raises ValueError if no polar data rows are found.
    """
    path = Path(filepath)
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()

    name_raw = ""
    re_nom = 3e5
    mach = 0.0
    ncrit = 9.0
    polar_rows = []
    header_done = False  # True after we've passed the dashes line

    for line in lines:
        stripped = line.strip()

        # ── airfoil name ──────────────────────────────────────────────────
        if re.search(r"[Cc]alculated polar for[:\s]+", stripped):
            raw = re.sub(r".*[Cc]alculated polar for[:\s]+", "", stripped).strip()
            name_raw = raw

        # ── Reynolds ──────────────────────────────────────────────────────
        elif re.search(r"[Rr]e\s*=", stripped):
            re_nom = _parse_re(stripped)
            m_mach = re.search(r"[Mm]ach\s*=\s*([\d.]+)", stripped)
            if m_mach:
                mach = float(m_mach.group(1))
            m_nc = re.search(r"[Nn]crit\s*=\s*([\d.]+)", stripped)
            if m_nc:
                ncrit = float(m_nc.group(1))

        # ── dashes line → next lines are data ────────────────────────────
        elif re.match(r"^\s*-{3,}", stripped):
            header_done = True

        # ── data rows ─────────────────────────────────────────────────────
        elif header_done and stripped:
            # must start with optional sign + digit
            if re.match(r"^-?\d", stripped):
                parts = stripped.split()
                if len(parts) >= 7:
                    try:
                        row = tuple(float(x) for x in parts[:7])
                        polar_rows.append(row)
                    except ValueError:
                        pass  # skip malformed line

    if not polar_rows:
        raise ValueError(f"No polar data found in: {filepath}")

    # Normalise name — prefer parsed name, fallback to filename stem
    if name_raw:
        name = _normalise_name(name_raw)
    else:
        stem = path.stem  # e.g. "naca2421_polar"
        # strip common suffixes: _polar, _data, _xfoil, _re300k ...
        stem = re.sub(
            r"[_\-](polar|data|xfoil|re\d+k?|ncrit\d+).*$", "", stem, flags=re.I
        )
        name = _normalise_name(stem)

    camber, thickness = _infer_geometry(name)

    return {
        "name": name,
        "re_nom": re_nom,
        "mach": mach,
        "ncrit": ncrit,
        "camber": camber,
        "thickness": thickness,
        "description": f"{name}, Re={re_nom:.2e}, Mach={mach}, Ncrit={ncrit}",
        "polar": polar_rows,
    }


# ---------------------------------------------------------------------------
#  Folder loader  — main public API
# ---------------------------------------------------------------------------


def loader(folder: str, pattern: str = "*.txt", verbose: bool = True) -> dict:
    """
    Load all XFoil polar files matching *pattern* from *folder*.

    Returns AIRFOILS dict in the same dict-list-tuple structure as
    uav_xfoil_ml.py:

        AIRFOILS[name] = [
            {meta dict},                                    # index [0]
            (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr),   # index [1]
            ...
        ]

    Parameters
    ----------
    folder  : str   path to the folder containing polar .txt files
    pattern : str   glob pattern, default "*.txt"
    verbose : bool  print a summary line per loaded file

    Raises
    ------
    FileNotFoundError  if folder does not exist
    """
    folder_path = Path(folder)
    if not folder_path.is_dir():
        raise FileNotFoundError(f"Polar folder not found: '{folder}'")

    files = sorted(folder_path.glob(pattern))
    if not files:
        raise FileNotFoundError(f"No files matching '{pattern}' found in '{folder}'")

    AIRFOILS = {}

    for fpath in files:
        try:
            parsed = parse_xfoil_file(fpath)
        except ValueError as e:
            warnings.warn(f"[xfoil_polar_loader] Skipping {fpath.name}: {e}")
            continue

        name = parsed["name"]

        # Build the [meta_dict, *polar_tuples] list
        meta_dict = {
            "camber": parsed["camber"],
            "thickness": parsed["thickness"],
            "re_nom": parsed["re_nom"],
            "mach": parsed["mach"],
            "ncrit": parsed["ncrit"],
            "description": parsed["description"],
        }

        entry = [meta_dict] + parsed["polar"]  # list[dict, tuple, tuple, ...]
        AIRFOILS[name] = entry

        if verbose:
            n_pts = len(parsed["polar"])
            alpha_range = (parsed["polar"][0][I_ALPHA], parsed["polar"][-1][I_ALPHA])
            print(
                f"  Loaded  {name:<20}  Re={parsed['re_nom']:.2e}  "
                f"pts={n_pts}  alpha=[{alpha_range[0]:.1f} .. {alpha_range[1]:.1f}]  "
                f"camber={parsed['camber']:.3f}  t/c={parsed['thickness']:.3f}"
            )

    if verbose:
        print(f"\n  Total airfoils loaded: {len(AIRFOILS)}")

    return AIRFOILS


# ---------------------------------------------------------------------------
#  Convenience accessors  (mirror uav_xfoil_ml.py helpers)
# ---------------------------------------------------------------------------


def af_meta(AIRFOILS: dict, name: str) -> dict:
    """
    Return geometry/metadata dict for airfoil.

    Example:
        meta = af_meta(AIRFOILS, "NACA_2421")
        camber = meta["camber"]           # -> 0.02
        re_nom = meta["re_nom"]           # -> 8167000.0
    """
    return AIRFOILS[name][0]


def af_polar(AIRFOILS: dict, name: str) -> list:
    """
    Return list of polar tuples for airfoil.
    Each tuple: (alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr)

    Example:
        polar    = af_polar(AIRFOILS, "NACA_2421")
        row0     = polar[0]                       # first alpha point
        alpha0   = polar[0][I_ALPHA]              # -2.0
        cl0      = polar[0][I_CL]                 # 0.0251
    """
    return AIRFOILS[name][1:]


def af_interp(AIRFOILS: dict, name: str, alpha_deg: float, col: int):
    """
    Linear interpolation of any polar column at arbitrary alpha.

    Parameters
    ----------
    AIRFOILS  : dict   the AIRFOILS dict
    name      : str    airfoil key
    alpha_deg : float  angle of attack in degrees
    col       : int    column index constant (I_CL, I_CD, etc.)

    Example:
        cl_at_2deg = af_interp(AIRFOILS, "NACA_2421", 2.0, I_CL)
    """
    import numpy as np

    polar = af_polar(AIRFOILS, name)
    alphas = [pt[I_ALPHA] for pt in polar]
    vals = [pt[col] for pt in polar]
    return float(np.interp(alpha_deg, alphas, vals))


# ---------------------------------------------------------------------------
#  Pretty-printer
# ---------------------------------------------------------------------------


def print_airfoils(AIRFOILS: dict, show_polar: bool = True):
    """Print a formatted summary of the loaded AIRFOILS database."""
    SEP = "=" * 72
    print(SEP)
    print(f"  AIRFOILS database  —  {len(AIRFOILS)} entries")
    print(f"  Structure: AIRFOILS[name][0] = meta dict")
    print(f"             AIRFOILS[name][1:] = polar tuples")
    print(
        f"  Polar columns: [0]=alpha [1]=CL [2]=CD [3]=CDp [4]=CM "
        f"[5]=Top_Xtr [6]=Bot_Xtr"
    )
    print(SEP)

    for name, entry in AIRFOILS.items():
        meta = entry[0]
        polar = entry[1:]
        alphas = [pt[I_ALPHA] for pt in polar]
        cls = [pt[I_CL] for pt in polar]
        cds = [pt[I_CD] for pt in polar]

        print(f"\n  [{name}]")
        print(
            f"    camber={meta['camber']:.4f}  t/c={meta['thickness']:.4f}  "
            f"Re_nom={meta['re_nom']:.3e}  Ncrit={meta.get('ncrit', 9):.1f}"
        )
        print(
            f"    Alpha range : {min(alphas):.1f} to {max(alphas):.1f} deg  "
            f"({len(polar)} points)"
        )
        print(f"    CL range    : {min(cls):.4f} to {max(cls):.4f}")
        print(f"    CD range    : {min(cds):.5f} to {max(cds):.5f}")
        if show_polar:
            hdr = (
                f"    {'alpha':>7}  {'CL':>8}  {'CD':>9}  "
                f"{'CDp':>9}  {'CM':>8}  {'Top_Xtr':>8}  {'Bot_Xtr':>8}"
            )
            print(hdr)
            print("    " + "-" * 68)
            for pt in polar:
                print(
                    f"    {pt[I_ALPHA]:>7.3f}  {pt[I_CL]:>8.4f}  {pt[I_CD]:>9.5f}  "
                    f"{pt[I_CDP]:>9.5f}  {pt[I_CM]:>8.4f}  "
                    f"{pt[I_TOPXTR]:>8.4f}  {pt[I_BOTXTR]:>8.4f}"
                )
    print()


# ---------------------------------------------------------------------------
#  CLI — run directly to test: python Loader.py <folder>
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    folder = sys.argv[1] if len(sys.argv) > 1 else "pre"
    print(f"\nLoading XFoil polars from folder: '{folder}'\n")

    AIRFOILS = loader(folder, verbose=True)
    print()
    print_airfoils(AIRFOILS, show_polar=True)

    # Demo: access patterns
    if AIRFOILS:
        first = next(iter(AIRFOILS))
        print(f"  Access examples for '{first}':")
        print(f"    AIRFOILS['{first}'][0]               = {AIRFOILS[first][0]}")
        print(f"    AIRFOILS['{first}'][1]               = {AIRFOILS[first][1]}")
        print(
            f"    af_meta(AIRFOILS, '{first}')['camber']  = {af_meta(AIRFOILS, first)['camber']}"
        )
        print(
            f"    af_polar(AIRFOILS, '{first}')[0][I_CL]  = {af_polar(AIRFOILS, first)[0][I_CL]}"
        )
        print(
            f"    af_interp(AIRFOILS, '{first}', 3.0, I_CL) = "
            f"{af_interp(AIRFOILS, first, 3.0, I_CL):.5f}  (CL at alpha=3 deg, interpolated)"
        )
