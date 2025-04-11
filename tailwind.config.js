/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#89FF44',   // lime green from UI kit
        secondary: '#1D1D25',
        dark: '#020203',      // dark background from UI kit
        light: '#FFFFFF',
        card: '#1D1D25',
        accent: {
          blue: '#5CCAD9',    // blue/cyan from UI kit
          green: '#89FF44',   // lime green from UI kit
          yellow: '#E6FC5B',  // yellow from UI kit
        },
        positive: '#4CAF50',
        negative: '#F44336',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom, 1rem)'
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom, 1rem)'
      }
    },
  },
  plugins: [],
} 