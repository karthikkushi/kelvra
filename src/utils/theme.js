// src/utils/theme.js
const THEME_KEY = "kelvra_theme";

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch {}
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Apply theme on page load
export function initTheme() {
  applyTheme(getTheme());
}
