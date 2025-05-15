/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F2C078", 
        accent: "#FE5D26",
        page: "#f2f2f2",
        accent_focused: "#f0470f",
      },
    },
  },
  plugins: [],
}