import React from 'react';
import logo1 from '../assets/img/restrepo.png';
import logo2 from '../assets/img/sena.png';
import logo3 from '../assets/img/fondoEmprender.png';
import { FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-yellow-200 text-white py-4">
      <div className="container mx-auto flex flex-col items-center space-y-2">
        <div className="flex space-x-4 mb-2">
          <img src={logo1} alt="Logo 1" className="h-64 w-64" />
          <img src={logo2} alt="Logo 2" className="h-64 w-64" />
          <img src={logo3} alt="Logo 3" className="h-64 w-64" />
        </div>
        <div className="text-center mb-2">
          <a href="/terms-and-conditions" className="text-green-700 hover:underline">
            Términos y Condiciones
          </a>
        </div>
        <div className="flex space-x-4">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="h-8 w-8 text-green-700" />
          </a>
          <a href="mailto:contact@example.com">
            <FaEnvelope className="h-8 w-8 text-green-700" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

