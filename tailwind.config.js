/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#142038",
        "ink-2": "#1C2E4D",
        "ink-3": "#253A63",
        gold: "#D1AA41",
        "gold-light": "#E5C670",
        parchment: "#F4EEDF",
        "parchment-dim": "#DCD3BC",
        teal: "#2E8C82",
        rust: "#C05545",
      },
      fontFamily: {
        kufi: ["'Reem Kufi'", "sans-serif"],
        amiri: ["'Amiri'", "serif"],
        sans: ["'Work Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
