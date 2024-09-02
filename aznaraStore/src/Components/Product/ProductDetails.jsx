import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, addToCart } from '../../Redux/Actions/actions';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from "react-icons/fi";

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
    <div className="bg-yellow-50 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-4 sm:mx-6 lg:mx-8 p-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">{product.name}</h2>
        <p className="text-lg text-gray-700 mb-4">Descripción: {product.description}</p>
        <p className="text-2xl font-semibold text-green-600 mb-6">Precio: ${product.price}</p>
        
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 mb-6">
          {product.Images && product.Images.length > 0 ? (
            product.Images.map((image) => (
              <div key={image.id_image} className="group relative">
                <img
                  src={image.url}
                  alt={product.name}
                  className="h-full w-full object-cover object-center rounded-lg shadow-lg"
                />
              </div>
            ))
          ) : (
            <div>No hay imágenes disponibles</div>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">Talles</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4"
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
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colores</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4"
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
            className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-700 flex items-center"
            onClick={handleAddToCart}
          >
            <FiShoppingCart className="mr-2" /> Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;




