/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eef9fc",
          100: "#d5f0f7",
          200: "#b0e1ef",
          300: "#7acade",
          400: "#3da9c9",
          500: "#228dad",
          600: "#1f718f",
          700: "#1f5c75",
          800: "#214d61",
          900: "#204152",
        },
        risk: {
          low: "#16a34a",
          moderate: "#ca8a04",
          high: "#ea580c",
          veryHigh: "#dc2626",
          unknown: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "Aptos",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Aptos Display",
          "Aptos",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};
