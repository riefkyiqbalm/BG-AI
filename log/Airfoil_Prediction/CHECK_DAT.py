"""
check_dat.py
============
Diagnose .dat coordinate files for common issues that cause
XFoil to produce NaN panel solutions.

Usage
-----
    python check_dat.py coord/your_airfoil.dat
    python check_dat.py coord/          # check all .dat in folder
"""

import os
import sys
import glob
import numpy as np


def check_dat(filepath):
    """
    Check one .dat file for geometry issues that cause XFoil NaN failures.

    Checks performed
    ----------------
    1. File is readable and non-empty
    2. Coordinates are numeric (no stray text rows mid-file)
    3. Chord normalisation — x/c range should be 0.0 to ~1.0
    4. Closure — first and last point should be near the same location
    5. Duplicate consecutive points (cause zero-length panels)
    6. Point ordering — XFoil expects TE -> upper -> LE -> lower -> TE
       (Selig format). Checks that x decreases from 1.0 to 0.0 then
       increases from 0.0 to 1.0.
    7. Minimum point count — XFoil needs at least 20 points
    8. LE point — x/c near 0.0 must exist
    9. TE gap — warns if trailing edge is open (common, not fatal)
    """
    print(f"\n{'='*60}")
    print(f"File : {filepath}")
    print(f"{'='*60}")

    # ── 1. Read file ────────────────────────────────────────────────
    if not os.path.exists(filepath):
        print("  FAIL  File not found")
        return False

    with open(filepath, "r", errors="replace") as f:
        raw_lines = f.readlines()

    # Skip header lines (non-numeric first lines)
    data_lines = []
    header_count = 0
    for line in raw_lines:
        parts = line.strip().split()
        if len(parts) == 2:
            try:
                float(parts[0]); float(parts[1])
                data_lines.append((float(parts[0]), float(parts[1])))
            except ValueError:
                header_count += 1
        elif line.strip():
            header_count += 1

    print(f"  Header lines skipped : {header_count}")
    print(f"  Coordinate points    : {len(data_lines)}")

    if len(data_lines) < 20:
        print(f"  FAIL  Too few points ({len(data_lines)}). XFoil needs >= 20.")
        return False

    xs = np.array([p[0] for p in data_lines])
    ys = np.array([p[1] for p in data_lines])

    # ── 2. NaN / Inf check ──────────────────────────────────────────
    if np.any(~np.isfinite(xs)) or np.any(~np.isfinite(ys)):
        bad = np.where(~np.isfinite(xs) | ~np.isfinite(ys))[0]
        print(f"  FAIL  NaN/Inf values at rows: {bad.tolist()}")
        return False
    print(f"  OK    No NaN/Inf values")

    # ── 3. Chord normalisation ──────────────────────────────────────
    xmin, xmax = xs.min(), xs.max()
    print(f"  x range : {xmin:.6f} to {xmax:.6f}")
    if xmax > 1.05:
        print(f"  WARN  x_max={xmax:.4f} > 1.05 — coordinates may not be "
              f"normalised to chord=1. XFoil expects x/c in [0, 1].")
    if xmin < -0.01:
        print(f"  FAIL  x_min={xmin:.4f} < 0 — leading edge overshoot.")
        return False
    print(f"  OK    Chord range looks normalised")

    # ── 4. Closure check ───────────────────────────────────────────
    dx_close = abs(xs[0] - xs[-1])
    dy_close = abs(ys[0] - ys[-1])
    if dx_close > 0.01 or dy_close > 0.01:
        print(f"  WARN  Airfoil not closed — first/last point gap: "
              f"dx={dx_close:.4f}, dy={dy_close:.4f}")
    else:
        print(f"  OK    Airfoil closed (gap dx={dx_close:.6f}, dy={dy_close:.6f})")

    # ── 5. Duplicate consecutive points ────────────────────────────
    dups = [(i, xs[i], ys[i]) for i in range(1, len(xs))
            if xs[i] == xs[i-1] and ys[i] == ys[i-1]]
    if dups:
        print(f"  FAIL  {len(dups)} duplicate consecutive point(s) — "
              f"causes zero-length panels:")
        for idx, x, y in dups[:5]:
            print(f"         row {idx}: ({x}, {y})")
        return False
    print(f"  OK    No duplicate consecutive points")

    # ── 6. Point ordering (Selig format) ───────────────────────────
    # Find the LE (minimum x point)
    le_idx = int(np.argmin(xs))
    upper  = xs[:le_idx+1]
    lower  = xs[le_idx:]

    upper_ok = len(upper) > 2 and bool(np.all(np.diff(upper) <= 0.01))
    lower_ok = len(lower) > 2 and bool(np.all(np.diff(lower) >= -0.01))

    if not upper_ok:
        print(f"  WARN  Upper surface x values not monotonically decreasing "
              f"(TE->LE). XFoil may misread the geometry.")
    else:
        print(f"  OK    Upper surface ordering (TE->LE): x decreasing")

    if not lower_ok:
        print(f"  WARN  Lower surface x values not monotonically increasing "
              f"(LE->TE). XFoil may misread the geometry.")
    else:
        print(f"  OK    Lower surface ordering (LE->TE): x increasing")

    # ── 7. LE point exists ──────────────────────────────────────────
    if xs.min() > 0.005:
        print(f"  WARN  No point near x=0 (closest x={xs.min():.4f}). "
              f"XFoil may fail to find the leading edge stagnation point.")
    else:
        print(f"  OK    Leading edge point at x={xs.min():.6f}")

    # ── 8. TE gap ──────────────────────────────────────────────────
    te_gap = abs(ys[0] - ys[-1])
    if te_gap > 0.002:
        print(f"  INFO  Open trailing edge gap = {te_gap:.4f} "
              f"(common for real airfoils, not fatal)")
    else:
        print(f"  OK    Trailing edge closed (gap={te_gap:.6f})")

    print(f"\n  RESULT: file looks OK for XFoil")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python check_dat.py <file.dat or folder/>")
        sys.exit(1)

    target = sys.argv[1]

    if os.path.isdir(target):
        files = sorted(glob.glob(os.path.join(target, "*.dat"))
                     + glob.glob(os.path.join(target, "*.DAT")))
        if not files:
            print(f"No .dat files found in {target}")
            sys.exit(1)
        results = {f: check_dat(f) for f in files}
        print(f"\n{'='*60}")
        print("SUMMARY")
        print(f"{'='*60}")
        for f, ok in results.items():
            status = "OK  " if ok else "FAIL"
            print(f"  {status}  {os.path.basename(f)}")
    else:
        check_dat(target)

