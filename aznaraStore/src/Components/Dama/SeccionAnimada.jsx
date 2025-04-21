import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchFilteredProducts, setCategoryFilter } from "../../Redux/Actions/actions";
import image1a from '../../assets/img/Dama/animada/anillos1.jpg';
import image1b from '../../assets/img/Dama/animada/anillo2.jpg';
import image1c from '../../assets/img/Dama/animada/anillo3.jpg';
import image2a from '../../assets/img/Dama/animada/pendientes1.jpg';
import image2b from '../../assets/img/Dama/animada/pendiente2.jpg';
import image2c from '../../assets/img/Dama/animada/pendiente3.jpg';
import image3a from '../../assets/img/Dama/animada/cadenas1.jpg';
import image3b from '../../assets/img/Dama/animada/cadena2.jpg';
import image3c from '../../assets/img/Dama/animada/cadena3.jpg';
import image4a from '../../assets/img/Dama/animada/manillas1.jpg';
import image4b from '../../assets/img/Dama/animada/manillas2.jpg';
import image4c from '../../assets/img/Dama/animada/manillas3.jpg';
import image5a from '../../assets/img/Dama/animada/dama3.jpg';
import image5b from '../../assets/img/Dama/animada/dama4.jpg';
import image5c from '../../assets/img/Dama/animada/portada.jpg';

const SeccionAnimada = () => {
  const dispatch = useDispatch();
  const [imageIndices, setImageIndices] = useState([0, 0, 0, 0, 0, 0]);

  const sections = [
    {
      title: "Anillos",
      images: [image1a, image1b, image1c],
      categoryName: "Anillos",
    },
    {
      title: "Pendientes",
      images: [image2a, image2b, image2c],
      categoryName: "Pendientes",
    },
    {
      title: "Cadenas",
      images: [image3a, image3b, image3c],
      categoryName: "Cadenas",
    },
    {
      title: "Manillas",
      images: [image4a, image4b, image4c],
      categoryName: "Manillas",
    },
    {
      title: "Relojes",
      images: [image5a, image5b, image5c],
      categoryName: "Relojes",
    },
  ];

  useEffect(() => {
    const intervals = sections.map((_, index) =>
      setInterval(() => {
        setImageIndices((prevIndices) => {
          const newIndices = [...prevIndices];
          newIndices[index] = (newIndices[index] + 1) % sections[index].images.length;
          return newIndices;
        });
      }, 2000) // Cambia cada 2 segundos
    );

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [sections]);

  // Manejar el clic en una imagen para filtrar productos
  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryFilter(categoryName)); // Establece el filtro de categoría
    dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName)); // Filtra los productos
  };

  return (
    <div className="w-full h-full bg-black flex justify-center items-center relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-3/4 h-auto p-4">
        {/* Sección de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {sections.map((section, sectionIndex) => (
            <div
            key={sectionIndex}
            className={`relative w-full h-80 overflow-hidden rounded-2xl shadow-lg cursor-pointer ${sectionIndex % 2 === 0 ? "mt-0" : "mt-12"}`}
            onClick={() => handleCategoryClick(section.categoryName)} // Maneja el clic en la imagen
          >
            {section.images.map((image, imageIndex) => (
              <img
                key={imageIndex}
                src={image}
                alt={section.title}
                className={`absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 ${imageIndices[sectionIndex] === imageIndex ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold z-10 text-center">
              {section.title}
            </span>
          </div>
          ))}
        </div>

        {/* Columna para el texto */}
        <div className="flex flex-col items-center justify-center text-white text-center md:ml-24">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            ¿Por qué comprar nuestros<br /> accesorios?
          </h2>
          <p className="mt-4 text-gray-300 text-base md:text-2xl leading-snug md:leading-normal">
            Productos de calidad<br />
            Sabemos que necesitas accesorios<br />
            de alta calidad y nosotros te<br />
            ofrecemos un producto que<br />
            puedes gozar de una garantía<br />
            dándote tranquilidad.<br />
            Precios a tu medida<br />
            En Aznara Store encontrarás el<br />
            precio indicado
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeccionAnimada;