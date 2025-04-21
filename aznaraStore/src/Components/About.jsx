import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../Redux/Actions/actions';
import aboutimg from '../assets/img/about.png';
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
    <div className="relative p-2 hover:scale-105 transition-transform duration-300">
      <img
        src={image}
        alt={altText}
        className="w-full aspect-square object-cover rounded-md shadow-lg"
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold bg-black bg-opacity-50 rounded-md">
        {label}
      </span>
    </div>
  </a>
);

const About = () => {
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
    <>
      <div className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${aboutimg})` }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-4xl mx-auto h-full flex items-center p-8 -ml-2 mt-16">
          <div className="text-gray-400 mt-20">
            <h2 className="text-6xl font-bold mb-4 font-nunito">Sobre Nosotros</h2>
            <span className="text-2xl font-semibold leading-relaxed font-nunito">
              Durante los últimos 3 años, el equipo de Aznara Store<br></br> se ha dedicado a brindar un servicio excepcional,
              <br></br> asegurándonos de satisfacer las necesidades de nuestros clientes
              y agregar valor a sus solicitudes en todo momento.
            </span>
          </div>
        </div>
      </div>

      {/* Sección de íconos */}
      <div className="bg-black ">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto p-4">
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
    </>
  );
};

export default About;