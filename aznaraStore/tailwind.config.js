export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors:{
        colorFooter:"#2B2B2B",
        colorPreguntas:"#cccccc",
        colorLogo:"#e99900",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'], 

      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
