import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName = "light" | "dark" | "blue" | "green" | "purple" | "amoled" | "system";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "viagemcorp.theme";

function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return "light" as const;
  const root = document.documentElement;
  root.classList.remove("dark", "theme-green", "theme-purple", "theme-amoled");

  let resolved: "light" | "dark" = "light";
  switch (theme) {
    case "dark":
      root.classList.add("dark");
      resolved = "dark";
      break;
    case "green":
      root.classList.add("theme-green");
      break;
    case "purple":
      root.classList.add("theme-purple");
      break;
    case "amoled":
      root.classList.add("dark", "theme-amoled");
      resolved = "dark";
      break;
    case "system": {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        resolved = "dark";
      }
      break;
    }
    case "blue":
    case "light":
    default:
      break;
  }
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("blue");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemeName | null;
    const initial = saved ?? "blue";
    setThemeState(initial);
    setResolved(applyTheme(initial));
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, t);
    setResolved(applyTheme(t));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
