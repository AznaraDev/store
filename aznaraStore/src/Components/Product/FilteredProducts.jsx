import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilteredProducts, addToCart } from '../../Redux/Actions/actions';
import { useParams } from 'react-router-dom';
import { FiShoppingCart } from "react-icons/fi";
// Importa las imágenes del banner
import relojesBanner from '../../assets/img/relojesBanner.jpg';
import manillasBanner from '../../assets/img/manillasBanner.jpg';
import anillosBanner from '../../assets/img/anillosBanner.jpg';
import banner from '../../assets/img/banner.png';
import defaultBanner from '../../assets/img/banner.png'; // Imagen por defecto

const FilteredProducts = () => {
  const dispatch = useDispatch();
  const { categoryName } = useParams();
  const products = useSelector((state) => state.products || []);

  // Seleccionar la imagen del banner según la categoría
  const categoryBanner = (categoryName) => {
    switch (categoryName) {
      case 'Relojes':
        return relojesBanner;
      case 'Manillas':
        return manillasBanner;
      case 'Anillos':
        return anillosBanner;
      case 'Cadenas':
        return banner;
      default:
        return defaultBanner; // Imagen por defecto
    }
  };

  useEffect(() => {
    if (categoryName) {
      dispatch(fetchFilteredProducts('', { min: null, max: null }, categoryName));
    }
  }, [dispatch, categoryName]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-colorFooter">
      {/* Banner de categoría */}
      <div className="relative w-full h-[32rem]">
        <img
          src={categoryBanner(categoryName)}
          alt={categoryName}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black opacity-80 flex items-center justify-center">
          <h2 className="text-gray-300 text-6xl font-bold font-nunito">{categoryName}</h2>
        </div>
      </div>

      {/* Contenedor de productos */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id_product} className="bg-slate-950 p-6 rounded-lg shadow-lg">
                <img
                  src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-72 object-cover rounded-3xl mb-4 text-gray-200 font-nunito"
                />
                <h3 className="mt-2 text-lg font-semibold gray-200 text-gray-200 font-nunito">{product.name}</h3>
                <p className="text-gray-200 font-nunito">${product.price}</p>
                
              </div>
            ))
          ) : (
            <p>No hay productos disponibles en esta categoría.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredProducts;



