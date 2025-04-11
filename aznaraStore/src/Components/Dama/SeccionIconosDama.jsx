import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../../Redux/Actions/actions';
import Manillas from '../../assets/img/Dama/animada/manillas3.jpg';
import Anillos from '../../assets/img/Dama/dama2.jpg';
import Cadenas from '../../assets/img/Dama/animada/cadenas1.jpg';
import Relojes from '../../assets/img/Dama/animada/anillo2.jpg';
import Aretes from '../../assets/img/Dama/animada/pendiente2.jpg'; // Nuevo icono

// Componente reutilizable para cada categoría
const CategoryCard = ({ image, altText, label, categoryName, onClick }) => (
  <div
    className="block mx-auto text-center cursor-pointer"
    onClick={() => onClick(categoryName)}
  >
    <div className="relative p-1 hover:scale-105 transition-transform duration-300">
      <img
        src={image}
        alt={altText}
        className="w-full aspect-square object-cover shadow-lg"
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50 rounded-md">
        {label}
      </span>
    </div>
  </div>
);

const SeccionIconosDama = () => {
  const dispatch = useDispatch();

  // Función para manejar el clic en una categoría
  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryFilter(categoryName)); // Establece el filtro de categoría
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName)); // Filtra los productos
  };

  // Datos de las categorías
  const categories = [
    { image: Relojes, altText: 'Relojes', label: 'Relojes', categoryName: 'Relojes' },
    { image: Manillas, altText: 'Manillas', label: 'Manillas', categoryName: 'Manillas' },
    { image: Anillos, altText: 'Anillos', label: 'Anillos', categoryName: 'Anillos' },
    { image: Cadenas, altText: 'Cadenas', label: 'Cadenas', categoryName: 'Cadenas' },
    { image: Aretes, altText: 'Aretes', label: 'Aretes', categoryName: 'Extra' },
  ];

  return (
    <div className="flex justify-center p-4 bg-white shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl w-full">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            image={category.image}
            altText={category.altText}
            label={category.label}
            categoryName={category.categoryName}
            onClick={handleCategoryClick} // Llama a la función para manejar el clic
          />
        ))}
      </div>
    </div>
  );
};

export default SeccionIconosDama;