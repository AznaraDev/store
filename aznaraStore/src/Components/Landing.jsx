import React from 'react'
import Header from './Header'
import SeccionIconosH from './SeccionIconosH'
import ProductCarousel from './Product/ProductCarousel'
import About from './About'

function Landing() {
  return (
    <div>
        <Header/>
        <SeccionIconosH/>
        <ProductCarousel/>
        <About/>
   </div>
  )
}

export default Landing