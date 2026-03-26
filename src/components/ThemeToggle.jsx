// src/components/ThemeToggle.jsx
import { useState } from "react";
import { toggleTheme, getTheme } from "../utils/theme";

export default function ThemeToggle({ compact = false }) {
  const [theme, setThemeState] = useState(getTheme());

  const handleToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <span className="material-symbols-outlined text-on-surface-variant text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-full border border-outline-variant/20 bg-surface-container-low transition-all text-xs font-bold uppercase tracking-wider text-on-surface-variant">
      <span className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
