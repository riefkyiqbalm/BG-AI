"""
xfoilrun.py
===========
Automation layer for batch-running XFoil (v6.99) polar analysis and
collecting results into a single pandas DataFrame.

Each function writes a temporary XFoil command script (com_input.txt),
pipes it to xfoil.exe via subprocess, then parses the polar output file
written to the pre/ folder.

Polar output columns
--------------------
alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re

Function summary
----------------
run(airfoils, d_path, ...)
    Folder of .dat files -> load each by full path with LOAD command.

runN(airfoils, d_path, ...)
    List of NACA/name strings -> let XFoil resolve geometry internally.

runDT4(airfoils, d_path, ...)
    List of filenames WITH .dat extension -> LOAD + PANE with panel count 4.

runCustom(airfoils, ...)
    List of full/relative paths to custom .dat files anywhere on disk.
"""

import subprocess
import os
import pandas as pd
import numpy as np
import re

_POLAR_COLS = ["alpha", "CL", "CD", "CDp", "CM", "Top_Xtr", "Bot_Xtr"]
_SKIP_ROWS  = 12        # XFoil polar header lines to skip
_DEFAULT_RE = 200_000
_DEFAULT_IT = 100       # Newton iteration limit
_DEFAULT_MH = 0
_DEFAULT_N  = 9


# =============================================================================
# Internal helpers
# =============================================================================


def _xfoil_exe():
    """Absolute path to xfoil.exe, located next to this script."""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "Xfoil6.99", "xfoil.exe")

def _ensure_pre():
    """Create the pre/ output directory if it does not exist yet."""
    os.makedirs("pre", exist_ok=True)

def _run_script(script):
    """Write script to com_input.txt and pipe it to xfoil.exe."""
    with open("com_input.txt", "w") as f:
        f.write(script)
    with open("com_input.txt", "rb") as stdin_f:
        subprocess.run([_xfoil_exe()], stdin=stdin_f)

def _polar_path(af_path):
    """Return (af_name, polar_file) derived from a resolved .dat path."""
    af_name    = os.path.splitext(os.path.basename(af_path))[0]
    polar_file = f"data/{af_name}_polar.txt"
    return af_name, polar_file

# def _collect(dataset, chunk):
#     """Append chunk to dataset only when chunk is non-empty."""
#     if chunk.empty:
#         return dataset
#     return pd.concat([dataset, chunk], ignore_index=True)

# def _resolve(af, d_path):
#     """Join af with d_path when af is a bare filename, else return as-is."""
#     if d_path and not os.path.isabs(af):
#         return os.path.join(d_path, af)
#     return af

def _polar_dataframe(pf, name_af, m, a, re_n ):
    #  Membaca Polar dan Konversi ke DataFrame (Merge Pipeline)
    if os.path.exists(pf):
        try:
            cols = ["alpha", "CL", "CD", "CDp", "CM", "Top_Xtr", "Bot_Xtr"]
            data = pd.read_csv(
                pf,
                sep=r'\s+',
                skiprows=12,
                names=cols,
                engine='python'
            )
                        
            if not data.empty:
                # Tambahkan metadata agar data bisa dibedakan setelah di-merge
                    data["airfoil"] = name_af
                    data["Re"] = re_n
                    data["Mach"] = m
                    a.append(data)
            return a
                            
        except Exception as e:
                print(f"[xfoilrun] Error parsing {pf}: {e}")
    else:
                print(f"[xfoilrun] WARNING!!: FILE {pf} (404) IS NOT FOUND.")


# Merge Untuk Multi Run

def _mergeDf(all_df, df):
    if all_df:
        # Menggabungkan semua list dataframe menjadi satu
        final_dataset = pd.concat(all_df, ignore_index=True)
        
        # Sorting agar data rapi: Airfoil -> Mach -> Alpha
        final_dataset = final_dataset.sort_values(["airfoil", "Mach", "alpha"]).reset_index(drop=True)
        
        # Simpan hasil gabungan ke file .txt (Tab Separated)
        final_output = "preDf/"+df+"_dataframe.txt"
        os.makedirs("preDf/", exist_ok=True)
        final_dataset.to_csv(final_output, sep='\t', index=False, float_format='%.6f')
        
        print(f"\n[DONE] Success merged {len(all_df)} dataframes.")
        print(f"[DONE] Final file was stored in: {final_output}")
        
        return final_dataset
    else:
        print("[ERROR] NO DATASET WAS COLLECTED.")
        return pd.DataFrame()
    
