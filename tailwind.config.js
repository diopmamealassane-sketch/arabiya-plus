/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#29485A",
        "ink-2": "#32586E",
        "ink-3": "#3C6983",
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
