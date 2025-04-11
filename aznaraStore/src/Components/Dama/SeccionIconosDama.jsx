import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../../Redux/Actions/actions';
import Manillas from '../../assets/img/Dama/animada/manillas3.jpg';
import Anillos from '../../assets/img/Dama/dama2.jpg';
import Cadenas from '../../assets/img/Dama/animada/cadenas1.jpg';
import Relojes from '../../assets/img/Dama/animada/anillo2.jpg';
import Aretes from '../../assets/img/Dama/animada/pendiente2.jpg'; // Nuevo icono

const SeccionIconosDama = () => {
  const dispatch = useDispatch();

  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryFilter(categoryName));
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName));
  };

  return (
    <div className="flex justify-center p-4 bg-black shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl w-full">
        <a
          href="#section1"
          className="block mx-auto text-center"
          onClick={() => handleCategoryClick('Relojes')}
        >
          <div className="relative p-2 hover:scale-105 transition duration-300">
            <img
              src={Relojes}
              alt="Relojes"
              className="w-full aspect-square object-cover rounded-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50">
              Relojes
            </span>
          </div>
        </a>
        <a
          href="#section2"
          className="block mx-auto text-center"
          onClick={() => handleCategoryClick('Manillas')}
        >
          <div className="relative p-2 hover:scale-105 transition duration-300">
            <img
              src={Manillas}
              alt="Manillas"
              className="w-full aspect-square object-cover rounded-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50">
              Manillas
            </span>
          </div>
        </a>
        <a
          href="#section3"
          className="block mx-auto text-center"
          onClick={() => handleCategoryClick('Anillos')}
        >
          <div className="relative p-2 hover:scale-105 transition duration-300">
            <img
              src={Anillos}
              alt="Anillos"
              className="w-full aspect-square object-cover rounded-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50">
              Anillos
            </span>
          </div>
        </a>
        <a
          href="#section4"
          className="block mx-auto text-center"
          onClick={() => handleCategoryClick('Cadenas')}
        >
          <div className="relative p-2 hover:scale-105 transition duration-300">
            <img
              src={Cadenas}
              alt="Cadenas"
              className="w-full aspect-square object-cover rounded-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50">
              Cadenas
            </span>
          </div>
        </a>
        <a
          href="#section5"
          className="block mx-auto text-center"
          onClick={() => handleCategoryClick('Extra')}
        >
          <div className="relative p-2 hover:scale-105 transition duration-300">
            <img
              src={Aretes}
              alt="Extra"
              className="w-full aspect-square object-cover rounded-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50">
              Extra
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default SeccionIconosDama;