# def _run_script_timeout(script, timeout=60):
#     """
#     Write script to com_input.txt, pipe it to xfoil.exe, and enforce a
#     hard timeout.  If XFoil has not exited within *timeout* seconds the
#     process is killed and a warning is printed.
 
#     Parameters
#     ----------
#     script  : str    XFoil command string to execute
#     timeout : int    seconds to wait before killing XFoil (default 60)
 
#     Returns
#     -------
#     bool  True if XFoil finished normally, False if it was killed.
#     """
#     with open("com_input.txt", "w") as f:
#         f.write(script)
#     with open("com_input.txt", "rb") as stdin_f:
#         proc = subprocess.Popen([_xfoil_exe()], stdin=stdin_f)
#     try:
#         proc.wait(timeout=timeout)
#         return True
#     except subprocess.TimeoutExpired:
#         proc.kill()
#         proc.wait()   # reap the zombie
#         print(f"[xfoilrun] XFoil killed after {timeout}s — run timed out")
#         return False


# =============================================================================
# Public functions
# =============================================================================

def run(airfoils, d_path, alpha_start, alpha_end, alpha_step, df_name, mach=_DEFAULT_MH):
    """
    Run XFoil polar analysis for .dat coordinate files stored in one folder.

    Use this function when you already have a folder of coordinate files
    in Selig .dat format and want to run them all through XFoil in one
    call.  Each file is loaded into XFoil with the LOAD command, which
    reads the (x/c, y/c) coordinate pairs from disk and generates the
    geometry from scratch. You cannot custom the value of Mach, Reynolds,Ncrit
    and xtrf value. 

    The typical workflow is:

        files = get(return_names=False)        # Load the dari folder/data.dat
        df    = run(files, d_path="folder")

    Parameters
    ----------
    airfoils : list[str]
        File names (e.g. 'naca2412.dat') or full absolute paths.
        When a bare filename is given, it is joined with d_path.
    d_path : str
        Directory that contains the .dat files.  Pass "" or None to
        treat every entry in airfoils as an absolute path.
    alpha_start : float, optional
        First angle of attack in the sweep (degrees).  Default -2.
    alpha_end : float, optional
        Last angle of attack in the sweep (degrees).  Default 12.
    alpha_step : float, optional
        Increment between angles of attack (degrees).  Default 2.

    Returns
    -------
    pd.DataFrame
        Concatenated polar data for all airfoils with columns:
        alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re.
        Returns an empty DataFrame when no data could be collected.

    Example
    -------
    >>> from coord_utils import get
    >>> df = run(get(return_names=False), d_path="coord", reynolds=300_000)
    """
    _ensure_pre()
    all_dataframes = []

    for af in airfoils:
        # If coord_path is given and af is just a filename, join them
        # if d_path and not os.path.isabs(af):
        #     af_path = os.path.join(d_path, af)
        # else:
        af_path    = af
        af_name,pf = _polar_path(af_path)
        af_label   = f"{af_name}.dat"

        # Build XFOIL input script
        script = f"""LOAD {d_path}/{af_label}
        PANE
        OPER
        VISC 200000
        ITER 100
        PACC
        {pf}

        ASEQ {alpha_start} {alpha_end} {alpha_step}
        PACC

        QUIT
        """
        _run_script(script)
        _polar_dataframe(pf, af_name, mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)


