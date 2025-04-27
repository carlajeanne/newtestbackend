/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-pastel-orange': '#85522D',
        'dark-grayish-orange': '#7A6251',
        'bright-neon-yellow': '#F1D04B',
        'very-bright-pastel-orange': '#F4ECE1',
        'very-bright-gray': '#F7F2F2'
      },

      fontFamily: {
        'montserrat': ['Montserrat', 'serif'], 
        'akshar': ['Akshar', 'serif']
      },

      backgroundImage: {
        'landing-page-background': 'url(/background.png)',
        'about-doggo-background': 'url(/about-doggo-background.png)',
        'our-team-background': 'url(/our-team-background.png)',
        'contact-us-background': 'url(/contact-us-background.png)',
        'footer-background': 'url(/footer-background.png)'
      }
    },
  },
  plugins: [],
}