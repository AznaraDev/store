import { useEffect, useState, useRef, useCallback } from "react";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import hombre from "../../assets/img/anillosBanner.jpg";
import dama from "../../assets/img/Dama/bannerPortada.png";
import { useSection } from "../../SectionContext"; // Asegúrate que la ruta sea correcta

// Helper para parsear campos JSON de forma segura
const parseJsonField = (field) => {
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper para extraer nombres de materiales (maneja tanto strings como objetos)
const getMaterialNames = (materials) => {
  const parsed = parseJsonField(materials);
  return parsed.map(m => {
    // Si es un objeto con propiedad 'name', retornar el nombre
    if (typeof m === 'object' && m !== null && m.name) {
      return m.name;
    }
    // Si es un string, retornarlo directamente
    return String(m);
  });
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { section: currentSection } = useSection();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [largeImageDimensions, setLargeImageDimensions] = useState({
    width: 1200,
    height: 1200,
  });

  const { product, similarProducts, loading, error } = useSelector((state) => ({
    product: state.product,
    similarProducts: state.similarProducts,
    loading: state.loading,
    error: state.error,
  }));
  const cart = useSelector((state) => state.cart);
  // Filtrar productos de la misma categoría excluyendo variantes del producto actual
  const getRelatedProducts = (products) => {
    if (!selectedProduct) return [];
    
    return products.filter((product) => {
      // Mismo id_category pero diferente nombre (para excluir variantes del mismo producto)
      return product.id_category === selectedProduct.id_category && 
             product.name !== selectedProduct.name;
    });
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

      // Auto-seleccionar el color del producto actual
      const productColors = parseJsonField(product.colors);
      if (productColors.length > 0) {
        setSelectedColor(productColors[0]);
      } else {
        setSelectedColor("");
      }

      // Auto-seleccionar el material si solo hay uno
      const productMaterials = getMaterialNames(product.materials);
      if (productMaterials.length === 1) {
        setSelectedMaterial(productMaterials[0]);
      } else {
        setSelectedMaterial("");
      }

      setSelectedSize("");
    }
  }, [product]);

  // --- NUEVO useEffect: Para obtener dimensiones cuando selectedImage cambia ---
  useEffect(() => {
    if (!selectedImage) return;

    console.log("Intentando cargar imagen para dimensiones:", selectedImage); // Log para ver la URL
    const img = new Image();
    img.onload = () => {
      // --- AÑADE ESTE LOG ---
      console.log(
        "Imagen cargada. Dimensiones naturales:",
        img.naturalWidth,
        img.naturalHeight
      );

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setLargeImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
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
  console.log(
    "Dimensiones usadas para largeImage (en render):",
    largeImageDimensions
  );

  const getAvailableColors = useCallback(() => {
    if (!selectedProduct || !similarProducts) return [];
    // Obtener todos los colores únicos de productos con el MISMO NOMBRE (variantes)
    const allColors = new Set();
    similarProducts.forEach((p) => {
      if (p.name === selectedProduct.name) {
        const colors = parseJsonField(p.colors);
        colors.forEach((color) => allColors.add(color));
      }
    });
    return Array.from(allColors);
  }, [selectedProduct, similarProducts]);

  const getAvailableMaterials = useCallback(() => {
    if (!selectedProduct || !similarProducts) return [];
    // Obtener todos los materiales únicos de productos con el MISMO NOMBRE (variantes)
    const allMaterials = new Set();
    similarProducts.forEach((p) => {
      if (p.name === selectedProduct.name) {
        const materials = getMaterialNames(p.materials);
        materials.forEach((material) => allMaterials.add(material));
      }
    });
    return Array.from(allMaterials);
  }, [selectedProduct, similarProducts]);

  const getAvailableSizes = useCallback(() => {
    if (!selectedProduct || !similarProducts || !selectedColor) return []; // Necesita un color seleccionado
    const matchingProducts = similarProducts.filter(
      (p) =>
        p.name === selectedProduct.name &&
        parseJsonField(p.colors).includes(selectedColor)
    );
    return [
      ...new Set(matchingProducts.flatMap((p) => parseJsonField(p.sizes))),
    ];
  }, [selectedProduct, similarProducts, selectedColor]);

  const handleColorChange = useCallback(
    (color) => {
      setSelectedColor(color);
      setSelectedSize(""); // Resetear talle al cambiar color

      if (!color) {
        // Si se deselecciona el color, volver al producto original
        if (product && product.Images && product.Images.length > 0) {
          setSelectedImage(product.Images[0].url);
        }
        return;
      }

      // Buscar el primer producto que tenga este color y material (si está seleccionado)
      const matchingProduct = similarProducts.find((p) => {
        const pColors = parseJsonField(p.colors);
        const pMaterials = getMaterialNames(p.materials);
        return (
          p.name === selectedProduct.name &&
          pColors.includes(color) &&
          (!selectedMaterial || pMaterials.includes(selectedMaterial))
        );
      });

      if (matchingProduct) {
        // Actualizar el producto seleccionado y su imagen
        setSelectedProduct(matchingProduct);
        if (matchingProduct.Images && matchingProduct.Images.length > 0) {
          setSelectedImage(matchingProduct.Images[0].url);
        }
      }
    },
    [product, similarProducts, selectedProduct, selectedMaterial]
  );

  const handleMaterialChange = useCallback(
    (material) => {
      setSelectedMaterial(material);
      setSelectedSize(""); // Resetear talle al cambiar material

      if (!material) return;

      // Buscar el primer producto que tenga este material y color (si está seleccionado)
      const matchingProduct = similarProducts.find((p) => {
        const pMaterials = getMaterialNames(p.materials);
        const pColors = parseJsonField(p.colors);
        return (
          p.name === selectedProduct.name &&
          pMaterials.includes(material) &&
          (!selectedColor || pColors.includes(selectedColor))
        );
      });

      if (matchingProduct) {
        setSelectedProduct(matchingProduct);
        if (matchingProduct.Images && matchingProduct.Images.length > 0) {
          setSelectedImage(matchingProduct.Images[0].url);
        }
      }
    },
    [similarProducts, selectedProduct, selectedColor]
  );

  // Efecto para auto-seleccionar color si solo hay uno
  useEffect(() => {
    if (selectedProduct && similarProducts) {
      const availableColors = getAvailableColors();
      if (
        availableColors.length === 1 &&
        selectedColor !== availableColors[0]
      ) {
        handleColorChange(availableColors[0]); // Usar handleColorChange para actualizar imagen también
      }
    }
  }, [
    selectedProduct,
    similarProducts,
    selectedColor,
    getAvailableColors,
    handleColorChange,
  ]); // Depende de selectedProduct y similarProducts

  // Efecto para auto-seleccionar talle si solo hay uno y un color está seleccionado
  useEffect(() => {
    if (selectedColor && selectedProduct && similarProducts) {
      const availableSizes = getAvailableSizes();
      if (availableSizes.length === 1 && selectedSize !== availableSizes[0]) {
        setSelectedSize(availableSizes[0]);
      } else if (
        availableSizes.length !== 1 &&
        selectedSize &&
        !availableSizes.includes(selectedSize)
      ) {
        // Si el talle seleccionado ya no es válido y no hay un único nuevo talle, resetear.
        setSelectedSize("");
      }
    } else if (!selectedColor && selectedSize !== "") {
      // Si no hay color seleccionado, resetear talle
      setSelectedSize("");
    }
  }, [
    selectedColor,
    selectedProduct,
    similarProducts,
    selectedSize,
    getAvailableSizes,
  ]); // Depende de selectedColor

  const handleAddToCart = () => {
    const outOfStock = selectedProduct && Number(selectedProduct.stock) <= 0;
    if (outOfStock) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Producto sin stock. No se puede añadir al carrito.',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    // Comprobar cantidad existente en carrito para este producto
    const existingItem = cart.items.find((it) => it.id_product === selectedProduct.id_product);
    const existingQty = existingItem ? existingItem.quantity : 0;
    if (existingQty + 1 > Number(selectedProduct.stock)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: `Solo quedan ${selectedProduct.stock} unidades en stock.`,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (!selectedSize) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Por favor, selecciona un talle.',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
    if (!selectedColor) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Por favor, selecciona un color.',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const materialToUse = selectedMaterial ||
        getMaterialNames(selectedProduct.materials)[0] ||
        "No especificado";
    
    const productToAdd = {
      ...selectedProduct,
      selectedSize,
      selectedColor,
      selectedMaterial: materialToUse,
      materials: materialToUse !== "No especificado" ? [materialToUse] : [],
      image: selectedImage || selectedProduct.Images?.[0]?.url_image || null, // Agregar imagen
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
    setSelectedMaterial("");

    setSelectedImage(
      relatedProduct.Images && relatedProduct.Images.length > 0
        ? relatedProduct.Images[0].url
        : "https://via.placeholder.com/600"
    );
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

  // Obtener productos relacionados de la misma categoría
  const relatedProducts = getRelatedProducts(similarProducts || []);
  // --- Formateador de precios ---
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-ES").format(price);
  };

  const availableColors = getAvailableColors();
  const availableSizes = selectedColor ? getAvailableSizes() : [];

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
  const backgroundClass =
    currentSection === "Dama"
      ? "bg-gray-800 bg-opacity-60"
      : "bg-colorDetalle bg-opacity-90";

  // --- JSX
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center pt-24 sm:pt-28 p-4 sm:p-8 font-nunito font-thin"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Contenedor del "modal" de detalles - Aplicando fondo condicional */}
      <div
        className={`${backgroundClass} text-gray-200 rounded-lg shadow-xl w-full max-w-5xl mx-auto flex flex-col lg:flex-row overflow-hidden mb-12`}
      >
        <div className="w-full lg:w-2/5 p-6 lg:p-8 flex flex-col space-y-4 relative">
          <button
            onClick={handleGoBack}
            className="absolute top-2 left-4 bg-gray-800/50 text-colorLogo font-thin p-2 rounded-full hover:bg-gray-700/70 transition duration-300 z-20 flex items-center gap-1"
            aria-label="Volver"
          >
            <FiChevronLeft size={20} />
            <span>Volver</span>
          </button>

          {/* Título del Producto */}
          <div className="flex items-start gap-3">
            <h2 className="text-2xl sm:text-3xl font-thin font-nunito text-white uppercase lg:mt-0 flex-1">
              {selectedProduct.name}
            </h2>
            {availableColors.length > 1 && (
              <div className="bg-colorLogo/20 border border-colorLogo/50 rounded-full px-3 py-1 flex items-center gap-1 mt-1">
                <span className="text-colorLogo text-xs font-medium">
                  {availableColors.length}
                </span>
                <span className="text-colorLogo text-xs">colores</span>
              </div>
            )}
          </div>

          {/* Descripción / Características */}
          <div className="text-sm text-gray-300 space-y-1">
            <h3 className="font-thin font-nunito text-base text-gray-100 mb-1">
              Características:
            </h3>
            {selectedProduct.description ? (
              selectedProduct.description.split("\n").map((line, index) => {
                const trimmedLine = line.trim();
                // Ignorar líneas que parecen JSON arrays
                if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
                  return null;
                }
                // Ignorar líneas con formato "CAMPO: [...]"
                if (/^[A-Z\s]+:\s*\[.*\]$/.test(trimmedLine)) {
                  return null;
                }
                return trimmedLine ? <p key={index}>{trimmedLine}</p> : null;
              })
            ) : (
              <p>No hay descripción disponible.</p>
            )}
            {/* Mostrar materiales si existen */}
            {getMaterialNames(selectedProduct.materials).length > 0 && (
              <p className="pt-2">
                <span className="font-thin font-nunito text-gray-100">
                  Material:
                </span>{" "}
                {getMaterialNames(selectedProduct.materials).join(", ")}
              </p>
            )}
          </div>

          {/* Precio */}
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

          {/* Variantes de Color Disponibles - Visual */}
          {availableColors.length > 1 && (
            <div className="space-y-2">
              <label className="block text-sm font-thin font-nunito text-gray-400">
                Colores Disponibles ({availableColors.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color, index) => {
                  // Encontrar el producto con este color para mostrar su imagen
                  const colorProduct = similarProducts.find(
                    (p) =>
                      p.name === selectedProduct.name &&
                      parseJsonField(p.colors).includes(color)
                  );
                  const colorImage =
                    colorProduct?.Images?.[0]?.url ||
                    selectedProduct.Images?.[0]?.url;
                  const isSelected = selectedColor === color;

                  return (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className={`group relative overflow-hidden rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-colorLogo ring-offset-2 ring-offset-gray-800 scale-105"
                          : "ring-1 ring-gray-600 hover:ring-gray-400 hover:scale-105"
                      }`}
                      title={color}
                    >
                      <div className="w-16 h-16 relative">
                        <img
                          src={colorImage}
                          alt={color}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-black transition-opacity ${
                            isSelected
                              ? "opacity-0"
                              : "opacity-20 group-hover:opacity-0"
                          }`}
                        />
                      </div>
                      <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1 ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        <p className="text-[10px] text-white text-center font-medium truncate">
                          {color}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-colorLogo text-black rounded-bl-lg px-1">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selector de Color Modificado */}
          <div className="space-y-1">
            <label
              htmlFor="colors"
              className="block text-sm font-thin font-nunito text-gray-400"
            >
              Color:
            </label>
            {availableColors.length === 1 ? (
              <p className="w-full bg-gray-700/50 border border-transparent font-thin font-nunito rounded py-2 px-3 text-white">
                {availableColors[0]}
              </p>
            ) : availableColors.length > 1 ? (
              <select
                id="colors"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 font-thin font-nunito rounded py-2 px-3 text-white focus:ring-colorLogo focus:border-colorLogo"
                required
              >
                <option value="" disabled>
                  Seleccionar color
                </option>
                {availableColors.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">
                No hay colores disponibles.
              </p>
            )}
          </div>

          {/* Selector de Material */}
          {(selectedColor || availableColors.length === 1) &&
            getAvailableMaterials().length > 0 && (
              <div className="space-y-1">
                <label
                  htmlFor="materials"
                  className="block text-sm font-thin font-nunito text-gray-400"
                >
                  Material:
                </label>
                {getAvailableMaterials().length === 1 ? (
                  <p className="w-full bg-gray-700/50 border border-transparent font-thin font-nunito rounded py-2 px-3 text-white">
                    {getAvailableMaterials()[0]}
                  </p>
                ) : (
                  <select
                    id="materials"
                    value={selectedMaterial}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 font-thin font-nunito rounded py-2 px-3 text-white focus:ring-colorLogo focus:border-colorLogo"
                    required
                  >
                    <option value="" disabled>
                      Seleccionar material
                    </option>
                    {getAvailableMaterials().map((material, index) => (
                      <option key={index} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

          {/* Selector de Talle Modificado */}
          {/* Solo mostrar si hay un color seleccionado o si el color se auto-seleccionó */}
          {(selectedColor || availableColors.length === 1) && (
            <div className="space-y-1">
              <label
                htmlFor="sizes"
                className="block text-sm font-thin font-nunito text-gray-400"
              >
                Talle:
              </label>
              {availableSizes.length === 1 ? (
                <p className="w-full bg-gray-700/50 border border-transparent font-thin font-nunito rounded py-2 px-3 text-white">
                  {availableSizes[0]}
                </p>
              ) : availableSizes.length > 1 ? (
                <select
                  id="sizes"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-gray-700/50 border font-thin font-nunito border-gray-600 rounded py-2 px-3 text-white focus:ring-colorLogo focus:border-colorLogo"
                  required
                  disabled={!selectedColor && availableColors.length !== 1} // Deshabilitar si no hay color y no es único
                >
                  <option value="" disabled>
                    Seleccionar talle
                  </option>
                  {availableSizes.map((size, index) => (
                    <option key={index} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecciona un color para ver talles o no hay talles
                  disponibles.
                </p>
              )}
            </div>
          )}

          {/* Botón Añadir al carrito */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={handleAddToCart}
                      className={`w-full flex items-center justify-center py-2 px-6 rounded font-semibold transition duration-300 ${
                        currentSection === "Dama"
                          ? "bg-women text-black hover:bg-white font-thin font-nunito"
                          : "bg-colorLogo text-black hover:bg-yellow-500 font-thin font-nunito"
                      } ${
                        selectedProduct && Number(selectedProduct.stock) <= 0
                          ? 'opacity-60 cursor-not-allowed hover:!bg-colorLogo'
                          : ''
                      }`}
                      disabled={!selectedColor || !selectedSize || (selectedProduct && Number(selectedProduct.stock) <= 0)}
                    >
                      <FiShoppingCart className="mr-2" />
                      {selectedProduct && Number(selectedProduct.stock) <= 0 ? 'Sin stock' : 'Añadir al carrito'}
                    </button>
                  </div>

          {/* Texto Pago Contraentrega */}
          <p className="text-sm text-center font-thin font-nunito text-gray-400 pt-2">
            Puedes llevártelo con{" "}
            <span className="font-thin font-nunito text-colorLogo">
              Pago Contraentrega
            </span>
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

          <div className="relative overflow-hidden w-[450px] h-[450px] rounded-lg shadow-lg mb-4 group">
            <img
              src={selectedImage}
              alt={selectedProduct.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[2]"
              style={{ transformOrigin: "center center" }}
              onMouseMove={(e) => {
                const { left, top, width, height } =
                  e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transformOrigin = "center center";
              }}
            />
          </div>

          {/* Thumbnails - Igual que "Colores Disponibles" pero en horizontal */}
          <div className="flex justify-center space-x-2 overflow-x-auto py-2 w-full max-w-md order-last lg:order-none">
            {availableColors.map((color, index) => {
              // Encontrar el producto con este color para mostrar su imagen (misma lógica que arriba)
              const colorProduct = similarProducts.find(
                (p) =>
                  p.name === selectedProduct.name &&
                  parseJsonField(p.colors).includes(color)
              );
              const colorImage =
                colorProduct?.Images?.[0]?.url ||
                selectedProduct.Images?.[0]?.url;
              const isSelected = selectedColor === color;

              return (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className={`group relative overflow-hidden rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isSelected
                      ? "ring-2 ring-colorLogo ring-offset-2 ring-offset-gray-800 scale-105"
                      : "ring-1 ring-gray-600 hover:ring-gray-400 hover:scale-105"
                  }`}
                  title={color}
                >
                  <div className="w-16 h-16 relative">
                    <img
                      src={colorImage}
                      alt={color}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-black transition-opacity ${
                        isSelected
                          ? "opacity-0"
                          : "opacity-20 group-hover:opacity-0"
                      }`}
                    />
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    } transition-opacity`}
                  >
                    <p className="text-[10px] text-white text-center font-medium truncate">
                      {color}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-colorLogo text-black rounded-bl-lg px-1">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* --- Sección Productos Relacionados (Ahora es hermano del modal) --- */}
      {/* Condicional para mostrar solo si hay productos */}
      {relatedProducts && relatedProducts.length > 0 && (
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
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id_product}
                  onClick={() => handleViewSimilarProduct(relatedProduct)}
                  className="inline-block w-24 flex-shrink-0 cursor-pointer group text-center" // flex-shrink-0 es importante
                >
                  <img
                    src={
                      relatedProduct.Images?.[0]?.url ||
                      "https://via.placeholder.com/150"
                    }
                    alt={relatedProduct.name}
                    className="w-full h-24 object-cover rounded-lg mb-1 border border-transparent group-hover:border-colorLogo transition-all"
                  />
                  <p className="text-xs text-center text-gray-300 truncate font-thin font-nunito group-hover:text-white">
                    {relatedProduct.name}
                  </p>
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
      )}{" "}
      {/* Fin de la sección Productos Relacionados */}
    </div> // Fin del contenedor principal
  );
};

export default ProductDetails;