def runN(airfoils, d_path, reynolds, alpha_start, alpha_end, alpha_step, df_name, mach=_DEFAULT_MH):
    """
    Run XFoil polar analysis using XFoil's built-in airfoil name resolver.

    Use this function when you only have a list of standard NACA or named
    airfoil strings and do NOT have local .dat files.  XFoil can generate
    the geometry for any NACA 4-digit or 5-digit series internally simply
    by receiving the name string at its opening prompt (e.g. typing
    'naca2412' at the XFoil prompt is equivalent to loading a coordinate
    file for that profile).

    The typical workflow is:

        names = ['naca2412', 'naca4412', 'naca23012']
        df    = runN(names, reynolds=500_000)

    Parameters
    ----------
    airfoils : list[str]
        XFoil-recognised airfoil name strings.  The string is placed
        directly at the XFoil opening prompt, so it must match XFoil's
        internal naming convention exactly (e.g. 'naca2412', not 'NACA 2412').
    d_path : str
        Not used by this function.  Retained for API consistency with run().
    reynolds : float, optional
        Reynolds number for the viscous boundary-layer solve.  Default 200 000.
    alpha_start : float, optional
        First angle of attack in the sweep (degrees).  Default -2.
    alpha_end : float, optional
        Last angle of attack in the sweep (degrees).  Default 12.
    alpha_step : float, optional
        Increment between angles of attack (degrees).  Default 2.

    Returns
    -------
    pd.DataFrame
        Concatenated polar data for all airfoils with columns:
        alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re.
        Returns an empty DataFrame when no data could be collected.

    Example
    -------
    >>> names = ['naca2412', 'naca4412', 'naca23012']
    >>> df = runN(names, reynolds=500_000)
    >>> print(df[df['airfoil'] == 'naca2412'])
    """
    _ensure_pre()
    all_dataframes =[]

    for af in airfoils:
        af_path = af
        af_name,pf = _polar_path(af_path)
        script = f"""
        {af}
        PANE
        OPER
        VISC {reynolds}
        ITER 100
        PACC
        {pf}
        
        ASEQ {alpha_start} {alpha_end} {alpha_step}
        PACC
        QUIT
        """
        _run_script(script)
        _polar_dataframe(pf, af_name, mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)


def runNACA(airfoils, d_path, reynolds, alpha_start, alpha_end, alpha_step, series, df_name, mach=_DEFAULT_MH):
    """
    Run XFoil polar analysis for a list of .dat filenames (with extension)
    using PANE panel refinement level 4.

    Use this function when your input list already includes the .dat
    extension in each entry (e.g. ['naca2412.dat', 'clark_y.dat']).
    Compared to run(), this function:

      1. Handles the .dat extension in the list entries explicitly —
         os.path.splitext strips it cleanly so the polar output file is
         named after the airfoil stem only (e.g. pre/naca2412_polar.txt).

      2. Sends '4' to XFoil immediately after the PANE command, which sets
         the panel-node count multiplier to 4 (approximately 4 x 40 = 160
         panels by default).  More panels improve solution accuracy near
         the leading edge and for highly cambered sections at the cost of
         slightly longer runtime.

    Bugs fixed from the original commented-out version
    ---------------------------------------------------
    Bug 1 — Missing LOAD keyword:
        Original script started with just the raw file path on its own line,
        causing XFoil to try to interpret it as an airfoil name rather than
        a file to load.  Fixed by prepending 'LOAD' to the path.

    Bug 2 — Wrong position of panel count '4':
        The original script placed '4' BEFORE the PANE command.  XFoil
        reads the panel count as the line that immediately FOLLOWS the PANE
        command, so '4' must come after PANE, not before it.

    Parameters
    ----------
    airfoils : list[str]
        Filenames including the .dat extension, or full absolute paths.
        Examples: ['naca2412.dat', 'naca4412.dat', 'clark_y.dat']
        When a bare filename is given, it is joined with d_path.
    d_path : str
        Directory that contains the .dat files.  Pass "" or None to
        treat every entry in airfoils as an absolute path.
    reynolds : float, optional
        Reynolds number for the viscous boundary-layer solve.  Default 200 000.
    alpha_start : float, optional
        First angle of attack in the sweep (degrees).  Default -2.
    alpha_end : float, optional
        Last angle of attack in the sweep (degrees).  Default 12.
    alpha_step : float, optional
        Increment between angles of attack (degrees).  Default 2.

    Returns
    -------
    pd.DataFrame
        Concatenated polar data for all airfoils with columns:
        alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re.
        Returns an empty DataFrame when no data could be collected.

    Example
    -------
    >>> dat_list = ['naca2412.dat', 'naca4412.dat', 'clark_y.dat']
    >>> df = runDT4(dat_list, d_path="coord", reynolds=300_000)
    >>> print(df.head())
    """
    _ensure_pre()
    all_dataframes = []

    for af in airfoils:
        # Build full path — af already carries the .dat extension
        if d_path and not os.path.isabs(af):
            af_path = os.path.join(d_path, af)
        else:
            af_path = af

        if not os.path.exists(af_path):
            print(f"[xfoilrun] File not found, skipping: {af_path}")
            continue

        # Strip .dat extension for a clean polar output filename
        af_name,pf = _polar_path(af_path)

        # FIX 1: 'LOAD' keyword added before the file path
        # FIX 2: '4' placed AFTER PANE (XFoil reads panel count on the next line)
        script = f"""LOAD {af_path}
        PANE
        {series}
        OPER
        VISC {reynolds}
        ITER 100
        PACC
        {pf}

        ASEQ {alpha_start} {alpha_end} {alpha_step}
        PACC

        QUIT
        """

        # Parse results
        _run_script(script)
        _polar_dataframe(pf, af_name, mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)


