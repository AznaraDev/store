import React from 'react';
import { Disclosure } from '@headlessui/react';
import backgroundImage from '../../assets/img/Dama/portada.png';
import smallBackgroundImage from '../../assets/img/Dama/portada.jpg'; // Imagen para pantallas pequeñas
import MarqueeLine from './MarqueeLine';

export default function Header() {
  const isSmallScreen = window.innerWidth < 640; // Detecta si la pantalla es pequeña

  return (
    <Disclosure
      as="header"
      className="relative bg-cover bg-center h-[50rem]"
      style={{
        backgroundImage: `url(${isSmallScreen ? smallBackgroundImage : backgroundImage})`,
      }}
    >
    
    </Disclosure>
  );
}
