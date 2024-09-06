import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, addToCart } from '../../Redux/Actions/actions';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from "react-icons/fi";
import banner from '../../assets/img/banner.png';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) => state.product);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Por favor, selecciona un talle.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Por favor, selecciona un color.');
      return;
    }

    const productToAdd = {
      ...product,
      selectedSize,
      selectedColor
    };

    dispatch(addToCart(productToAdd));
    navigate('/cart');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>No se encontró el producto.</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-800">
      {/* Imagen de fondo */}
      <img
        src={banner} // Reemplaza con la ruta de tu imagen
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      {/* Contenedor principal */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="bg-colorDetalle rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-4xl mx-4 sm:mx-6 lg:mx-8 flex flex-col lg:flex-row">
          {/* Imagen del producto */}
          <div className="w-full lg:w-1/2 p-4">
            <img
              src={product.Images.length > 0 ? product.Images[0].url : 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover object-center rounded-lg shadow-md"
            />
            <div className="mt-4 flex overflow-x-auto space-x-4">
              {product.Images.length > 1 && product.Images.slice(1).map((image) => (
                <img
                  key={image.id_image}
                  src={image.url}
                  alt={`${product.name} additional`}
                  className="w-24 h-24 object-cover object-center rounded-lg cursor-pointer hover:opacity-75"
                  onClick={() => console.log('Image clicked')}
                />
              ))}
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="w-full lg:w-1/2 p-4">
            <h2 className="text-3xl font-bold text-yellow-600 mb-2 font-nunito bg-slate-600 p-2 rounded">{product.name}</h2>
            <p className="text-lg text-gray-300 mb-4 font-nunito font-semibold">Descripción: {product.description}</p>
            <p className="text-2xl font-semibold font-nunito text-yellow-600 mb-6">Precio: ${product.price}</p>
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label htmlFor="sizes" className="block text-sm font-medium font-nunito text-gray-300">Talles</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-slate-600 border border-gray-600 rounded-lg py-2 px-4 text-gray-300 font-nunito"
                >
                  <option value="">Seleccionar talle</option>
                  {product.sizes.map((size, index) => (
                    <option key={index} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label htmlFor="colors" className="block text-sm font-medium text-gray-300">Colores</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-300"
                >
                  <option value="">Seleccionar color</option>
                  {product.colors.map((color, index) => (
                    <option key={index} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                className="bg-yellow-600 text-white px-5 py-2 rounded hover:bg-colorLogo flex items-center font-nunito"
                onClick={handleAddToCart}
              >
                <FiShoppingCart className="mr-2" /> Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;






