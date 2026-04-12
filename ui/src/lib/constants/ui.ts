/**
 * Shared icon characters and emoji definitions
 * Used across components for consistent icon usage
 */

export const ICONS = {
  // Navigation
  back: "←",
  forward: "→",
  menu: "☰",
  close: "✕",

  // Chat
  send: "🚀",
  user: "👤",
  assistant: "🌿",
  edit: "✏️",
  copy: "📋",
  delete: "🗑️",
  pin: "📌",
  unpin: "📍",

  // Actions
  attach: "📎",
  format: "⚙️",
  settings: "⚙️",
  logout: "🚪",
  refresh: "🔄",
  search: "🔍",
  filter: "⊙",
  sort: "↕️",

  // Status
  loading: "⏳",
  success: "✓",
  error: "⚠️",
  warning: "⚡",
  info: "ℹ️",

  // Authentication
  email: "✉️",
  password: "🔑",
  eye: "👁️",
  eyeOff: "👁‍🗨",

  // Social
  github: "🐙",
  google: "🔍",
  twitter: "𝕏",

  // General
  star: "⭐",
  heart: "❤️",
  thumb: "👍",
  check: "✔️",
  cross: "✗",
  plus: "+",
  minus: "−",
  dots: "⋮",
  home: "🏠",
  user_group: "👥",
  gear: "⚙️",
};

/**
 * Action menu options and their icons
 */
export const ACTION_MENU_ITEMS = {
  copy: { icon: ICONS.copy, label: "Copy", shortKey: "Ctrl+C" },
  edit: { icon: ICONS.edit, label: "Edit", shortKey: "Ctrl+E" },
  delete: { icon: ICONS.delete, label: "Delete", shortKey: "Del" },
  pin: { icon: ICONS.pin, label: "Pin", shortKey: "" },
  unpin: { icon: ICONS.unpin, label: "Unpin", shortKey: "" },
  rename: { icon: ICONS.edit, label: "Rename", shortKey: "" },
  share: { icon: "🔗", label: "Share", shortKey: "Ctrl+Shift+S" },
  download: { icon: "⬇️", label: "Download", shortKey: "" },
  archive: { icon: "📦", label: "Archive", shortKey: "" },
} as const;

/**
 * Status indicators with colors and labels
 */
export const STATUS_INDICATORS = {
  online: { color: "var(--teal)", label: "Online", icon: "🟢" },
  offline: { color: "var(--muted)", label: "Offline", icon: "⚫" },
  away: { color: "#f5c842", label: "Away", icon: "🟡" },
  busy: { color: "var(--red)", label: "Busy", icon: "🔴" },
  loading: { color: "var(--teal)", label: "Loading", icon: "⏳" },
} as const;

/**
 * Common keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  save: "Ctrl + S",
  copy: "Ctrl + C",
  paste: "Ctrl + V",
  cut: "Ctrl + X",
  undo: "Ctrl + Z",
  redo: "Ctrl + Shift + Z",
  search: "Ctrl + F",
  delete: "Delete",
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  shiftTab: "Shift + Tab",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
} as const;

/**
 * Toast message types with colors
 */
export const TOAST_TYPES = {
  success: { background: "rgba(61,255,160,.1)", color: "var(--teal)", border: "1px solid var(--teal-dim)" },
  error: { background: "rgba(255,77,109,.1)", color: "var(--red)", border: "1px solid rgba(255,77,109,.3)" },
  warning: { background: "rgba(245,200,66,.1)", color: "#f5c842", border: "1px solid rgba(245,200,66,.3)" },
  info: { background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)" },
} as const;

/**
 * Login and authentication related constants
 */
export const AUTH_CONSTANTS = {
  tokenKey: "bgai_auth_token",
  userKey: "bgai_user",
  sessionTimeout: 3600000, // 1 hour in milliseconds
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Please enter a valid email address",
  password: "Password must be at least 6 characters",
  passwordMismatch: "Passwords do not match",
  username: "Username must be 3-20 characters (letters, numbers, underscore only)",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL",
  min: (n: number) => `Must be at least ${n} characters`,
  max: (n: number) => `Must be no more than ${n} characters`,
  minNumber: (n: number) => `Must be at least ${n}`,
  maxNumber: (n: number) => `Must be no more than ${n}`,
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    profile: "/api/auth/profile",
  },
  chat: {
    sessions: "/api/chat/sessions",
    messages: "/api/chat/messages",
    stream: "/api/chat/stream",
  },
  user: {
    profile: "/api/user/profile",
    settings: "/api/user/settings",
    deleteAccount: "/api/user/delete",
  },
} as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;
