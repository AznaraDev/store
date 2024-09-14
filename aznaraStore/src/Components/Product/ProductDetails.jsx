import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import banner from "../../assets/img/banner.png";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(""); // Nuevo estado para la imagen seleccionada

  const { product, similarProducts, loading, error } = useSelector((state) => ({
    product: state.product,
    similarProducts: state.similarProducts,
    loading: state.loading,
    error: state.error,
  }));

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
      setSelectedImage(
        product.Images && product.Images.length > 0
          ? product.Images[0].url
          : "https://via.placeholder.com/600"
      ); // Inicializar la imagen seleccionada
    }
  }, [product]);

  const getAvailableColors = () => {
    if (!selectedProduct || !similarProducts) return [];
  
    const matchingProducts = similarProducts.filter(
      (p) => p.id_SB === selectedProduct.id_SB && p.price === selectedProduct.price
    );
  
    // Extraer los colores únicos de los productos filtrados
    const availableColors = [...new Set(matchingProducts.flatMap((p) => p.colors))];
    return availableColors;
  };

  const getAvailableSizes = () => {
    if (!selectedProduct || !similarProducts) return [];

    const matchingProducts = similarProducts.filter(
      (p) =>
        p.id_SB === selectedProduct.id_SB &&
        p.colors.includes(selectedColor) &&
        p.price === selectedProduct.price
    );

    // Extraer los talles únicos de los productos filtrados
    const availableSizes = [...new Set(matchingProducts.flatMap((p) => p.sizes))];
    
    return availableSizes;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecciona un talle.");
      return;
    }
    if (!selectedColor) {
      alert("Por favor, selecciona un color.");
      return;
    }

    const productToAdd = {
      ...selectedProduct,
      selectedSize,
      selectedColor,
    };

    dispatch(addToCart(productToAdd));
    navigate("/cart");
  };

  const handleViewSimilarProduct = (relatedProduct) => {
    setSelectedProduct(relatedProduct);
    setSelectedSize("");
    setSelectedColor("");

    // Actualizar la imagen principal con la primera imagen del producto relacionado
    setSelectedImage(
      relatedProduct.Images && relatedProduct.Images.length > 0
        ? relatedProduct.Images[0].url
        : "https://via.placeholder.com/600"
    );
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const matchingProduct = similarProducts.find(
      (p) =>
        p.id_SB === selectedProduct.id_SB &&
        p.price === selectedProduct.price &&
        p.colors.includes(color)
    );

    // Actualizar la imagen principal basada en el color seleccionado
    if (matchingProduct && matchingProduct.Images && matchingProduct.Images.length > 0) {
      setSelectedImage(matchingProduct.Images[0].url);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedProduct) {
    return <div>No se encontró el producto.</div>;
  }

  return (
    <div className="full min-h-screen mb-36 bg-gray-900">
      <div className="relative min-h-screen flex items-center justify-center pt-8 z-10">
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-6xl mx-4 sm:mx-6 lg:mx-8 flex flex-col">
          {/* Sección principal de detalles del producto */}
          <div className="flex flex-col lg:flex-row w-full">
            {/* Imágenes del producto */}
            <div className="w-full lg:w-1/2 p-4 flex flex-col lg:flex-row">
              {/* Imágenes en miniatura (verticales) */}
              <div className="flex flex-col space-y-2 lg:mr-4">
                {selectedProduct.Images &&
                  selectedProduct.Images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover object-center rounded-lg cursor-pointer border border-gray-300"
                      onClick={() => setSelectedImage(image.url)} // Al hacer clic cambia la imagen seleccionada
                    />
                  ))}
              </div>
              {/* Imagen principal */}
              <div className="flex-1">
                <img
                  src={selectedImage}
                  alt={selectedProduct.name}
                  className="w-full max-w-xs aspect-square object-cover object-center rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Línea vertical de separación */}
            <div className="hidden lg:block border-l-2 border-gray-300 mx-4"></div>

            {/* Detalles del producto */}
            <div className="w-full lg:w-1/2 p-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 font-nunito bg-gray-100 p-2 rounded uppercase">
                {selectedProduct.name}
              </h2>
              <p className="text-lg text-gray-500 mb-4 font-nunito font-semibold">
                {selectedProduct.description}
              </p>
              
              {/* Mostrar precio y material */}
              <div className="mb-4">
                <p className="text-xl font-semibold text-gray-800">
                  Precio: ${selectedProduct.price}
                </p>
                <p className="text-lg text-gray-600">
                  Material: {selectedProduct.materials.join(', ')}
                </p>
              </div>

              {/* Seleccionar color */}
              <div className="mb-4">
                <label
                  htmlFor="colors"
                  className="block text-sm font-medium text-gray-500"
                >
                  Colores
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-relative bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-300"
                >
                  <option value="">Seleccionar color</option>
                  {getAvailableColors().map((color, index) => (
                    <option key={index} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar talles que coincidan */}
              {selectedColor && (
                <div className="mb-4">
                  <label
                    htmlFor="sizes"
                    className="block text-sm font-medium font-nunito text-gray-500"
                  >
                    Talles
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-relative bg-slate-600 border border-gray-600 rounded-lg py-2 px-4 text-gray-300 font-nunito"
                  >
                    <option value="">Seleccionar talle</option>
                    {getAvailableSizes().map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-32 flex justify-center">
                <button
                  className="w-full h-full bg-yellow-600 text-gray-800 px-5 p-8 py-2 rounded hover:bg-colorLogo flex items-center font-nunito"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart className="mr-2" /> Añadir al Carrito
                </button>
              </div>
            </div>
          </div>

          {/* Sección de productos relacionados */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 font-nunito">
                Productos Relacionados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProducts.map((relatedProduct, index) => (
                  <div
                    key={index}
                    
                    onClick={() => handleViewSimilarProduct(relatedProduct)}
                  >
                    <img
                      src={
                        relatedProduct.Images && relatedProduct.Images.length > 0
                          ? relatedProduct.Images[0].url
                          : "https://via.placeholder.com/600"
                      }
                      // alt={relatedProduct.name}
                       className="w-20 h-20 object-cover object-center rounded-lg"
                    />
                    {/* <h4 className="text-lg font-medium text-gray-800 mt-2 font-nunito">
                      {relatedProduct.name}
                    </h4>
                    <p className="text-gray-600">${relatedProduct.price}</p> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

