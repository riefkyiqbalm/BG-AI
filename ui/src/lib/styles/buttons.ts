/**
 * Shared button styles used across multiple components
 * Extracted from: FormatButton, SendButton, AttachButton, etc.
 */

export const buttonStyles = {
  // Primary action button
  primary: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s",
    fontFamily: "var(--font-body)",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
  } as React.CSSProperties,

  // Icon button style
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,

  // Small icon button
  iconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all .15s",
    fontSize: "14px",
  } as React.CSSProperties,

  // Ghost button (transparent background)
  ghost: {
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "var(--text)",
    transition: "all .15s",
  } as React.CSSProperties,

  // Danger button (delete/destructive actions)
  danger: {
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid rgba(255,77,109,.3)",
    background: "rgba(255,77,109,.05)",
    color: "var(--red)",
    transition: "all .15s",
  } as React.CSSProperties,

  // Loading button state
  loading: {
    opacity: 0.6,
    cursor: "not-allowed",
  } as React.CSSProperties,

  // Hover state mixin
  hover: {
    opacity: 0.8,
  } as React.CSSProperties,
};

/**
 * Button group layout
 */
export const buttonGroupStyles = {
  container: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,

  vertical: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,

  horizontal: {
    display: "flex",
    flexDirection: "row" as const,
    gap: "12px",
  } as React.CSSProperties,
};
