import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFilteredProducts } from '../../Redux/Actions/actions';
import { setCategoryFilter } from '../../Redux/Actions/actions';

const ProductCarousel = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const categoryFilter = useSelector((state) => state.products.categoryFilter || '');

  // Limpiar el filtro y obtener todos los productos al montar el componente
  useEffect(() => {
    // Limpiar el filtro de categoría
    dispatch(setCategoryFilter(''));

    // Obtener todos los productos
    dispatch(fetchFilteredProducts('', null, ''));
  }, [dispatch]);

  // Filtrar productos según la categoría activa
  const filteredProducts = categoryFilter === ''
    ? products
    : products.filter((product) => product.category === categoryFilter);

  const defaultContent = (
    <div className="w-64 p-4 bg-white rounded-lg shadow-lg text-center">
      <img
        src="https://via.placeholder.com/150"
        alt="Placeholder"
        className="w-full h-72 object-cover rounded-2xl mb-4"
      />
      <h3 className="mt-2 text-lg font-semibold">Producto no disponible</h3>
      <p className="text-gray-500">$0.00</p>
    </div>
  );

  return (
    <div className="carousel-container p-4 flex justify-center mt-10">
      <div className="grid grid-cols-4 gap-12">
        {filteredProducts.length > 0
          ? filteredProducts.map((product) => (
              <div
                key={product.id_product}
                className="w-64 p-4 bg-white rounded-lg shadow-lg"
              >
                <img
                  src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-72 object-cover rounded-2xl mb-4"
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



