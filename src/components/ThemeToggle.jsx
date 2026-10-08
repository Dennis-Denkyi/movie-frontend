import { useState, useEffect } from "react";
import "../css/ThemeToggle.css";

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function ThemeToggle() {
  const [lightMode, setLightMode] = useState(() => getStoredTheme() === "light");

  useEffect(() => {
    const theme = lightMode ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // storage unavailable; theme still applies for this visit
    }
  }, [lightMode]);

  return (
    <label className="theme-toggle" title="Toggle light mode">
      <span className="theme-toggle-icon" aria-hidden="true">{lightMode ? "☀" : "☾"}</span>
      <input
        type="checkbox"
        role="switch"
        className="theme-toggle-input"
        checked={lightMode}
        onChange={(e) => setLightMode(e.target.checked)}
        aria-label="Light mode"
      />
      <span className="theme-toggle-track">
        <span className="theme-toggle-knob" />
      </span>
    </label>
  );
}

export default ThemeToggle;
