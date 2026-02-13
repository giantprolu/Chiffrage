"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const label =
    theme === "system" ? "Système" : theme === "light" ? "Clair" : "Sombre";

  const icon =
    theme === "light"
      ? "pi pi-sun"
      : theme === "dark"
      ? "pi pi-moon"
      : "pi pi-desktop";

  return (
    <button
      className="btn-icon btn-ghost"
      onClick={cycle}
      aria-label={`Thème: ${label}`}
      title={`Thème: ${label}`}
    >
      <i className={icon} style={{ fontSize: 14 }} />
    </button>
  );
}
