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
        brand: {
          50: "#fff8f1",
          100: "#feeedc",
          200: "#fcd9b7",
          300: "#f9bc87",
          400: "#f49454",
          500: "#ef722c",
          600: "#e0551e",
          700: "#ba3f19",
          800: "#94341c",
          900: "#782e1a",
          950: "#411409",
        },
      },
    },
  },
  plugins: [],
};
export default config;
