"use client";

/*
 * Light / dark / system for the admin console only. The customer world is a
 * fixed dark room with no toggle, so this stays entirely inside .storm: the
 * `dark` class lands on #storm-root (the .storm wrapper in the admin layout),
 * never on <html>, and Tailwind's darkMode:'class' strategy matches it from
 * any descendant regardless of where in the tree the class sits.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "biohacking-admin-theme";
export const STORM_ROOT_ID = "storm-root";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

// Briefly enables the theme-transition rule around a switch, then removes it —
// see storm.css for why this is never a permanent blanket transition.
function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.getElementById(STORM_ROOT_ID);
  if (!root) return;
  root.classList.add("theme-transitioning");
  root.classList.toggle("dark", resolved === "dark");
  window.setTimeout(() => root.classList.remove("theme-transitioning"), 220);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The pre-hydration inline script (see ThemeInitScript) already painted the
  // right class before React mounted; these start at the same defaults it
  // assumes so the first client render never disagrees with the DOM it hydrates.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    } catch {
      // Private browsing / storage blocked — fall back to system, silently.
    }
    const initial = stored ?? "system";
    setThemeState(initial);
    setResolvedTheme(resolve(initial));
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(event: MediaQueryListEvent) {
      const next = event.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyResolvedTheme(next);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Selection still applies for this session even if it can't persist.
    }
    const resolved = resolve(next);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// Rendered once, synchronously, before any other admin content: reads the
// stored preference and stamps `dark` on #storm-root before first paint so
// there is never a flash of the wrong theme. Runs as a plain blocking
// <script>, not next/script, because it must execute during HTML parsing.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.getElementById('${STORM_ROOT_ID}');if(r&&d)r.classList.add('dark');}catch(e){}})();`;
