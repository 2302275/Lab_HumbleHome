/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#273F4F", 
        accent: "#FE7743",
        page: "#f2f2f2",
        accent_focused: "#f0470f",
      },
    },
  },
  plugins: [],
}