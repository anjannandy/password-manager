/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e7e9ef',
          100: '#c2c7d6',
          200: '#9aa2ba',
          300: '#727d9e',
          400: '#546189',
          500: '#364574',
          600: '#303e6c',
          700: '#273461',
          800: '#1f2b56',
          900: '#0f1b3d',
          950: '#080e20',
        },
      },
    },
  },
  plugins: [],
}

