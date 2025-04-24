import React from 'react';
import banner from './../assets/img/banner.png';
import bannerD from '../assets/img/Dama/bannerPortada.png'
import banner1 from './../assets/img/BannerPrincipal/bannerA.jpeg';
import banner2 from './../assets/img/BannerPrincipal/bannerB.jpeg';
import banner3 from './../assets/img/BannerPrincipal/bannerD.jpeg';
import banner2D from './../assets/img/Dama/bannerPortada2.png'
import efecti from '../assets/img/pagos/efecty.png';
import logoAmeric from '../assets/img/pagos/logoAmeric.png';
import logoVisa from '../assets/img/pagos/logoVisa.png';
import master from '../assets/img/pagos/master.png';
import pse from '../assets/img/PSE.png';
import envios from '../assets/img/pagos/envios.png';
import pagos from '../assets/img/pagos/pagoConEntrega.png'
import logoAz from '../assets/img/logoSolo.png'
import { useSection } from '../SectionContext.jsx';
import { Link } from 'react-router-dom';
const LandingPrincipal = () => {
  const { section, changeSection } = useSection();

  const items = [
    { icon: envios, text: 'ENVIO GRATIS A PARTIR DE $160.000' },
    { icon: pagos, text: 'PAGO CONTRA ENTREGA' },
    { icon: envios, text: 'ENVIO GRATIS A PARTIR DE $160.000' },
  ];


  return (
    <div className="min-h-screen bg-colorFooter">
      {/* Carrusel de imágenes en movimiento */}
      <div className="relative overflow-hidden">
        <div className="carousel-container">
          <div className="carousel-content flex">
            {/* Imágenes originales */}
            <img src={banner2D} alt="Banner 2" className="carousel-image w-full h-80 object-cover" />
            <img src={banner2} alt="Banner 3" className="carousel-image w-full h-80 object-cover" />
            <img src={banner3} alt="Banner 4" className="carousel-image w-full h-80 object-cover" />

            {/* Duplicado de las imágenes */}
            <img src={banner2D} alt="Banner 2" className="carousel-image w-full h-80 object-cover" />
            <img src={banner2} alt="Banner 3" className="carousel-image w-full h-80 object-cover" />

          </div>
        </div>
      </div>
      {/* Flayer - Propaganda que se mueve hacia la izquierda */}
      <div className="text-center font-nunito text-lg font-light overflow-hidden bg-black">
  <div className="flex justify-center items-center space-x-40 animate-marquee">
    {items.map((item, index) => (
      <div
        key={index}
        className="flex items-center whitespace-nowrap text-lg md:text-lg text-yellow-500"
      >
        <img src={item.icon} alt={item.text} className="w-10 h-auto mr-3" />
        {item.text}
      </div>
    ))}

    {/* Repetimos los mismos elementos para que el texto sea continuo */}
    {items.map((item, index) => (
      <div
        key={`repeat-${index}`}
        className="flex items-center whitespace-nowrap text-lg md:text-lg text-yellow-500"
      >
        <img src={item.icon} alt={item.text} className="w-10 h-auto mr-3" />
        {item.text}
      </div>
    ))}

{items.map((item, index) => (
      <div
        key={`repeat-${index}`}
        className="flex items-center whitespace-nowrap text-lg md:text-lg text-yellow-500"
      >
        <img src={item.icon} alt={item.text} className="w-10 h-auto mr-3" />
        {item.text}
      </div>
    ))}
  </div>
</div>


      {/* Secciones divididas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Sección Caballeros */}
        <div className="relative group">
          <a href="/caballeros" onClick={(e) => { e.preventDefault(); changeSection('Caballero'); window.location.href = "/caballeros"; }}>
            <img
              src={banner}
              alt="Caballero"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-thin group-hover:underline font-nunito">
                Caballero
              </h2>
            </div>
          </a>
        </div>

        {/* Sección Damas */}
        <div className="relative group">
          <Link to="/damas" onClick={() => changeSection('Dama')}>
            <img src={bannerD} alt="Dama" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-thin group-hover:underline font-nunito">
                Dama
              </h2>
            </div>
          </Link>
        </div>

      </div>
      {/* Flayer - Propaganda que se mueve hacia la izquierda */}
      <div className="text-center overflow-hidden bg-black">
        <div className="flex justify-center items-center space-x-20 animate-marquee-left">
          {/* Imagen 1 */}
          <div className="flex items-center font-nunito font-light whitespace-nowrap text-3xl md:text-4xl mr-10 text-yellow-500">
            <img src={logoAz} alt="Payment Logo 1" className="w-10 h-auto mr-3" />
            MEDIOS DE PAGO
          </div>

          <img src={efecti} alt="Payment Logo 1" className="payment-logo" />


          {/* Imagen 2 */}
          <img src={logoAmeric} alt="Payment Logo 2" className="payment-logo" />

          {/* Imagen 3 */}
          <img src={logoVisa} alt="Payment Logo 3" className="payment-logo" />

          {/* Imagen 4 */}
          <img src={master} alt="Payment Logo 4" className="payment-logo" />

          {/* Imagen 4 */}
          <img src={pse} alt="Payment Logo 4" className="payment-logo" />
          <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-yellow-500 font-nunito font-light">

            MEDIOS DE PAGO
            <img src={logoAz} alt="Payment Logo 1" className="w-10 h-auto ml-3" />
          </div>
        </div>
      </div>



    </div>
  );
};

export default LandingPrincipal;


