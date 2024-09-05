import React, { useState } from 'react';
import { FaInstagram, FaEnvelope, FaFileAlt } from 'react-icons/fa';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai'; // Íconos para mostrar/ocultar

const Footer = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    { question: "¿Cuál es el proceso de compra con AZNARA STORE?", answer: "El proceso es simple: seleccionas tu producto, lo agregas al carrito y sigues el proceso de pago." },
    { question: "¿Cuántos días se tarda la transportadora en entregar mi pedido?", answer: "Dependiendo de tu ubicación, la entrega puede tardar entre 2 y 5 días hábiles." },
    { question: "¿Sus productos tienen empaque?", answer: "Sí, todos nuestros productos vienen en un empaque de alta calidad." },
    { question: "¿Puedo cambiar los productos que adquiera?", answer: "Ofrecemos una política de cambios dentro de los primeros 30 días." },
  ];

  return (
    <footer className="relative bg-cover bg-center h-auto bg-gray-200 text-gray-800">
      <div className="container mx-auto flex flex-row items-start justify-between p-6">
        {/* Redes sociales e iconos */}
       

        {/* Sección de Preguntas Frecuentes */}
        <div className="bg-gray-100 text-gray-800 w-full max-w-md p-6 rounded-lg ">
          <h3 className="text-xl font-semibold mb-4 text-colorLogo font-nunito">Preguntas Frecuentes</h3>
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border-b border-gray-300 pb-4 font-nunito">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-orange-600"
              >
                {faq.question}
                {activeIndex === index ? (
                  <AiOutlineMinus className="text-orange-600" />
                ) : (
                  <AiOutlinePlus className="text-orange-600" />
                )}
              </button>
              {activeIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        {/* Suscripción */}
        <div className="text-center mt-16">
          <h4 className="text-xl font-semibold mb-2 font-nunito">Suscríbete y obtén un 10% de descuento</h4>
          <p className="mb-2 text-gray-600 font-nunito">en tu próxima compra</p>
          <input
            type="email"
            placeholder="Correo"
            className="p-2 border border-gray-300 rounded w-full mb-2 font-nunito"
          />
          <button className="bg-colorLogo text-colorFooter p-2 rounded w-full font-nunito">SUSCRIBETE</button>
        </div>
      </div>

      {/* Links de navegación */}
      <div className="bg-white text-gray-700 py-4 text-center">
        <div className="flex justify-center space-x-8">
          <a href="#" className="hover:underline font-nunito">Lo nuevo</a>
          <a href="#" className="hover:underline font-nunito">Colecciones</a>
          <a href="#" className="hover:underline font-nunito">Categorías</a>
          <a href="#" className="hover:underline font-nunito">Ofertas</a>
          <a href="#" className="hover:underline font-nunito">Términos y Condiciones</a>
          <div className="flex space-x-4">
         
         <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
           <FaInstagram className="h-8 w-8" />
         </a>
         <a href="mailto:contact@example.com">
           <FaEnvelope className="h-8 w-8" />
         </a>
       </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;



