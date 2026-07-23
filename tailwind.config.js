/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#141F38",
        "ink-2": "#1D2E52",
        "ink-3": "#263B66",
        gold: "#CBA135",
        "gold-light": "#E7C767",
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
