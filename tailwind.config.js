/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      flexGrow: {
        DEFAULT: 1,
        '0': 0,
        '2': 2,
      },
    },
  },
  plugins: [],
};