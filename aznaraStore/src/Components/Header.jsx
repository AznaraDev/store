import React from 'react';
import { Link } from 'react-router-dom'; 
import { Disclosure } from '@headlessui/react';
import backgroundImage from '../assets/img/banner.png';
import bannerCompras from '../assets/img/bannerCompras.png'; 


export default function Header() {
  return (
    <Disclosure as="header" className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      
      <div className="absolute inset-0 flex justify-end items-center">
        <Link to="/products" className="cursor-pointer">
          <img 
            src={bannerCompras} 
            alt="Logo" 
            className="h-40 w-auto mr-16" 
          /> 
        </Link>
      </div>

  
    </Disclosure>
  );
}



