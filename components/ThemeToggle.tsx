"use client";

import { Button } from "primereact/button";
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
    <Button
      icon={icon}
      onClick={cycle}
      rounded
      text
      severity="secondary"
      tooltip={`Thème: ${label}`}
      tooltipOptions={{ position: "bottom" }}
      aria-label={`Thème: ${label}`}
    />
  );
}
