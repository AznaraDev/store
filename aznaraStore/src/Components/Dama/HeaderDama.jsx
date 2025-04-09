import React from 'react';
import { Disclosure } from '@headlessui/react';
import banner1 from '../../assets/img/Dama/logos/1.jpeg';
import banner2 from '../../assets/img/Dama/logos/2.jpeg';
import banner3 from '../../assets/img/Dama/logos/3.jpeg';

export default function HeaderDama() {
  return (
    <Disclosure as="header" className="relative bg-cover bg-center">
      <div className="relative overflow-hidden">
         {/* Flayer - Propaganda que se mueve hacia la izquierda */}
      <div className="text-center font-nunito font-semibold overflow-hidden bg-black">
        <div className="flex justify-center items-center space-x-40 animate-marquee-right">
          {/* Primer Texto en Movimiento */}
          <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-colorFondoDama">
            <img src="" alt="" className="w-20 h-auto mr-3" />
            GARANTIA - CALIDAD
          </div>

          {/* Segundo Texto en Movimiento */}
          <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl text-colorFondoDama">
            <img src="" alt="" className="w-20 h-auto mr-3" />
            GARANTIA - CALIDAD
            <img src="" alt="" className="w-20 h-auto ml-3" />
          </div>
        </div>
      </div>
        <div className="carousel-container ">
          <div className="carousel-content flex">
            <img
              src={banner1}
              alt="Banner 1"
              className="carousel-imageDama w-full h-[20vh] object-cover opacity-90 bg-black"
            />
            <img
              src={banner2}
              alt="Banner 2"
              className="carousel-imageDama w-full h-[20vh] object-cover opacity-90 bg-black"
            />
            <img
              src={banner3}
              alt="Banner 3"
              className="carousel-imageDama w-full h-[20vh] object-cover opacity-90 bg-black"
            />
          </div>
        </div>
      </div>
      {/* Flayer - Propaganda que se mueve hacia la izquierda */}
      <div className="text-center font-nunito font-semibold overflow-hidden bg-black">
        <div className="flex justify-center items-center space-x-40 animate-marquee-right">
          {/* Primer Texto en Movimiento */}
          <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-colorFondoDama">
            <img src="" alt="" className="w-20 h-auto mr-3" />
            GARANTIA - CALIDAD
          </div>

          {/* Segundo Texto en Movimiento */}
          <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl text-colorFondoDama">
            <img src="" alt="" className="w-20 h-auto mr-3" />
            GARANTIA - CALIDAD
            <img src="" alt="" className="w-20 h-auto ml-3" />
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
