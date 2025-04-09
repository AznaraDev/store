import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import image1a from '../../assets/img/Dama/dama1.jpg';
import image1b from '../../assets/img/Dama/dama2.jpg';
import image2a from '../../assets/img/Dama/dama3.jpg';
import image2b from '../../assets/img/Dama/dama4.jpg';

const SeccionAnimada = () => {
  const [imageIndex1, setImageIndex1] = useState(0);
  const [imageIndex2, setImageIndex2] = useState(0);
  const [imageIndex3, setImageIndex3] = useState(0);
  const [imageIndex4, setImageIndex4] = useState(0);

  const images = [
    { src1: image1a, src2: image1b, title: "Anillos", delay: 2000 },
    { src1: image2a, src2: image2b, title: "Pendientes", delay: 3000 },
    { src1: image1a, src2: image1b, title: "Cadenas", delay: 4000 },
    { src1: image2a, src2: image2b, title: "Manillas", delay: 5000 },
  ];

  useEffect(() => {
    const interval1 = setInterval(() => {
      setImageIndex1((prevIndex) => (prevIndex + 1) % 2);
    }, images[0].delay);
    return () => clearInterval(interval1);
  }, []);

  useEffect(() => {
    const interval2 = setInterval(() => {
      setImageIndex2((prevIndex) => (prevIndex + 1) % 2);
    }, images[1].delay);
    return () => clearInterval(interval2);
  }, []);

  useEffect(() => {
    const interval3 = setInterval(() => {
      setImageIndex3((prevIndex) => (prevIndex + 1) % 2);
    }, images[2].delay);
    return () => clearInterval(interval3);
  }, []);

  useEffect(() => {
    const interval4 = setInterval(() => {
      setImageIndex4((prevIndex) => (prevIndex + 1) % 2);
    }, images[3].delay);
    return () => clearInterval(interval4);
  }, []);

  return (
    <div className="w-full h-full bg-black flex justify-center items-center relative py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-3/4 h-auto p-4">
        <div className="grid grid-cols-2 gap-8">
          {images.map((image, index) => {
            const isProductionOrDirection = image.title === "Producción Musical" || image.title === "Dirección Musical";
            return (
              <div
                key={index}
                className={`relative w-full h-96 overflow-hidden rounded-2xl shadow-lg ${index % 2 === 0 ? 'translate-y-[-30px]' : ''}`}
              >
                {/* Enlace a /videos para Producción Musical y Dirección Musical */}
                {isProductionOrDirection ? (
                  <Link to="/videos">
                    <img
                      src={index === 0 ? image1a : index === 1 ? image2a : index === 2 ? image1a : image2a}
                      alt="Image 1"
                      className={`absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 
                        ${index === 0 && imageIndex1 === 0 ? 'opacity-100' : index === 1 && imageIndex2 === 0 ? 'opacity-100' : 
                          index === 2 && imageIndex3 === 0 ? 'opacity-100' : index === 3 && imageIndex4 === 0 ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <img
                      src={index === 0 ? image1b : index === 1 ? image2b : index === 2 ? image1b : image2b}
                      alt="Image 2"
                      className={`absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 
                        ${index === 0 && imageIndex1 === 1 ? 'opacity-100' : index === 1 && imageIndex2 === 1 ? 'opacity-100' : 
                          index === 2 && imageIndex3 === 1 ? 'opacity-100' : index === 3 && imageIndex4 === 1 ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold z-10 text-center">
                      {image.title}
                    </span>
                  </Link>
                ) : (
                  <>
                    <img
                      src={index === 0 ? image1a : index === 1 ? image2a : index === 2 ? image1a : image2a}
                      alt="Image 1"
                      className={`absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 
                        ${index === 0 && imageIndex1 === 0 ? 'opacity-100' : index === 1 && imageIndex2 === 0 ? 'opacity-100' : 
                          index === 2 && imageIndex3 === 0 ? 'opacity-100' : index === 3 && imageIndex4 === 0 ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <img
                      src={index === 0 ? image1b : index === 1 ? image2b : index === 2 ? image1b : image2b}
                      alt="Image 2"
                      className={`absolute w-full h-full object-cover rounded-2xl transition-opacity duration-1000 
                        ${index === 0 && imageIndex1 === 1 ? 'opacity-100' : index === 1 && imageIndex2 === 1 ? 'opacity-100' : 
                          index === 2 && imageIndex3 === 1 ? 'opacity-100' : index === 3 && imageIndex4 === 1 ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold z-10 text-center">
                      {image.title}
                    </span>
                  </>
                )}
              </div>
            );
          })}
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