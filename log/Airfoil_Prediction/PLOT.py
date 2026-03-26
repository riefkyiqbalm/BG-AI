"""
PLOT.py
=============
Plot XFoil polar data from a parsed DataFrame or directly from polar files.

All standard aerodynamic polar plots are supported:
    CL vs alpha        — lift curve
    CD vs alpha        — drag curve
    CM vs alpha        — moment curve
    CL vs CD           — drag polar (Lilienthal polar)
    CL/CD vs alpha     — glide ratio curve
    CL^1.5/CD vs alpha — endurance figure of merit
    Top_Xtr vs alpha   — transition location

Functions
---------
plot_polar(df, ...)
    Plot one or more standard polar charts from a DataFrame.
    Groups by airfoil name automatically when multiple airfoils are present.
    Groups by Mach or Re when multiple values are present.

plot_polar_file(filepath, ...)
    Convenience wrapper — parse one polar .txt file then call plot_polar().

plot_polar_folder(folder, ...)
    Parse all polar .txt files in a folder and plot them together.
"""

import os
import glob
import sys
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from matplotlib.lines import Line2D

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from POLARPARSE import parse_polar, parse_polar_folder


# ---------------------------------------------------------------------------
# Style constants
# ---------------------------------------------------------------------------

_COLORS = [
    "#2563EB", "#DC2626", "#16A34A", "#D97706",
    "#7C3AED", "#DB2777", "#0891B2", "#65A30D",
]

_LINE_STYLES = ["-", "--", "-.", ":"]

_FONT_TITLE  = {"fontsize": 11, "fontweight": "bold", "color": "#1e293b"}
_FONT_LABEL  = {"fontsize": 9,  "color": "#334155"}
_FONT_TICK   = {"labelsize": 8, "colors": "#475569"}
_GRID_STYLE  = {"color": "#e2e8f0", "linewidth": 0.7, "linestyle": "--"}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _style_ax(ax, xlabel, ylabel, title):
    """Apply consistent styling to one Axes."""
    ax.set_xlabel(xlabel, **_FONT_LABEL)
    ax.set_ylabel(ylabel, **_FONT_LABEL)
    ax.set_title(title, **_FONT_TITLE, pad=8)
    ax.tick_params(axis="both", **_FONT_TICK)
    ax.grid(True, **_GRID_STYLE)
    ax.set_facecolor("#f8fafc")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#cbd5e1")
    ax.spines["bottom"].set_color("#cbd5e1")
    ax.axhline(0, color="#94a3b8", linewidth=0.6, zorder=0)
    ax.axvline(0, color="#94a3b8", linewidth=0.6, zorder=0)


def _legend(ax, handles, loc="best"):
    """Add a clean legend if there is more than one series."""
    if len(handles) > 1:
        ax.legend(
            handles=handles,
            fontsize=7.5,
            framealpha=0.92,
            edgecolor="#cbd5e1",
            facecolor="white",
            loc=loc,
        )


def _group_label(row, group_by):
    """Build a legend label from a row based on grouping columns."""
    parts = []
    if "airfoil" in group_by:
        parts.append(str(row["airfoil"]))
    if "Mach" in group_by and "Mach" in row.index:
        parts.append(f"M={row['Mach']:.2f}")
    if "Re" in group_by and "Re" in row.index:
        re = row["Re"]
        parts.append(f"Re={re/1e6:.2f}M" if re >= 1e6 else f"Re={re/1e3:.0f}k")
    return "  ".join(parts) if parts else "data"


def _build_groups(df, group_by):
    """
    Split df into groups based on group_by columns.
    Returns list of (label, sub_df) tuples.
    """
    valid = [c for c in group_by if c in df.columns]
    if not valid:
        return [("data", df)]
    groups = []
    for keys, sub in df.groupby(valid):
        if not isinstance(keys, tuple):
            keys = (keys,)
        parts = []
        for col, val in zip(valid, keys):
            if col == "airfoil":
                parts.append(str(val))
            elif col == "Mach":
                parts.append(f"M={val:.2f}")
            elif col == "Re":
                parts.append(f"Re={val/1e6:.2f}M" if val >= 1e6
                              else f"Re={val/1e3:.0f}k")
        groups.append(("  ".join(parts), sub.copy()))
    return groups


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_AVAILABLE_PLOTS = [
    "cl_alpha", "cd_alpha", "cm_alpha",
    "cl_cd",    "ld_alpha", "cl15cd_alpha",
    "xtr_alpha",
]


