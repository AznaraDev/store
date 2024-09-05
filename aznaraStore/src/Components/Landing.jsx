import React from 'react'
import Header from './Header'
import SeccionIconosH from './SeccionIconosH'
import ProductCarousel from './Product/ProductCarousel'
import About from './About'
import CardsAnimated from './CardsAnimated'

function Landing() {
  return (
    <div>
        <Header/>
        <SeccionIconosH/>
        <ProductCarousel/>
        <CardsAnimated/>
        <About/>

   </div>
  )
}

export default Landing