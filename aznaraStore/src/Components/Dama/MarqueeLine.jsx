import React from 'react';
import envioIcon from '../../assets/img/pagos/envio.png'; // Asegúrate de tener este ícono
import dineroIcon from '../../assets/img/pagos/pago.png'; // Asegúrate de tener este ícono
import calidadIcon from '../../assets/img/pagos/calidad.png'; // Asegúrate de tener este ícono

export default function MarqueeLine() {
  // Arreglo con los textos e íconos
  const items = [
    { icon: envioIcon, text: 'ENVÍOS A TODO EL PAÍS' },
    { icon: dineroIcon, text: 'PAGO CONTRA ENTREGA' },
    { icon: calidadIcon, text: 'GARANTIA - CALIDAD' },
  ];

  return (
    <div className="text-center font-nunito font-semibold overflow-hidden bg-black">
      <div className="flex justify-center items-center space-x-40 animate-marquee-right">
        {/* Iteramos sobre los elementos para generar el contenido */}
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center whitespace-nowrap text-sm md:text-lg text-colorFondoDama"
          >
            <img src={item.icon} alt={item.text} className="w-8 h-auto mr-3" />
            {item.text}
          </div>
        ))}

        {/* Repetimos los mismos elementos para que el texto sea continuo */}
        {items.map((item, index) => (
          <div
            key={`repeat-${index}`}
            className="flex items-center whitespace-nowrap text-sm md:text-lg text-colorFondoDama"
          >
            <img src={item.icon} alt={item.text} className="w-8 h-auto mr-3" />
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}