import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f4fbf9",
          100: "#d8f3ea",
          500: "#0f8b6d",
          600: "#0b6e57",
          700: "#0a5a49"
        },
        ink: "#0c1d17",
        mist: "#f7fbfa",
        app: {
          page: "var(--app-page)",
          bg: "var(--app-bg)",
          surface: "var(--app-surface)",
          "surface-2": "var(--app-surface-2)",
          border: "var(--app-border)",
          "border-strong": "var(--app-border-strong)",
          text: "var(--app-text)",
          muted: "var(--app-muted)",
          subtle: "var(--app-subtle)",
          input: "var(--app-input)",
          "input-focus": "var(--app-input-focus)",
          hover: "var(--app-hover)",
          "hover-strong": "var(--app-hover-strong)",
          accent: "rgb(var(--app-accent-rgb) / <alpha-value>)",
          "accent-hover": "var(--app-accent-hover)",
          "nav-active": "var(--app-nav-active-bg)",
          "nav-active-text": "var(--app-nav-active-text)",
          success: "var(--app-success-text)",
          "success-bg": "var(--app-success-bg)",
          danger: "var(--app-danger)",
          overlay: "var(--app-overlay)",
          "accent-faint": "var(--app-accent-faint)",
          "ring-selected": "var(--app-ring-selected)"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(11, 110, 87, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
