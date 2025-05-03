import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiChevronLeft , FiChevronRight  } from "react-icons/fi";
import hombre from "../../assets/img/anillosBanner.jpg";
import dama from "../../assets/img/Dama/bannerPortada.png";
import { useSection } from "../../SectionContext"; // Asegúrate que la ruta sea correcta


const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { section: currentSection } = useSection();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(""); 
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 5; 
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [largeImageDimensions, setLargeImageDimensions] = useState({ width: 1200, height: 1200 });
  const [backgroundPosition, setBackgroundPosition] = useState("center");

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };



  const { product, similarProducts, loading, error } = useSelector((state) => ({
    product: state.product,
    similarProducts: state.similarProducts,
    loading: state.loading,
    error: state.error,
  }));
// Filtrar productos similares por color
const getUniqueColorProducts = (products) => {
  const uniqueColorsMap = new Map();

  products.forEach((product) => {
    product.colors.forEach((color) => {
      if (!uniqueColorsMap.has(color)) {
        uniqueColorsMap.set(color, product);
      }
    });
  });

  return Array.from(uniqueColorsMap.values());
};
  

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
      );
    }
  }, [product]);

    // --- NUEVO useEffect: Para obtener dimensiones cuando selectedImage cambia ---
    useEffect(() => {
    if (!selectedImage) return;

    console.log("Intentando cargar imagen para dimensiones:", selectedImage); // Log para ver la URL
    const img = new Image();
    img.onload = () => {
      // --- AÑADE ESTE LOG ---
      console.log("Imagen cargada. Dimensiones naturales:", img.naturalWidth, img.naturalHeight);

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setLargeImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      } else {
        console.warn("Dimensiones naturales no válidas, usando fallback."); // Aviso si las dimensiones son 0
        setLargeImageDimensions({ width: 1200, height: 1200 });
      }
    };
    img.onerror = () => {
      console.error("Error loading image for dimensions:", selectedImage);
      setLargeImageDimensions({ width: 1200, height: 1200 });
    };
    console.log("URL usada para obtener dimensiones:", selectedImage); // Añade esto
    img.src = selectedImage;
    

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [selectedImage]);
  console.log("Dimensiones usadas para largeImage (en render):", largeImageDimensions);

  const getAvailableColors = () => {
    if (!selectedProduct || !similarProducts) return [];

    const matchingProducts = similarProducts.filter(
      (p) => p.id_SB === selectedProduct.id_SB && p.price === selectedProduct.price
    );

    return [...new Set(matchingProducts.flatMap((p) => p.colors))];
  };

  const getAvailableSizes = () => {
    if (!selectedProduct || !similarProducts) return [];

    const matchingProducts = similarProducts.filter(
      (p) =>
        p.id_SB === selectedProduct.id_SB &&
        p.colors.includes(selectedColor) &&
        p.price === selectedProduct.price
    );

    return [...new Set(matchingProducts.flatMap((p) => p.sizes))];
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
   const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const handleViewSimilarProduct = (relatedProduct) => {
    setSelectedProduct(relatedProduct);
    setSelectedSize("");
    setSelectedColor("");

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

    if (matchingProduct && matchingProduct.Images && matchingProduct.Images.length > 0) {
      setSelectedImage(matchingProduct.Images[0].url);
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -containerRef.current.clientWidth * 0.8, // Ajustar el desplazamiento según el tamaño visible
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth * 0.8, // Ajustar el desplazamiento según el tamaño visible
        behavior: "smooth",
      });
    }
  };

  

  useEffect(() => {
    const container = containerRef.current;

    const updateScrollButtons = () => {
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft + container.clientWidth < container.scrollWidth
        );
      }
    };

    if (container) {
      updateScrollButtons(); // Inicial check

      container.addEventListener("scroll", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
      };
    }
  }, [similarProducts]);

  // Obtener productos únicos por color
  const uniqueColorProducts = getUniqueColorProducts(similarProducts);
 // --- Formateador de precios ---
 const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES').format(price);
};

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - itemsToShow, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + itemsToShow, similarProducts.length - itemsToShow));
  };

  const visibleProducts = uniqueColorProducts.slice(startIndex, startIndex + itemsToShow);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedProduct) {
    return <div>No se encontró el producto.</div>;
  }

     // --- Fondo según sección
     const backgroundImage = currentSection === "Dama" ? dama : hombre;

     // --- Clase de fondo condicional con opacidad ---
     // Asegúrate que 'bg-women' y 'bg-colorDetalle' estén definidos en tu config de Tailwind
     // Puedes ajustar el valor de opacidad (ej: bg-opacity-80, bg-opacity-75)
     const backgroundClass = currentSection === "Dama"
       ? "bg-gray-800 bg-opacity-60"
       : "bg-colorDetalle bg-opacity-90";
  
     // --- JSX
     return (
       <div
         className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center pt-24 sm:pt-28 p-4 sm:p-8 font-nunito font-thin"
         style={{ backgroundImage: `url(${backgroundImage})` }}>
  
  
      {/* Contenedor del "modal" de detalles - Aplicando fondo condicional */}
      <div className={`${backgroundClass} text-gray-200 rounded-lg shadow-xl w-full max-w-5xl mx-auto flex flex-col lg:flex-row overflow-hidden mb-12`}>

{/* --- Columna Izquierda: Detalles --- */}
{/* Cambiado lg:w-1/2 a lg:w-2/5 */}
<div className="w-full lg:w-2/5 p-6 lg:p-8 flex flex-col space-y-4 relative">
  {/* ... (contenido de la columna izquierda sin cambios) ... */}
  <button
  onClick={handleGoBack}
  className="absolute top-2 left-4 bg-gray-800/50 text-colorLogo font-thin p-2 rounded-full hover:bg-gray-700/70 transition duration-300 z-20 flex items-center gap-1"
  aria-label="Volver"
>
  <FiChevronLeft size={20} />
  <span>Volver</span>
</button>


  {/* Título del Producto */}
  <h2 className="text-2xl sm:text-3xl font-thin font-nunito text-white uppercase lg:mt-0">
    {selectedProduct.name}
  </h2>

  {/* Descripción / Características */}
  <div className="text-sm text-gray-300 space-y-1">
     <h3 className="font-thin font-nunito text-base text-gray-100 mb-1">Características:</h3>
     {selectedProduct.description?.split('\n').map((line, index) => (
       <p key={index}>{line.trim()}</p>
     )) || <p>No hay descripción disponible.</p>}
     {/* Mostrar materiales si existen */}
     {selectedProduct.materials && selectedProduct.materials.length > 0 && (
       <p className="pt-2"><span className="font-thin font-nunito text-gray-100">Material:</span> {selectedProduct.materials.join(', ')}</p>
     )}
  </div>

  {/* Precios */}
  <div className="flex items-baseline space-x-3">
    {selectedProduct.isOffer && selectedProduct.originalPrice && (
      <span className="text-xl font-thin font-nunito text-gray-400 line-through">
        ${formatPrice(selectedProduct.originalPrice)}
      </span>
    )}
    <span className="text-3xl font-thin font-nunito text-white">
      ${formatPrice(selectedProduct.price)}
    </span>
  </div>

  {/* Selector de Color */}
  <div className="space-y-1">
    <label htmlFor="colors" className="block text-sm font-thin font-nunito text-gray-400">Color:</label>
    <select
      id="colors"
      value={selectedColor}
      onChange={(e) => handleColorChange(e.target.value)}
      className="w-full bg-gray-700/50 border border-gray-600 font-thin font-nunito rounded py-2 px-3 text-white focus:ring-colorLogo focus:border-colorLogo"
      required
    >
      <option value="" disabled>Seleccionar color</option>
      {getAvailableColors().map((color, index) => (
        <option key={index} value={color}>{color}</option>
      ))}
    </select>
  </div>

  {/* Selector de Talle */}
  {selectedColor && (
    <div className="space-y-1">
      <label htmlFor="sizes" className="block text-sm font-thin font-nunito text-gray-400">Talle:</label>
      <select
        id="sizes"
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
        className="w-full bg-gray-700/50 border font-thin font-nunito border-gray-600 rounded py-2 px-3 text-white focus:ring-colorLogo focus:border-colorLogo"
        required
        disabled={!selectedColor}
      >
        <option value="" disabled>Seleccionar talle</option>
        {getAvailableSizes().map((size, index) => (
          <option key={index} value={size}>{size}</option>
        ))}
      </select>
    </div>
  )}

  {/* Botón Añadir al carrito */}
  <div className="flex items-center space-x-4 pt-4">
    <button
      onClick={handleAddToCart}
      className={`w-full flex items-center justify-center py-2 px-6 rounded font-semibold transition duration-300 ${
        currentSection === 'Dama'
          ? 'bg-women text-black hover:bg-white font-thin font-nunito'
          : 'bg-colorLogo text-black hover:bg-yellow-500 font-thin font-nunito'
      }`}
      disabled={!selectedColor || !selectedSize}
    >
      <FiShoppingCart className="mr-2" />
      Añadir al carrito
    </button>
  </div>

  {/* Texto Pago Contraentrega */}
  <p className="text-sm text-center font-thin font-nunito text-gray-400 pt-2">
    Puedes llevártelo con <span className="font-thin font-nunito text-colorLogo">Pago Contraentrega</span>
  </p>
</div>


{/* --- Columna Derecha: Imagen y Thumbnails --- */}
{/* Cambiado lg:w-1/2 a lg:w-3/5 */}
<div className="w-full lg:w-3/5 p-6 lg:p-8 flex flex-col items-center relative">
  {/* Badge "Sale!" */}
  {selectedProduct.isOffer && (
    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-thin font-nunito px-2 py-1 rounded z-10">
      Sale!
    </span>
  )}

  {/* Imagen Principal con Lupa - Tamaño ajustado */}
  {/* Mantenemos w-[350px] h-[350px] por ahora */}
  <div className="relative overflow-hidden w-[350px] h-[350px] rounded-lg shadow-lg mb-4 group">
  <img
    src={selectedImage}
    alt={selectedProduct.name}
    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[2]"
    style={{ transformOrigin: 'center center' }}
    onMouseMove={(e) => {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transformOrigin = 'center center';
    }}
  />
</div>




  {/* Thumbnails */}
  <div className="flex justify-center space-x-2 overflow-x-auto py-2 w-full max-w-md order-last lg:order-none">
              {/* ... (contenido de thumbnails sin cambios) ... */}
              {selectedProduct.Images?.map((image, index) => {
                // --- AJUSTA ESTAS VARIABLES SEGÚN TU ESTRUCTURA DE DATOS ---
                // Asume que 'image.url' tiene la URL GRANDE
                const largeImageUrl = image.url;
                // Asume que tienes una URL pequeña, o usa la grande como fallback si no
                const thumbnailUrl = image.thumbnailUrl || image.url; // CAMBIA 'thumbnailUrl' si tu propiedad se llama diferente
  
                return (
                  <img
                    key={image.id_image || index}
                    // --- Usa la URL PEQUEÑA para mostrar el thumbnail ---
                    src={thumbnailUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-14 h-14 object-cover rounded cursor-pointer border-2 transition-all duration-200 ${
                      // --- Compara selectedImage con la URL GRANDE ---
                      selectedImage === largeImageUrl ? 'border-colorLogo scale-105' : 'border-transparent hover:border-gray-500'
                    }`}
                    // --- Actualiza selectedImage con la URL GRANDE al hacer clic ---
                    onClick={() => setSelectedImage(largeImageUrl)}
                  />
                );
              })}
            </div>
          </div>
        </div>
  

    {/* --- Sección Productos Relacionados (Ahora es hermano del modal) --- */}
    {/* Condicional para mostrar solo si hay productos */}
    {uniqueColorProducts && uniqueColorProducts.length > 0 && (
      <div className="w-full max-w-6xl mx-auto p-6 bg-gray-800/70 rounded-lg ">
        <h3 className="text-xl font-thin text-white mb-4 text-center lg:text-left">
          También te podría interesar
        </h3>
        <div className="relative flex items-center">
          {/* Botón Izquierda */}
           {canScrollLeft && ( // Usando tu estado canScrollLeft
             <button
               onClick={scrollLeft} // Usando tu función scrollLeft
               className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-600"
               aria-label="Anterior"
             >
               <FiChevronLeft size={20} />
             </button>
           )}

          {/* Contenedor scrollable */}
          <div
            ref={containerRef}
            className="overflow-x-auto whitespace-nowrap flex space-x-4 scrollbar-hide w-full" // Asegura que ocupe el ancho
          >
            {uniqueColorProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id_product}
                onClick={() => handleViewSimilarProduct(relatedProduct)}
                className="inline-block w-24 flex-shrink-0 cursor-pointer group text-center" // flex-shrink-0 es importante
              >
                <img
                  src={relatedProduct.Images?.[0]?.url || "https://via.placeholder.com/150"}
                  alt={relatedProduct.name}
                  className="w-full h-24 object-cover rounded-lg mb-1 border border-transparent group-hover:border-colorLogo transition-all"
                />
                 <p className="text-xs text-center text-gray-300 truncate font-thin font-nunito group-hover:text-white">{relatedProduct.name}</p>
              </div>
            ))}
          </div>

          {/* Botón Derecha */}
           {canScrollRight && ( // Usando tu estado canScrollRight
             <button
               onClick={scrollRight} // Usando tu función scrollRight
               className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-600"
               aria-label="Siguiente"
             >
               <FiChevronRight size={20} />
             </button>
           )}
        </div>
      </div>
    )} {/* Fin de la sección Productos Relacionados */}

  </div> // Fin del contenedor principal
);
};

export default ProductDetails;






