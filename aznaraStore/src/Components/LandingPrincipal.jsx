import React from 'react';
import banner from './../assets/img/banner.png';
import banner1 from './../assets/img/BannerPrincipal/bannerA.jpeg';
import banner2 from './../assets/img/BannerPrincipal/bannerB.jpeg';
import banner3 from './../assets/img/BannerPrincipal/bannerC.jpeg';

const LandingPrincipal = () => {
  return (
    <div className="min-h-screen bg-colorFooter">
      {/* Carrusel de imágenes en movimiento */}
      <div className="relative overflow-hidden">
        <div className="carousel-container">
          <div className="carousel-content flex">
            <img src={banner1} alt="Banner 1" className="carousel-image w-full h-80 object-cover" />
            <img src={banner2} alt="Banner 2" className="carousel-image w-full h-80 object-cover" />
            <img src={banner3} alt="Banner 3" className="carousel-image w-full h-80 object-cover" />
          </div>
        </div>
      </div>

      {/* Secciones divididas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Sección Caballeros */}
        <div className="relative group">
          <a href="/caballeros">
            <img
              src={banner}
              alt="Caballeros"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-bold group-hover:underline font-nunito">
                Sección Caballeros
              </h2>
            </div>
          </a>
        </div>

        {/* Sección Damas */}
        <div className="relative group">
          <a href="/damas">
            <img
              src={banner}
              alt="Damas"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-bold group-hover:underline font-nunito">
                Sección Damas
              </h2>
            </div>
          </a>
        </div>
      </div>

      {/* Flayer - Propaganda que se mueve hacia la izquierda */}
      <div className="text-colorLogo p-4 text-center font-nunito font-semibold">
        <div className="animate-marquee-right whitespace-normal transform -rotate-12 flayer-text text-2xl md:text-5xl mb-10 md:mb-20">
          PAGO CONTRAENTREGA
        </div>
      </div>
    </div>
  );
};

export default LandingPrincipal;


