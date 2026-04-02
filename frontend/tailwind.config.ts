import type { Config } from "tailwindcss";

const config: Config = {
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
        mist: "#f7fbfa"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(11, 110, 87, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
