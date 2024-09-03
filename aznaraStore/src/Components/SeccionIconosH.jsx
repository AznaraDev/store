import React from 'react';
import anillo1 from '../assets/img/anillo1.png';
import anillo2 from '../assets/img/anillo2.png';
import dije1 from '../assets/img/dije1.png';
import reloj1 from '../assets/img/reloj1.png'


const SeccionIconosH = () => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <a href="#section1" className="block">
        <img
          src={reloj1}
          alt="Section 1"
          className="w-full h-auto object-cover rounded-lg shadow-lg hover:opacity-75 transition duration-300"
        />
      </a>
      <a href="#section2" className="block">
        <img
          src={anillo1}
          alt="Section 2"
          className="w-full h-auto object-cover rounded shadow-lg hover:opacity-75 transition duration-300"
        />
      </a>
      <a href="#section3" className="block">
        <img
          src={anillo2}
          alt="Section 3"
          className="w-full h-auto object-cover rounded shadow-lg hover:opacity-75 transition duration-300"
        />
      </a>
      <a href="#section4" className="block">
        <img
          src={dije1}
          alt="Section 4"
          className="w-full h-auto object-cover rounded shadow-lg hover:opacity-75 transition duration-300"
        />
      </a>
    
    </div>
  );
};

export default SeccionIconosH;
