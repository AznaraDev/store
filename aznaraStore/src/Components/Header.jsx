import React from 'react';
import { Link } from 'react-router-dom'; 
import { Disclosure } from '@headlessui/react';
import backgroundImage from '../assets/img/banner.png';
//import Navbar from './Navbar';
import logo from '../assets/img/bannerCompras.png'; // Verifica la ruta del logo

export default function Header() {
  return (
    <Disclosure as="header" className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* <div className="w-full">
        <Navbar /> 
      </div> */}
      
      <div className="absolute inset-0 flex justify-end items-center">
        <Link to="/products" className="cursor-pointer">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-40 w-auto mr-16" // Borde rojo temporal para depuración
          /> 
        </Link>
      </div>

      <div className="absolute inset-0 bg-black opacity-20"></div> {/* Filtro oscuro */}
    </Disclosure>
  );
}



