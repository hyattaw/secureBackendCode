import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("light");

  // Load initial theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    applyTheme(initial);
  }, []);

  function applyTheme(next) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  function toggleTheme() {
    applyTheme(theme === "light" ? "dark" : "light");
  }

  return { theme, toggleTheme };
}
