import type { Config } from "tailwindcss";

// Tailwind can only honor a `bg-accent/50`-style opacity modifier when the
// color resolves through this `rgb(var(--x) / <alpha>)` pattern — a plain
// `var(--accent)` string silently drops the whole utility instead of
// erroring, which is easy to miss. Used only for the admin keys the
// codebase actually applies an opacity modifier to. Tailwind's runtime
// accepts a function here even though its public types don't say so; the
// cast just satisfies the checker.
function withOpacity(rgbVar: string): string {
  const fn = ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined ? `rgb(var(${rgbVar}) / ${opacityValue})` : `rgb(var(${rgbVar}))`;
  return fn as unknown as string;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // Class-based, scoped to the .storm root (the ThemeProvider toggles `dark`
  // there, never on <html>) so the customer world's fixed dark theme — which
  // never uses `dark:` utilities — is entirely unaffected.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#07080A",
          900: "#0B0D10",
          800: "#12151A",
          700: "#1A1E25",
          600: "#232833",
        },
        fog: {
          100: "#F5F7FA",
          200: "#DDE2E9",
          300: "#A7B0BD",
          400: "#7C8592",
          500: "#5B626D",
        },
        cyan: {
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#00C2E0",
        },
        accentblue: {
          600: "#2563EB",
          800: "#1E3A8A",
        },
        violet: {
          400: "#A78BFA",
          500: "#7C3AED",
        },
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",

        // Framer Product Console — the admin panel's own world. White ground,
        // soft-gray surfaces, one calm accent blue. Status returns to colour,
        // carried as soft-fill pills rather than the customer world's glow.
        // Every key resolves through the CSS custom properties storm.css
        // defines on `.storm` (light) and `.storm.dark` (dark) — the same
        // variables storm.css's own internal rules read — so a single set of
        // class names (bg-paper-lift, text-rain, border-mist, ...) repaints
        // for both themes with no per-component dark: variant needed.
        paper: withOpacity("--paper-rgb"),
        "paper-lift": "var(--surface)",
        "paper-lift-hover": "var(--surface-hover)",
        elevated: "var(--elevated)",
        ink: "var(--ink)",
        rain: "var(--ink-secondary)",
        mist: "var(--border)",
        quiet: "var(--ink-muted)",
        "border-strong": "var(--border-strong)",
        signal: withOpacity("--signal-rgb"),
        "signal-soft": "var(--signal-soft)",
        accent: withOpacity("--accent-rgb"),
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        ok: withOpacity("--ok-rgb"),
        "ok-soft": "var(--ok-soft)",
        pending: "var(--pending)",
        "pending-soft": "var(--pending-soft)",
        scrim: "var(--overlay-scrim)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        storm: ["var(--font-storm)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      boxShadow: {
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.15), 0 8px 40px -8px rgba(34,211,238,0.35)",
        "glow-violet": "0 0 0 1px rgba(124,58,237,0.15), 0 8px 40px -8px rgba(124,58,237,0.35)",
        panel: "0 4px 24px -8px rgba(0,0,0,0.5)",
        "storm-xs": "0 1px 2px rgba(16,24,40,0.05)",
        "storm-sm": "0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)",
        "storm-md": "0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06)",
        "storm-lg": "0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-slide-up": "fade-slide-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