def runCustom(airfoils, d_path, reynolds=_DEFAULT_RE, alpha_start=-2, alpha_end=12, alpha_step=2, df_name ="", mach = _DEFAULT_MH, t_path = ""):
    """
    Run XFoil polar analysis for custom .dat coordinate files at arbitrary
    locations on the filesystem.

    Use this function when your .dat files are NOT organised in a single
    shared folder — for example files spread across multiple project
    directories, mixed with files from different sources, or when you want
    to pass absolute paths directly without relying on a d_path base
    directory.

    Unlike run() and runDT4(), this function has no d_path parameter
    because the complete path to each file is already embedded in the list.
    The airfoil name used for labelling and for the polar output filename is
    derived from the filename stem (everything before the last dot), so
    'C:/designs/wing_v3.dat' produces pre/wing_v3_polar.txt and is tagged
    as 'wing_v3' in the returned DataFrame.

    Parameters
    ----------
    airfoils : list[str]
        Full or relative paths to custom .dat coordinate files.
        Examples:
            [
                "C:/Users/me/designs/custom_wing.dat",
                "../variants/variant_b.dat",
                "modified_naca2412.dat",
            ]
        Relative paths are resolved from the current working directory.
    reynolds : float, optional
        Reynolds number for the viscous boundary-layer solve.  Default 200 000.
    alpha_start : float, optional
        First angle of attack in the sweep (degrees).  Default -2.
    alpha_end : float, optional
        Last angle of attack in the sweep (degrees).  Default 12.
    alpha_step : float, optional
        Increment between angles of attack (degrees).  Default 2.

    Returns
    -------
    pd.DataFrame
        Concatenated polar data for all airfoils with columns:
        alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re.
        Returns an empty DataFrame when no data could be collected.

    Notes
    -----
    Files that cannot be found on disk are skipped with a printed warning
    rather than raising an exception, so the remaining files in the list
    are still processed.

    Example
    -------
    >>> custom = [
    ...     "designs/wing_v1.dat",
    ...     "C:/airfoils/special_section.dat",
    ... ]
    >>> df = runCustom(custom, reynolds=400_000, alpha_start=0, alpha_end=10)
    >>> print(df.groupby("airfoil")[["CL", "CD"]].max())
    """
    _ensure_pre()
    all_dataframes =[]

    for af in airfoils:
        af_path = os.path.abspath(af)
        if not os.path.exists(af_path):
            print(f"[xfoilrun] not found, skipping: {af_path}")
            continue
        af_name = os.path.splitext(os.path.basename(af_path))[0]
             # 1. Setup Folder & Path Output
        folder = f"{t_path}{mach}"
        os.makedirs(folder, exist_ok=True)
        pf = f"{folder}/{af_name}_polar.txt"
            
        # Hapus file lama agar tidak append data yang salah
        if os.path.exists(pf):
                os.remove(pf)

        # Strip 'custom' and surrounding separators (_ or -) from the label
        # so the airfoil column shows the clean name, e.g.
        #   'custom_wing'          -> 'wing'
        #   'naca2412_custom'      -> 'naca2412'
        #   'my_custom_section'    -> 'my_section'
        af_label = f"{af_name}.dat"

        script = f""" LOAD {d_path}/{af_label}
        PANE
        OPER
        VISC {reynolds}
        ITER 100
        PACC
        {pf}

        ASEQ {alpha_start} {alpha_end} {alpha_step}
        PACC

        QUIT
        """

        _run_script(script)
        _polar_dataframe(pf, af_name, mach, a=all_dataframes,re_n=reynolds)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)