def plot_polar(df, plots=None, group_by=None,
               figsize=None, save_path=None, show=True):
    """
    Plot standard aerodynamic polar charts from a parsed polar DataFrame.

    Parameters
    ----------
    df        : pd.DataFrame
        Polar data with columns: alpha, CL, CD, CDp, CM, Top_Xtr, Bot_Xtr,
        airfoil, Re, Mach.  Output of parse_polar() or runMultiMach() etc.

    plots     : list[str] or None
        Which plots to draw.  None draws all available plots.
        Available keys:
            'cl_alpha'    — CL vs alpha  (lift curve)
            'cd_alpha'    — CD vs alpha  (drag curve)
            'cm_alpha'    — CM vs alpha  (moment curve)
            'cl_cd'       — CL vs CD     (Lilienthal polar)
            'ld_alpha'    — L/D vs alpha (glide ratio)
            'cl15cd_alpha'— CL^1.5/CD vs alpha (endurance merit)
            'xtr_alpha'   — transition location vs alpha

    group_by  : list[str] or None
        Columns to use for grouping series on the same axes.
        Default: auto-detect — groups by 'airfoil' when multiple airfoils
        are present, adds 'Mach' when multiple Mach values exist, adds 'Re'
        when multiple Re values exist.

    figsize   : tuple or None
        Figure size in inches. Default: auto-sized to number of plots.

    save_path : str or None
        If given, save the figure to this path (e.g. 'polar.png' or
        'polar.pdf'). Default None (do not save).

    show      : bool
        Call plt.show() after plotting.  Default True.

    Returns
    -------
    matplotlib.figure.Figure

    Examples
    --------
    >>> from polar_parser import parse_polar
    >>> df = parse_polar("pre/naca2412_polar.txt")
    >>> plot_polar(df)

    >>> # Multi-airfoil, group by airfoil and Mach
    >>> plot_polar(df_all, plots=["cl_alpha", "cl_cd", "ld_alpha"],
    ...            group_by=["airfoil", "Mach"])

    >>> # Save to file without showing
    >>> plot_polar(df, save_path="polar.png", show=False)
    """
    if df.empty:
        print("[polar_plot] DataFrame is empty — nothing to plot.")
        return None

    # Determine which plots to draw
    if plots is None:
        plots = _AVAILABLE_PLOTS
    plots = [p for p in plots if p in _AVAILABLE_PLOTS]
    if not plots:
        print(f"[polar_plot] No valid plot keys. Choose from: {_AVAILABLE_PLOTS}")
        return None

    # Auto-detect grouping
    if group_by is None:
        group_by = []
        if df["airfoil"].nunique() > 1:
            group_by.append("airfoil")
        if "Mach" in df.columns and df["Mach"].nunique() > 1:
            group_by.append("Mach")
        if "Re" in df.columns and df["Re"].nunique() > 1:
            group_by.append("Re")
        if not group_by:
            group_by = ["airfoil"]   # single series, label = airfoil name

    groups = _build_groups(df, group_by)

    # Layout — always 2 columns, rows grow with number of plots
    n     = len(plots)
    ncols = min(n, 2)          # max 2 columns
    nrows = (n + ncols - 1) // ncols
    if figsize is None:
        figsize = (7.5 * ncols, 4.5 * nrows)  # taller rows for scrolling

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize)
    fig.patch.set_facecolor("#f1f5f9")
    axes = [axes] if n == 1 else list(axes.flatten() if nrows > 1 else axes)

    # Remove unused axes
    for ax in axes[n:]:
        ax.set_visible(False)

    # Plot map: key -> (x_col, y_col_or_fn, xlabel, ylabel, title)
    def _ld(sub):
        return sub["CL"] / sub["CD"]
    def _cl15cd(sub):
        return sub["CL"] ** 1.5 / sub["CD"]

    plot_cfg = {
        "cl_alpha":     ("alpha", "CL",    "α (deg)", "C_L",         "Lift Curve"),
        "cd_alpha":     ("alpha", "CD",    "α (deg)", "C_D",         "Drag Curve"),
        "cm_alpha":     ("alpha", "CM",    "α (deg)", "C_M",         "Moment Curve"),
        "cl_cd":        ("CD",    "CL",    "C_D",     "C_L",         "Drag Polar"),
        "ld_alpha":     ("alpha", _ld,     "α (deg)", "L/D",         "Glide Ratio"),
        "cl15cd_alpha": ("alpha", _cl15cd, "α (deg)", "C_L^1.5/C_D", "Endurance Merit"),
        "xtr_alpha":    ("alpha", "Top_Xtr","α (deg)","x_tr/c",      "Transition Location"),
    }

    for ax_idx, plot_key in enumerate(plots):
        ax  = axes[ax_idx]
        cfg = plot_cfg[plot_key]
        x_col, y_spec, xlabel, ylabel, title = cfg

        handles = []
        for g_idx, (label, sub) in enumerate(groups):
            color = _COLORS[g_idx % len(_COLORS)]
            ls    = _LINE_STYLES[(g_idx // len(_COLORS)) % len(_LINE_STYLES)]
            sub   = sub.sort_values(x_col if isinstance(x_col, str) else "alpha")

            x_vals = sub[x_col] if isinstance(x_col, str) else sub[x_col]
            y_vals = y_spec(sub) if callable(y_spec) else sub[y_spec]

            ax.plot(x_vals, y_vals,
                    color=color, linewidth=1.8, linestyle=ls,
                    marker="o", markersize=3.5, markerfacecolor="white",
                    markeredgewidth=1.2, markeredgecolor=color, zorder=3)

            # Also plot Bot_Xtr for transition plot
            if plot_key == "xtr_alpha" and "Bot_Xtr" in sub.columns:
                ax.plot(sub["alpha"], sub["Bot_Xtr"],
                        color=color, linewidth=1.2, linestyle="--",
                        marker="s", markersize=3, markerfacecolor="white",
                        markeredgewidth=1, markeredgecolor=color,
                        alpha=0.7, zorder=3)

            handles.append(Line2D(
                [0], [0], color=color, linewidth=1.8,
                linestyle=ls, label=label,
                marker="o", markersize=4,
                markerfacecolor="white", markeredgewidth=1.2
            ))

        _style_ax(ax, xlabel, ylabel, title)
        _legend(ax, handles)

        # Extra label for transition plot
        if plot_key == "xtr_alpha":
            ax.set_ylim(-0.05, 1.1)
            ax.yaxis.set_major_formatter(ticker.PercentFormatter(xmax=1, decimals=0))
            top_patch = Line2D([0], [0], color="#64748b", linewidth=1.2,
                               linestyle="-", label="Top surface")
            bot_patch = Line2D([0], [0], color="#64748b", linewidth=1.2,
                               linestyle="--", label="Bottom surface")
            ax.legend(handles=[top_patch, bot_patch], fontsize=7,
                      loc="upper right", framealpha=0.9)

    # Main title
    airfoils = df["airfoil"].unique()
    suptitle = (airfoils[0] if len(airfoils) == 1
                else f"{len(airfoils)} Airfoils")
    re_vals  = df["Re"].unique() if "Re" in df.columns else []
    if len(re_vals) == 1:
        re = re_vals[0]
        suptitle += (f"   Re = {re/1e6:.2f}M" if re >= 1e6
                     else f"   Re = {re/1e3:.0f}k")
    fig.suptitle(suptitle, fontsize=13, fontweight="bold",
                 color="#0f172a", y=1.01)

    plt.tight_layout(pad=1.8)

    if save_path:
        fig.savefig(save_path, dpi=150, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        print(f"[polar_plot] Saved -> {os.path.abspath(save_path)}")

    if show:
        plt.show()

    return fig


def plot_polar_file(filepath, plots=None, group_by=None,
                    figsize=None, save_path=None, show=True):
    """
    Parse one XFoil polar .txt file and plot it.

    Parameters
    ----------
    filepath  : str       path to the polar .txt file
    plots     : list[str] see plot_polar()
    group_by  : list[str] see plot_polar()
    figsize   : tuple     see plot_polar()
    save_path : str       see plot_polar()
    show      : bool      see plot_polar()

    Returns
    -------
    matplotlib.figure.Figure

    Example
    -------
    >>> plot_polar_file("pre/naca2412_polar.txt")
    """
    df = parse_polar(filepath)
    if df.empty:
        print(f"[polar_plot] Could not parse: {filepath}")
        return None
    return plot_polar(df, plots=plots, group_by=group_by,
                      figsize=figsize, save_path=save_path, show=show)


def plot_polar_folder(folder, mach=None, plots=None, group_by=None,
                      figsize=None, save_path=None, show=True):
    """
    Parse all polar .txt files in a folder and plot them together.

    Parameters
    ----------
    folder    : str         folder containing polar .txt files
    mach      : float|None  filter to one Mach value (tolerance 0.001)
    plots     : list[str]   see plot_polar()
    group_by  : list[str]   see plot_polar()
    figsize   : tuple       see plot_polar()
    save_path : str         see plot_polar()
    show      : bool        see plot_polar()

    Returns
    -------
    matplotlib.figure.Figure

    Example
    -------
    >>> plot_polar_folder("pre0.2", group_by=["airfoil"])
    >>> plot_polar_folder("pre", mach=0.2, plots=["cl_alpha", "cl_cd"])
    """
    df = parse_polar_folder(folder, mach=mach)
    if df.empty:
        print(f"[polar_plot] No data found in: {folder}")
        return None
    return plot_polar(df, plots=plots, group_by=group_by,
                      figsize=figsize, save_path=save_path, show=show)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    import argparse
    p = argparse.ArgumentParser(
        prog="polar_plot",
        description="Plot XFoil polar data from .txt polar files."
    )
    p.add_argument("path",  help="Polar .txt file or folder containing polar files")
    p.add_argument("--plots", nargs="+", default=None,
                   help=f"Plots to draw. Choose from: {_AVAILABLE_PLOTS}")
    p.add_argument("--group", nargs="+", default=None,
                   dest="group_by", help="Group by columns e.g. --group airfoil Mach")
    p.add_argument("--mach",  type=float, default=None,
                   help="Filter to one Mach value (folder mode only)")
    p.add_argument("--save",  default=None, dest="save_path",
                   help="Save figure to file e.g. --save polar.png")
    p.add_argument("--no-show", action="store_true",
                   help="Do not call plt.show()")
    args = p.parse_args()

    show = not args.no_show

    if os.path.isdir(args.path):
        plot_polar_folder(args.path, mach=args.mach, plots=args.plots,
                          group_by=args.group_by, save_path=args.save_path,
                          show=show)
    else:
        plot_polar_file(args.path, plots=args.plots, group_by=args.group_by,
                        save_path=args.save_path, show=show)


if __name__ == "__main__":
    main()