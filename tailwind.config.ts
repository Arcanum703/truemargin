import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fbf6ef",
        brand: {
          50: "#fff5ee",
          100: "#ffe6d5",
          200: "#fecaa8",
          300: "#fca66f",
          400: "#f97b38",
          500: "#ee5f1a",
          600: "#d94b0f",
          700: "#b43a0f",
          800: "#8f2f13",
          900: "#732a14",
          950: "#3f1207",
        },
        ink: {
          50: "#f8f5f1",
          100: "#efe9e2",
          200: "#ddd3c8",
          300: "#c4b7a8",
          400: "#a09183",
          500: "#7a6d61",
          600: "#5c5147",
          700: "#463d35",
          800: "#332c26",
          900: "#221d19",
          950: "#15110e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