def runMach(airfoils, d_path, reynolds=_DEFAULT_RE, mach=0.0,
        alpha_start=-2, alpha_end=12, alpha_step=2, df_name=""):
    """
    Run XFoil polar analysis for .dat coordinate files stored in one folder.

    Parameters
    ----------
    airfoils : list[str]
        File names or full paths to .dat coordinate files.
    d_path : str
        Directory containing the .dat files.
    reynolds : float, optional
        Reynolds number. Default 200 000.
    mach : float, optional
        Freestream Mach number. Default 0.0 (incompressible).
        XFoil applies Karman-Tsien correction. Valid range: 0.0 – 0.4.
        Set to 0.0 to skip the MACH command entirely.
    alpha_start : float, optional
        First angle of attack in degrees. Default -2.
    alpha_end : float, optional
        Last angle of attack in degrees. Default 12.
    alpha_step : float, optional
        AoA increment in degrees. Default 2.

    Returns
    -------
    pd.DataFrame
        Columns: alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr, airfoil, Re, Mach.
    """
    _ensure_pre()
    all_dataframes = [] # List untuk menampung dataframe tiap iterasi

    # Build the MACH line only when Mach > 0
    mach_cmd = f"MACH {mach:.13f}" if mach > 0.0 else ""

    for af in airfoils:
        if d_path and not os.path.isabs(af):
            af_path = os.path.join(d_path, af)
        else:
            af_path = af

        af_name, pf = _polar_path(af_path)
        af_label = f"{af_name}.dat"

        script = f"""LOAD {d_path}/{af_label}
        PANE
        OPER
        {mach_cmd}
        VISC {reynolds}
        ITER 100
        PACC
        {pf}

        ASEQ {alpha_start} {alpha_end} {alpha_step}
        PACC

        QUIT
        """
        _run_script(script)
        _polar_dataframe(pf, af_name, mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)


def runMultiMach(airfoils, d_path="", t_path="", df_name="",
                 mach_list=None, alpha_start=-2, alpha_end=12, alpha_step=2, *, _reynolds=_DEFAULT_RE):
    """
    Menjalankan XFoil untuk setiap Mach, mengumpulkan hasilnya, 
    dan menggabungkannya menjadi satu file database final.
    """
    _ensure_pre()
    if mach_list is None:
        mach_list = [0.0, 0.1, 0.2, 0.3]

    all_dataframes = [] # List untuk menampung dataframe tiap iterasi

    for af in airfoils:
        # Resolving path file koordinat (.dat)
        af_path = os.path.join(d_path, af) if d_path else af
        af_name = os.path.splitext(os.path.basename(af_path))[0]

        for mach in mach_list:
            # 1. Setup Folder & Path Output
            folder = f"{t_path}{mach}"
            os.makedirs(folder, exist_ok=True)
            pf = f"{folder}/{af_name}_polar.txt"
            
            # Hapus file lama agar tidak append data yang salah
            if os.path.exists(pf):
                os.remove(pf)

            # 2. Pembuatan Script XFoil
            mach_cmd = f"MACH {mach:.4f}" if mach > 0.0 else ""
            script = f"""LOAD {af_path}
            PANE
            OPER
            {mach_cmd}
            VISC {_reynolds}
            ITER 100
            PACC
            {pf}

            ASEQ {alpha_start} {alpha_end} {alpha_step}
            PACC
            QUIT
            """
            
            print(f"[xfoilrun] Running: {af_name} | Mach: {mach:.2f}...")
            _run_script(script) # Fungsi internal untuk eksekusi subprocess
            _polar_dataframe(pf, af_name, mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)

