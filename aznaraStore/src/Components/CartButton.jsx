import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSection } from '../SectionContext';
import { FiShoppingCart } from 'react-icons/fi'; 
import imgLogo from '../assets/img/bannerCompras.png';
import imgLogo2 from '../assets/img/Dama/logos/carritoDama2.png';

const CartButton = () => {
  const { section: currentSection } = useSection();
  const [isHovered, setIsHovered] = useState(false); // Estado para controlar el desplazamiento
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart'); // Redirige a la página del carrito
  };

  return (
    <div
      className={`fixed top-1/2 right-0 transform -translate-y-1/2 bg-yellow-500  cursor-pointer z-50 transition-transform duration-300 ${
        isHovered ? '-translate-x-10' : 'translate-x-0'
      }`}
      style={{
        width: '65px', // Ancho del rectángulo
        height: '60px', // Alto del rectángulo
        borderTopLeftRadius: '30px', // Redondea la esquina superior izquierda
        borderBottomLeftRadius: '30px', // Redondea la esquina inferior izquierda
        backgroundColor: isHovered ? '#fbbf24' : '#f59e0b', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra del rectángulo
      }}
      onMouseEnter={() => setIsHovered(true)} // Desplaza el carrito hacia la izquierda al pasar el mouse
      onMouseLeave={() => setIsHovered(false)} // Regresa el carrito a su posición original
      onClick={handleCartClick} // Redirige al carrito al hacer clic
    >
      <img
        src={imgLogo2}
        className="w-12 h-12 md:w-16 md:h-16 mx-auto"
        alt="Cart Icon"
      />
    </div>
  );
};

export default CartButton;