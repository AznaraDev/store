import { useState, useEffect } from "react";
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

const SeccionAnimada = () => {
  const [imageIndices, setImageIndices] = useState([0, 0, 0, 0]);

  const sections = [
    {
      title: "Anillos",
      images: [image1a, image1b, image1c],
      delay: 2000,
    },
    {
      title: "Pendientes",
      images: [image2a, image2b, image2c],
      delay: 2000,
    },
    {
      title: "Cadenas",
      images: [image3a, image3b, image3c],
      delay: 2000,
    },
    {
      title: "Manillas",
      images: [image4a, image4b, image4c],
      delay: 2000,
    },
  ];

  useEffect(() => {
    const intervals = sections.map((section, index) =>
      setInterval(() => {
        setImageIndices((prevIndices) => {
          const newIndices = [...prevIndices];
          newIndices[index] = (newIndices[index] + 1) % section.images.length;
          return newIndices;
        });
      }, section.delay)
    );

    // Limpia los intervalos al desmontar el componente
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [sections]);

  return (
    <div className="w-full h-full bg-black flex justify-center items-center relative py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-3/4 h-auto p-4">
        <div className="grid grid-cols-2 gap-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="relative w-full h-96 overflow-hidden rounded-2xl shadow-lg"
            >
              <img
                src={section.images[imageIndices[sectionIndex]]}
                alt={section.title}
                className="absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 opacity-100"
              />
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold z-10 text-center">
                {section.title}
              </span>
            </div>
          ))}
        </div>

        {/* Columna para el texto */}
        <div className="flex flex-col items-center justify-center text-white text-center ml-16 md:ml-24">
          <h2 className="text-3xl font-bold">¿Por qué comprar nuestros<br /> accesorios?</h2>
          <p className="mt-4 text-gray-300 text-2xl">
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