import React from 'react'
import HeaderDama from './HeaderDama'
import Header2 from './Header2'
import SeccionIconosDama from './SeccionIconosDama';
import ProductCarousel from '../Product/ProductCarousel';
import SeccionAnimada from './SeccionAnimada';
//import About from './About'
//import CardsAnimated from './CardsAnimated'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function LandingDama() {
  return (
    <div className="relative">
      <Header2 />
      <HeaderDama />
     
        <SeccionIconosDama />
     
      <ProductCarousel />
      <SeccionAnimada />
    </div>
  );
}

export default LandingDama