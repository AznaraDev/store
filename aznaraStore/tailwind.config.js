export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors:{
        colorFooter:"#2B2B2B",
        colorPreguntas:"#cccccc",
        colorLogo:"#ffb422",
        colorDetalle:"#2e5059",
        colorFondoDama:"#f0b0a7",
        women:"#edd6ca",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'], 

      },
       boxShadow: { 
         'silver-soft': '0 0 15px 2px rgba(192, 192, 192, 0.6)', 
        
      }
    },
  },
  variants: {
    extend: {
      transform: ['hover'],
      scale: ['hover'],
    },},
  plugins: [],
}
