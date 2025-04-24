import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../Redux/Actions/actions';
import anillo1 from '../assets/img/Hombre/manilla.png';
import anillo2 from '../assets/img/Hombre/anillos.png';
import dije1 from '../assets/img/Hombre/cadena.png';
import reloj1 from '../assets/img/Hombre/reloj.png';

// Componente reutilizable para cada categoría
const CategoryCard = ({ image, altText, label, categoryName, onClick }) => (
  <a
    href={`#${categoryName}`}
    className="block mx-auto text-center"
    onClick={() => onClick(categoryName)}
  >
    <div className="relative p-4 hover:scale-105 transition-transform duration-300">
      <img
        src={image}
        alt={altText}
        className="w-full aspect-square object-cover rounded-md "
      />
      <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-thin font-nunito bg-black bg-opacity-10 rounded-md">
        {label}
      </span>
    </div>
  </a>
);

const SeccionIconosH = () => {
  const dispatch = useDispatch();

  // Función para manejar el clic en una categoría
  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryFilter(categoryName));
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName));
  };

  // Datos de las categorías
  const categories = [
    { image: reloj1, altText: 'Relojes', label: 'Relojes', categoryName: 'Relojes' },
    { image: anillo1, altText: 'Manillas', label: 'Manillas', categoryName: 'Manillas' },
    { image: anillo2, altText: 'Anillos', label: 'Anillos', categoryName: 'Anillos' },
    { image: dije1, altText: 'Cadenas', label: 'Cadenas', categoryName: 'Cadenas' },
  ];

  return (
    <div className="flex justify-center p-2 bg-black ">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
      {categories.map((category, index) => (
            <CategoryCard
              key={index}
              image={category.image}
              altText={category.altText}
              label={category.label}
              categoryName={category.categoryName}
              onClick={handleCategoryClick}
            />
        ))}
      </div>
    </div>
  );
};

export default SeccionIconosH;