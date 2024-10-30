import React from 'react'
import HeaderDama from './HeaderDama'
import SeccionIconosDama from './SeccionIconosDama';
import ProductCarousel from '../Product/ProductCarousel';
import SeccionAnimada from './SeccionAnimada';
//import About from './About'
//import CardsAnimated from './CardsAnimated'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function LandingDama() {
  return (
    <div>
        <HeaderDama/>
        <SeccionIconosDama/>
        <ProductCarousel/>
        <SeccionAnimada/>
        {/* <HeaderDama/>
        <SeccionIconosH/>
        <ProductCarousel/>
        <CardsAnimated/>
        <About/> */}

   </div>
  )
}

export default LandingDama