def runMultiRe(airfoils, d_path="", t_path="pre", reynolds_list=None, df_name="", alpha_start=-2, alpha_end=12, alpha_step=2,*,_mach=_DEFAULT_MH):
    if reynolds_list is None:
        reynolds_list = [0, 1e5, 2e5, 3e5]

    all_dataframes = [] # List untuk menampung dataframe tiap iterasi

    for af in airfoils:
        # Resolving path file koordinat (.dat)
        af_path = os.path.join(d_path, af) if d_path else af
        af_name = os.path.splitext(os.path.basename(af_path))[0]

        for re in reynolds_list:
            # 1. Setup Folder & Path Output
            folder = f"{t_path}{re}"
            os.makedirs(folder, exist_ok=True)
            polar_file = f"{folder}/{af_name}_polar.txt"
            
            # Hapus file lama agar tidak append data yang salah
            if os.path.exists(polar_file):
                os.remove(polar_file)

            # 2. Pembuatan Script XFoil
            mach_cmd = f"MACH {_mach:.4f}" if _mach > 0.0 else ""
            re_cmd = f"VISC {re:.4f}" if re > 0.0 else ""
            script = f"""LOAD {af_path}
            PANE
            OPER
            {mach_cmd}
            {re_cmd}
            ITER 100
            PACC
            {polar_file}

            ASEQ {alpha_start} {alpha_end} {alpha_step}
            PACC
            QUIT
            """
            
            print(f"[xfoilrun] Running: {af_name} | Mach: {_mach:.2f}...")
            _run_script(script) # Fungsi internal untuk eksekusi subprocess
            _polar_dataframe(polar_file, af_name, _mach, a=all_dataframes)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)

    
def runmultiMachRe(airfoils, d_path="", t_path="pre", reynolds_list=None,
                 mach_list=None, alpha_start=None, alpha_end=None, alpha_step=None, ncrit=_DEFAULT_N, df_name ="multi_MachRe", xtr_top=None, xtr_bottom =None):
    if reynolds_list is None:
        reynolds_list = [0, 1e5, 2e5, 3e5]

    all_dataframes = [] # List untuk menampung dataframe tiap iterasi

    for af in airfoils:
        # Resolving path file koordinat (.dat)
        af_path = os.path.join(d_path, af) if d_path else af
        af_name = os.path.splitext(os.path.basename(af_path))[0]
        af_label = f"{af_name}.dat"
        folder   = "../"
        for mach in mach_list:
            for re in reynolds_list:
                # 1. Setup Folder & Path Output
                folder = f"{t_path}"
                os.makedirs(folder, exist_ok=True)
                polar_file = f"{folder}/{af_name}{re}{mach}_polar.txt"
                
                # Hapus file lama agar tidak append data yang salah
                if os.path.exists(polar_file):
                    os.remove(polar_file)

                # 2. Pembuatan Script XFoil
                mach_cmd = f"MACH {mach:.4f}" if mach > 0.0 else ""
                re_cmd = f"VISC {re:.4f}" if re > 0.0 else ""
                n_cmd = f"N{ncrit}" if ncrit > 0.0 else ""
                script = f"""LOAD ./{d_path}/{af_label}
                PANE
                OPER
                VPAR
                XTR
                {xtr_top}
                {xtr_bottom}
                {n_cmd}

                {mach_cmd}
                {re_cmd}
                ITER 100
                PACC
                {polar_file}                

                ASEQ {alpha_start} {alpha_end} {alpha_step}
                PACC
                QUIT
                """
                print(f"[xfoilrun] Running: {af_name} | Mach: {mach:.2f}...")
                _run_script(script) # Fungsi internal untuk eksekusi subprocess
                _polar_dataframe(polar_file, af_name, mach, a=all_dataframes, re_n=re)

    all_df = all_dataframes
    _mergeDf(all_df, df= df_name)

    return 
