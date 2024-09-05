import React from 'react';
import aboutimg from '../assets/img/about.png'
import aznara from "../assets/img/logoCompleto.png"
import reloj1 from "../assets/img/reloj1.png"
import manillas from "../assets/img/anillo1.png"
import anillos from "../assets/img/anillo2.png"
import cadenas from "../assets/img/dije1.png"
const About = () => {
  return (
    <>
    <div className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${aboutimg})` }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Sombra oscura sobre la imagen */}
      <div className="relative max-w-4xl mx-auto h-full flex items-center p-8 -ml-2 mt-16">
        <div className="text-white mt-20">
          <h2 className="text-6xl font-bold mb-4">Sobre Nosotros</h2>
          <span className="text-2xl leading-relaxed">
          Durante los últimos 3 años, el equipo de Aznara Store<br></br> se 
          ha dedicado a brindar un servicio excepcional,<br></br> asegurándonos
           de satisfacer las necesidades de nuestros clientes
            y agregar valor a sus solicitudes en todo momento.
          </span>
        </div>
      </div>
    </div>
    <div className="bg-colorFooter h-[16rem] mt-10  flex justify-around items-center">
  <div className="text-center">
  <a href="#section1" className="block mx-auto">
    <img
      src={aznara}
      alt="Logo 1"
      className="w-24 h-24 object-cover mx-auto"
    />
    <p className="text-white mt-2">Marca Tu Estilo</p>
    </a>
  </div>
  <div className="text-center">
  <a href="#section1" className="block mx-auto">
    <img
      src={reloj1}
      alt="Logo 2"
      className="w-24 h-24  object-cover mx-auto"
    />
    <p className="text-white mt-2">Relojes</p>
    </a>
  </div>
  <div className="text-center">
  <a href="#section1" className="block mx-auto">
    <img
      src={manillas}
      alt="Logo 3"
      className="w-24 h-24 rounded-full object-cover mx-auto"
    />
    <p className="text-white mt-2">Manillas</p>
    </a>
  </div>
  <div className="text-center">
  <a href="#section1" className="block mx-auto">
    <img
      src={anillos}
      alt="Logo 4"
      className="w-24 h-24  object-cover mx-auto"
    />
    <p className="text-white mt-2">Anillos</p>
    </a>
  </div>
  <div className="text-center">
  <a href="#section1" className="block mx-auto">
    <img
      src={cadenas}
      alt="Logo 5"
      className="w-24 h-24 rounded-full object-cover mx-auto"
    />
    <p className="text-white mt-2">Cadenas</p>
    </a>
  </div>
</div>

    </>
  );
};

export default About;
