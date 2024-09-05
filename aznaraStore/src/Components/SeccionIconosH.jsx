import React from 'react';
import anillo1 from '../assets/img/seccionManilla.png';
import anillo2 from '../assets/img/seccionAnillo.png';
import dije1 from '../assets/img/seccionCadena.png';
import reloj1 from '../assets/img/seccionReloj.png'


const SeccionIconosH = () => {
    return (
      <div className="flex justify-center p-4">
        <div className="grid grid-cols-4 gap-16 max-w-4xl w-full">
          <a href="#section1" className="block mx-auto">
            <img
              src={reloj1}
              alt="Section 1"
              className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
            />
          </a>
          <a href="#section2" className="block mx-auto">
            <img
              src={anillo1}
              alt="Section 2"
              className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
            />
          </a>
          <a href="#section3" className="block mx-auto">
            <img
              src={anillo2}
              alt="Section 3"
              className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
            />
          </a>
          <a href="#section4" className="block mx-auto">
            <img
              src={dije1}
              alt="Section 4"
              className="w-full h-auto object-cover rounded-full shadow-lg hover:opacity-75 transition duration-300"
            />
          </a>
        </div>
      </div>
    );
  };
  
  export default SeccionIconosH;
  
