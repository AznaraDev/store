import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../../Redux/Actions/actions';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useSection } from '../../SectionContext';

const ProductCarousel = () => {
  const { section: currentSection } = useSection();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const categoryFilter = useSelector((state) => state.products.categoryFilter || '');

  useEffect(() => {
    dispatch(setCategoryFilter(''));
    dispatch(fetchFilteredProducts('', null, ''));
  }, [dispatch]);

  // Filtrar productos por sección actual
  const filteredProducts = products.filter(
    (product) => product.section === currentSection || product.section === 'Unisex'
  );

  return (
    <div className="carousel-container w-full p-4 sm:p-6 lg:p-8 mt-10">
  <Swiper
    modules={[Navigation, Pagination, Autoplay]}
    navigation
    pagination={{ clickable: true }}
    spaceBetween={10}
    slidesPerView={1}
    autoplay={{
      delay: 1500,
      disableOnInteraction: false,
    }}
    breakpoints={{
      640: { slidesPerView: 1, spaceBetween: 10 }, // Pantallas pequeñas
      768: { slidesPerView: 2, spaceBetween: 15 }, // Pantallas medianas
      1024: { slidesPerView: 4, spaceBetween: 20 }, // Pantallas grandes
    }}
  >
    {filteredProducts.length > 0
      ? filteredProducts.map((product) => (
          <SwiperSlide key={product.id_product}>
            <Link to={`/product/${product.id_product}`}>
              <div
                className={`w-full max-w-xs mx-auto p-2 ${
                  currentSection === 'Dama' ? 'shadow-silver-soft' : 'bg-colorFooter'
                } rounded-xl shadow-lg text-center`}
              >
                {product.isOffer && (
                  <span
                    className={`absolute font-semibold top-0 left-8 ${
                      currentSection === 'Dama'
                        ? 'bg-gray-800  text-white'
                        : 'bg-gray-500 text-colorLogo'
                    } text-xl px-2 py-0 rounded-md`}
                  >
                    OFERTA
                  </span>
                )}
                <h3
                  className={` -mb-4 text-2xl font-thin font-nunito uppercase ${
                    currentSection === 'Dama'
                      ? 'bg-women text-black text-opacity-70'
                      : 'bg-yellow-600 text-slate-800'
                  } p-2 rounded`}
                >
                  {product.name}
                </h3>
                <img
                  src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-80 object-contain  rounded-2xl mb-2"
                />
                <p
                  className={`${
                    currentSection === 'Dama' ? 'text-black text-opacity-70' : 'text-gray-400'
                  } font-nunito text-2xl font-thin`}
                >
                   ${new Intl.NumberFormat('es-ES').format(product.price)}
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))
      : (
        <SwiperSlide>
          <div className="w-full max-w-xs mx-auto  bg-gray-800 rounded-2xl shadow-lg text-center">
            <img
              src="https://via.placeholder.com/150"
              alt="Placeholder"
              className="w-full h-72 object-contain  mb-4"
            />
            <h3 className="mt-2 text-lg font-semibold text-white font-nunito">Producto no disponible</h3>
            <p className="text-gray-400">$0.00</p>
          </div>
        </SwiperSlide>
      )}
  </Swiper>
</div>
  );
};

export default ProductCarousel;










