import React from 'react';
import { useSection } from '../SectionContext';
import imgLogo from '../assets/img/bannerCompras.png';
import imgLogo2 from '../assets/img/Dama/logos/carritoDama2.png';

const CartButton = () => {
  const { section: currentSection } = useSection();

  return (
    <a
      href="/products"
      className="fixed top-44 right-2 transition duration-300 transform hover:scale-100 hover:animate-bounce z-50 md:bottom-8 md:-right-6"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={currentSection === 'Dama' ? imgLogo2 : imgLogo}
        className="w-24 h-24 md:w-48 md:h-48"
        alt="Cart Icon"
      />
    </a>
  );
}

export default CartButton;

