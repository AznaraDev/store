import { useState } from 'react';
import { motion } from 'framer-motion';

import card1 from "../assets/img/an1.png";
import card2 from "../assets/img/an2.png";
import card3 from "../assets/img/an3.png";
import card4 from "../assets/img/an4.png";

const CardsAnimated = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  const variants = {
    // Posiciones iniciales: cuando el componente se monta
    initial1: { scale: 1, opacity: 100, x: 60, y: -80},
    initial2: { scale: 1, opacity: 100, x: 60, y: 120},
    initial3: { scale: 1, opacity: 100, x: 230, y: -105},
    initial4: { scale: 1, opacity: 80, x: 230, y: 100 },
  
    // Posiciones finales: después de la animación
    animate1: { scale: 1.3, opacity: 1, x: 0, y: 0, rotate: 10, transition: { duration: 1 } },
    animate2: { scale: 1.2, opacity: 1, x: 0, y: 0, rotate: -10, transition: { duration: 1.5 } },
    animate3: { scale: 1.1, opacity: 1, x: 0, y: 0, transition: { duration: 1.2 } },
    animate4: { scale: 1.1, opacity: 1, x: 0, y: 0, transition: { duration: 1 } },
  };


  return (
    <div className="grid grid-cols-3 gap-8 p-60">
      {/* Columna izquierda: Texto */}
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Por qué comprar nuestros accesorios</h2>
        <div className="flex items-start mb-6">
          <div>
            <p className="text-lg font-semibold">Productos de calidad</p>
            <p className="text-sm">
              Sabemos que necesitas accesorios de alta calidad y nosotros te ofrecemos un producto
              que puedes gozar de una garantía dándote tranquilidad.
            </p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold">$ Precios a tu medida</p>
          <p className="text-sm">En Aznara Store encontrarás el precio indicado</p>
        </div>
      </div>

      {/* Columna derecha: Tarjetas con animación */}
      <div className="relative flex justify-center items-center">
        {/* Tarjeta 1 */}
        <motion.div
          className="absolute w-40 h-60 rounded-lg shadow-lg"
          onClick={handleCollapse}
          variants={variants}
          initial="initial1"
          animate={isCollapsed ? "animate1" : "initial1"}
        >
          <img src={card1} alt="Accesorio 1" className="w-full h-full rounded-lg object-cover" />
        </motion.div>

        {/* Tarjeta 2 */}
        <motion.div
          className="absolute w-48 h-32 rounded-lg shadow-lg"
          onClick={handleCollapse}
          variants={variants}
          initial="initial2"
          animate={isCollapsed ? "animate2" : "initial2"}
        >
          <img src={card2} alt="Accesorio 2" className="w-full h-full rounded-lg object-cover" />
        </motion.div>

        {/* Tarjeta 3 */}
        <motion.div
          className="absolute w-32 h-48 rounded-lg shadow-lg"
          onClick={handleCollapse}
          variants={variants}
          initial="initial3"
          animate={isCollapsed ? "animate3" : "initial3"}
        >
          <img src={card3} alt="Accesorio 3" className="w-full h-full rounded-lg object-cover" />
        </motion.div>

        {/* Tarjeta 4 */}
        <motion.div
          className="absolute w-32 h-32 rounded-lg shadow-lg"
          onClick={handleCollapse}
          variants={variants}
          initial="initial4"
          animate={isCollapsed ? "animate4" : "initial4"}
        >
          <img src={card4} alt="Accesorio 4" className="w-full h-full rounded-lg object-cover" />
        </motion.div>
      </div>
    </div>
  );
};

export default CardsAnimated;

