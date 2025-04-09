import React from 'react';
import { Disclosure } from '@headlessui/react';
import backgroundImage from '../../assets/img/Dama/portada1.jpeg'; // Cambia la ruta según la ubicación de tu imagen



export default function Header() {
  return (
    <Disclosure as="header" className="relative bg-cover bg-center h-[50rem]" style={{ backgroundImage: `url(${backgroundImage})` }}>
    
    </Disclosure>
  );
}
