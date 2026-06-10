/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pulvion-green': '#5EC680',
        'pulvion-teal': '#0E5162',
        'alert-yellow': '#FEEEB4',
        'error-red': '#E75757',
      },
    },
  },
  plugins: [],
};