if __name__ == "__main__":
    main()


def fix_to_selig(file_path):
    """
    Memeriksa dan memperbaiki file .dat ke format Selig.
    1. Menghapus baris kosong/sampah.
    2. Memastikan baris pertama adalah nama (bukan angka).
    3. Memastikan koordinat memiliki 2 kolom bersih.
    """
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        # Bersihkan spasi dan ambil baris yang tidak kosong
        raw_content = [line.strip() for line in lines if line.strip()]
        if not raw_content:
            return f"Skipped: {file_path} kosong."

        name = os.path.splitext(os.path.basename(file_path))[0]
        coordinates = []

        # Pisahkan header dan koordinat
        for line in raw_content:
            parts = line.split()
            if len(parts) == 2:
                try:
                    # Cek apakah ini angka koordinat
                    x, y = float(parts[0]), float(parts[1])
                    coordinates.append((x, y))
                except ValueError:
                    # Jika ada 2 kolom tapi bukan angka, anggap sebagai nama/header
                    name = line
            elif len(parts) > 2:
                # Jika baris berisi teks panjang, anggap sebagai nama
                name = line

        # Tulis ulang file dalam format Selig standar
        with open(file_path, 'w') as f:
            f.write(f"{name}\n")
            for x, y in coordinates:
                f.write(f" {x:10.6f} {y:10.6f}\n")
        
        return f"Fixed: {file_path}"
    
    except Exception as e:
        return f"Error pada {file_path}: {e}"

def check_and_clean_folder(folder_path):
    """Menjalankan pembersihan untuk semua file .dat di folder."""
    files = glob.glob(os.path.join(folder_path, "*.dat"))
    print(f"Ditemukan {len(files)} file di '{folder_path}'\n" + "-"*30)
    
    for f in files:
        result = fix_to_selig(f)
        print(result)


