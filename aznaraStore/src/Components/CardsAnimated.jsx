import { motion } from 'framer-motion';
import manitoDiamante from '../assets/img/manitoDiamante.png';
import pesos from '../assets/img/pesos.png';
import card1 from '../assets/img/an1.png';
import card2 from '../assets/img/an2.png';
import card3 from '../assets/img/an3.png';
import card4 from '../assets/img/an4.png';

const CardsAnimated = () => {
  const variants = {
    card1: {
      hidden: { x: 0, y: 0, opacity: 0 },
      visible: { x: -100, y: -100, opacity: 1, transition: { duration: 1 } },
    },
    card2: {
      hidden: { x: 0, y: 0, opacity: 0 },
      visible: { x: 100, y: -100, opacity: 1, transition: { duration: 1 } },
    },
    card3: {
      hidden: { x: 0, y: 0, opacity: 0 },
      visible: { x: -100, y: 100, opacity: 1, transition: { duration: 1 } },
    },
    card4: {
      hidden: { x: 0, y: 0, opacity: 0 },
      visible: { x: 100, y: 100, opacity: 1, transition: { duration: 1 } },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 p-6 md:p-20 overflow-hidden">
      {/* Columna izquierda: Texto */}
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-nunito font-light mb-4 text-center">
          Por qué comprar nuestros<br /> accesorios
        </h2>
  
        {/* Logo manitoDiamante */}
        <img
          src={manitoDiamante}
          alt="Manito Diamante"
          className="mx-auto w-24 h-24 md:w-32 md:h-32 -mt-4"
        />
  
        <div className="flex items-center justify-center mb-6">
          <p className="text-xl md:text-2xl font-nunito font-light text-center">
            Productos de calidad<br />
            Sabemos que necesitas accesorios<br />
            de alta calidad y nosotros te<br />
            ofrecemos un producto que<br />
            puedes gozar de una garantía<br />
            dándote tranquilidad.<br />
            {/* Logo pesos */}
            <img
              src={pesos}
              alt="Pesos"
              className="mx-auto w-16 h-16 md:w-24 md:h-24"
            />
            Precios a tu medida<br />
            En Aznara Store encontrarás el<br />
            precio indicado
          </p>
        </div>
      </div>
  
      {/* Columna derecha: Tarjetas con animación */}
      <div className="relative flex justify-center items-center w-full h-full mt-24 md:mt-0 md:mb-0">
        {/* Tarjeta 1 */}
        <motion.div
          className="absolute w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-72 rounded-lg z-10"
          variants={variants.card1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <img src={card1} alt="Accesorio 1" className="w-full h-full rounded-lg object-contain" />
        </motion.div>
  
        {/* Tarjeta 2 */}
        <motion.div
          className="absolute w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-72 rounded-lg z-10"
          variants={variants.card2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <img src={card2} alt="Accesorio 2" className="w-full h-full rounded-lg object-contain" />
        </motion.div>
  
        {/* Tarjeta 3 */}
        <motion.div
          className="absolute w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-72 rounded-lg z-10"
          variants={variants.card3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <img src={card3} alt="Accesorio 3" className="w-full h-full rounded-lg object-contain" />
        </motion.div>
  
        {/* Tarjeta 4 */}
        <motion.div
          className="absolute w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-72 rounded-lg z-10"
          variants={variants.card4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <img src={card4} alt="Accesorio 4" className="w-full h-full rounded-lg object-contain" />
        </motion.div>
      </div>
    </div>
  );
};

export default CardsAnimated;




