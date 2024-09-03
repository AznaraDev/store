import React from 'react';
import { useSelector } from 'react-redux';

const ProductCarousel = () => {
  const products = useSelector((state) => state.products || []);

  const defaultContent = (
    <div className="w-64 p-4 bg-white rounded-lg shadow-lg text-center">
      <img
        src="https://via.placeholder.com/150"
        alt="Placeholder"
        className="w-full h-60 object-cover rounded-lg"
      />
      <h3 className="mt-2 text-lg font-semibold">Producto no disponible</h3>
      <p className="text-gray-500">$0.00</p>
    </div>
  );

  return (
    <div className="carousel-container p-4 flex justify-center">
      <div className="grid grid-cols-4 gap-4">
        {products.length > 0
          ? products.map((product) => (
              <div
                key={product.id_product}
                className="w-64 p-4 bg-white rounded-lg shadow-lg"
              >
                <img
                  src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-72 object-cover rounded-lg"
                />
                <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-500">${product.price}</p>
              </div>
            ))
          : Array(4).fill(defaultContent)}
      </div>
    </div>
  );
};

export default ProductCarousel;