def check_all_airfoils_in_folder(folder_path, auto_fix=False):
    """
    Menjalankan diagnosa untuk semua file .dat di dalam folder.
    
    Parameters:
    -----------
    folder_path : str
        Path folder tempat file .dat berada.
    auto_fix : bool
        Jika True, otomatis menjalankan fix_to_selig jika check_dat gagal.
    """
    # 1. Ambil semua file .dat dan .DAT
    files = glob.glob(os.path.join(folder_path, "*.dat")) + \
            glob.glob(os.path.join(folder_path, "*.DAT"))
    
    if not files:
        print(f"[!] Tidak ada file .dat ditemukan di folder: {folder_path}")
        return

    results = []
    failed = []
    print(f"[*] Memulai diagnosa {len(files)} file di '{folder_path}'...")

    # 2. Iterasi setiap file
    for f in files:
        filename = os.path.basename(f)
        is_ok = check_dat(f) # Memanggil fungsi check_dat yang sudah Anda punya
        
        if not is_ok:
            if auto_fix:
                print(f"[!] {filename} bermasalah. Mencoba memperbaiki...")
                fix_to_selig(f)
                # Cek ulang setelah diperbaiki
                is_ok = check_dat(f)

        if not is_ok:
            failed.append((filename))
            
        results.append((filename, "PASSED" if is_ok else "FAILED"))

    # 3. Print Summary Table
    print(f"\n{'='*40}")
    print(f"{'AIRFOIL NAME':<25} | {'STATUS':<10}")
    print(f"{'-'*40}")
    
    failed_count = 0
    for name, status in results:
        print(f"{name:<25} | {status:<10}")
        if status == "FAILED":
            failed_count += 1
    
    print(f"{'='*40}")
    print(f"Total: {len(files)} | Berhasil: {len(files)-failed_count} | Gagal: {failed_count}")

# --- CARA PENGGUNAAN ---
# if __name__ == "__main__":
#     # Ganti dengan nama folder Anda
#     target_folder = "coord" 
    
#     if os.path.exists(target_folder):
#         # Set auto_fix=True jika ingin skrip otomatis memperbaiki format Selig yang salah
#         check_all_airfoils_in_folder(target_folder, auto_fix=True)
#     else:
#         print(f"Folder '{target_folder}' tidak ditemukan.")

def analyze_geometry(filepath):
    """
    Mendiagnosa apakah file .dat akan memicu NaN/N2 Convergence Failed.
    """
    issues = []
    try:
        with open(filepath, 'r', errors='ignore') as f:
            lines = f.readlines()
        
        # 1. Bersihkan data (ambil hanya angka)
        coords = []
        for line in lines:
            parts = line.split()
            if len(parts) == 2:
                try:
                    coords.append([float(parts[0]), float(parts[1])])
                except ValueError:
                    continue
        
        if len(coords) < 20:
            return False, ["Jumlah titik terlalu sedikit (< 20)"]

        c = np.array(coords)
        x, y = c[:, 0], c[:, 1]

        # 2. CEK: Titik Duplikat (Penyebab utama NaN)
        for i in range(len(x) - 1):
            if x[i] == x[i+1] and y[i] == y[i+1]:
                issues.append(f"Titik duplikat di baris {i+1}")

        # 3. CEK: Kelengkungan LE (Leading Edge)
        le_idx = np.argmin(x)
        if x[le_idx] > 0.001:
            issues.append(f"LE tidak di x=0 (x_min={x[le_idx]:.4f})")

        # 4. CEK: Urutan Selig (TE -> Upper -> LE -> Lower -> TE)
        # Jika x tidak menurun lalu meningkat, XFOIL akan bingung mempaneling
        upper_x = x[:le_idx+1]
        lower_x = x[le_idx:]
        if not np.all(np.diff(upper_x) <= 0.05): # Harus cenderung mengecil
            issues.append("Urutan permukaan atas tidak konsisten (bukan Selig)")
        if not np.all(np.diff(lower_x) >= -0.05): # Harus cenderung membesar
            issues.append("Urutan permukaan bawah tidak konsisten")

        # 5. CEK: Spasi antar titik yang terlalu rapat (Zero-length panels)
        dist = np.sqrt(np.diff(x)**2 + np.diff(y)**2)
        if np.any(dist < 1e-7):
            issues.append("Ada panel dengan panjang hampir nol")

    except Exception as e:
        return False, [f"Error membaca file: {str(e)}"]

    if issues:
        return False, issues
    return True, []

def batch_check_xfoil_ready(folder_path, dump_folder="dump"):
    """Menyisir folder dan memisahkan file yang berisiko error."""
    files = glob.glob(os.path.join(folder_path, "*.dat"))
    os.makedirs(dump_folder, exist_ok=True)
    
    print(f"{'FILE':<25} | {'STATUS':<10} | {'REASON'}")
    print("-" * 70)

    for f in files:
        name = os.path.basename(f)
        is_safe, reasons = analyze_geometry(f)
        
        if is_safe:
            print(f"{name:<25} | OK         | -")
        else:
            reason_str = ", ".join(reasons)
            print(f"{name:<25} | DANGER     | {reason_str}")
            # Opsional: Pindahkan ke folder dump agar tidak ikut disimulasi
            # import shutil
            # shutil.move(f, os.path.join(dump_folder, name))

if __name__ == "__main__":
    # Ganti 'coord' dengan nama folder koordinat Anda
    batch_check_xfoil_ready("coord")




