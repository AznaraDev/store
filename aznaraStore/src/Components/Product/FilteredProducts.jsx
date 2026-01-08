import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilteredProducts, addToCart } from '../../Redux/Actions/actions';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from "react-icons/fi"; // Icono para el botón de carrito
// Importa las imágenes del banner
import relojesBanner from '../../assets/img/relojesBanner.jpg';
import manillasBanner from '../../assets/img/manillasBanner.jpg';
import anillosBanner from '../../assets/img/anillosBanner.jpg';
import banner from '../../assets/img/banner.png';
import defaultBanner from '../../assets/img/banner.png'; // Imagen por defecto

const FilteredProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Para redirigir a otras rutas
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

  // Redirigir al detalle del producto
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Redirige a la página de detalle del producto
  };

  // Agregar el producto al carrito y redirigir a la página del carrito
  const handleAddToCart = (product) => {
    if (Number(product.stock) <= 0) {
      alert('Producto sin stock.');
      return;
    }
    const productToAdd = {
      ...product,
      image: product.Images?.[0]?.url_image || null, // Agregar imagen
    };
    dispatch(addToCart(productToAdd));
    navigate('/cart'); // Redirige a la página del carrito
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
        <div className="absolute inset-0 bg-black opacity-85 flex items-center justify-center">
          <h2 className="text-gray-300 text-6xl font-bold font-nunito">{categoryName}</h2>
        </div>
      </div>

      {/* Contenedor de productos */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id_product} className=" p-6 rounded-lg shadow-lg relative">
                {/* Hacer clic en la imagen o nombre del producto lleva al detalle */}
                <div
                  onClick={() => handleProductClick(product.id_product)}
                  className="cursor-pointer"
                >
                  <img
                    src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-3xl mb-4 text-gray-200 font-nunito"
                  />
                  <h3 className="mt-2 text-2xl font-semibold text-gray-200 font-nunito">
                    {product.name}
                  </h3>
                </div>

                <p className="text-gray-200 font-nunito text-xl text-end font-semibold">${product.price}</p>
                
                {/* Badge sin stock */}
                {Number(product.stock) <= 0 && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                    Sin stock
                  </div>
                )}

                {/* Botón de añadir al carrito */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`mt-4 flex items-center justify-center w-full py-2 px-4 rounded-lg transition-colors duration-300 ${Number(product.stock) <= 0 ? 'bg-gray-500 text-gray-200 cursor-not-allowed' : 'bg-colorLogo text-white hover:bg-yellow-700'}`}
                  disabled={Number(product.stock) <= 0}
                >
                  <FiShoppingCart className="mr-2" /> {Number(product.stock) <= 0 ? 'Sin stock' : 'Añadir al carrito'}
                </button>
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



