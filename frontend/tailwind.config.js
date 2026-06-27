/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep civic theme colors
        govBlue: {
          50: '#f0f4f9',
          100: '#dde6f3',
          200: '#c0d2eb',
          300: '#94b3de',
          400: '#628ece',
          500: '#3e6ebd',
          600: '#2e559e',
          700: '#264482',
          800: '#233c6e',
          900: '#21345d',
          950: '#16223e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
