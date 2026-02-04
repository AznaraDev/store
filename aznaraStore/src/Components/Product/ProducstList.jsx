import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  
  fetchFilteredProducts,
  deleteProduct,
  setSubCategoryFilter,
} from "../../Redux/Actions/actions";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiEdit, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";
import { useSection } from "../../SectionContext";


const ProductsList = () => {
  const { section: currentSection } = useSection();
 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16; 
  const allProductsFromState = useSelector((state) => state.products || []);
  //const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchTerm = useSelector((state) => state.searchTerm);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);
  const categoryFilter = useSelector((state) => state.categoryFilter); 
  console.log("ProductsList - categoryFilter al renderizar:", categoryFilter); // <--- AÑADE ESTE LOG
  const subCategoryFilter = useSelector((state) => state.subCategoryFilter); // Nuevo selector

 const [availableSubCategories, setAvailableSubCategories] = useState([]);

useEffect(() => {
    // Llama a fetchFilteredProducts con todos los filtros.
    // El cuarto parámetro es isOffer, el quinto es subCategoryName.
    console.log(`Dispatching fetchFilteredProducts con: searchTerm=${searchTerm}, categoryFilter=${categoryFilter}, subCategoryFilter=${subCategoryFilter}`);
    dispatch(fetchFilteredProducts(searchTerm, null, categoryFilter, null, subCategoryFilter));
  }, [dispatch, searchTerm, categoryFilter, subCategoryFilter]);

  useEffect(() => {
    console.log("useEffect para extraer subcategorías se disparó.");
    console.log("categoryFilter actual:", categoryFilter);
    console.log("allProductsFromState (primeros 5 para brevedad):", allProductsFromState.slice(0, 5).map(p => ({name: p.name, Category: p.Category, SubCategory: p.SubCategory }))); // Muestra estructura relevante

    if (categoryFilter && allProductsFromState.length > 0) {
      const subCategories = [...new Set(
        allProductsFromState
          .filter(p => {
            const categoryMatch = p.Category?.name_category === categoryFilter;
            const hasSubCategoryName = p.SubCategory?.name_SB;
            // Descomenta para depuración detallada por producto:
            // if (p.Category?.name_category === categoryFilter) {
            //   console.log(`Producto: ${p.name}, CatName: ${p.Category?.name_category}, SubCatName: ${p.SubCategory?.name_SB}, categoryMatch: ${categoryMatch}, hasSubCategoryName: ${!!hasSubCategoryName}`);
            // }
            return categoryMatch && hasSubCategoryName;
          })
          .map(p => p.SubCategory.name_SB)
      )].sort();

      console.log("Subcategorías extraídas:", subCategories);
      // Solo actualizar si el nuevo array es diferente al actual para evitar re-renders innecesarios
      if (JSON.stringify(subCategories) !== JSON.stringify(availableSubCategories)) {
        setAvailableSubCategories(subCategories);
      }
    } else {
      // Si no hay categoryFilter o no hay productos, limpiar las subcategorías
      if (availableSubCategories.length > 0) { // Solo actualizar si es necesario
        console.log("Limpiando subcategorías disponibles.");
        setAvailableSubCategories([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [allProductsFromState, categoryFilter]); 

  // Filtrar productos localmente por la sección actual (Dama, Caballero, Unisex)
  // Esto se aplica DESPUÉS de que los productos hayan sido filtrados por categoría/subcategoría/búsqueda desde el backend.
  const sectionFilteredProducts = useMemo(() => {
    return allProductsFromState.filter(
      (product) => product.section === currentSection || product.section === "Unisex"
    );
  }, [allProductsFromState, currentSection]);

  // Agrupar productos por variantes (mismo nombre + subcategoría)
  // Solo mostrar UN producto por cada grupo de variantes
  const uniqueProducts = useMemo(() => {
    const seen = new Map();
    const unique = [];
    
    sectionFilteredProducts.forEach(product => {
      // Crear una clave única basada en nombre + subcategoría
      const key = `${product.name}-${product.id_SB}`;
      
      if (!seen.has(key)) {
        seen.set(key, true);
        unique.push(product);
      }
    });
    
    return unique;
  }, [sectionFilteredProducts]);
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  // Aplicar paginación a los productos ya filtrados y agrupados
  const currentProducts = useMemo(() => {
    return uniqueProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
  }, [uniqueProducts, indexOfFirstProduct, indexOfLastProduct]);



  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 const handleSubCategoryClick = (subCatName) => {
    setCurrentPage(1); // Resetear paginación al cambiar el filtro
    if (subCatName === subCategoryFilter) { // Si se hace clic en la subcategoría activa, se deselecciona
        dispatch(setSubCategoryFilter(null));
    } else {
        dispatch(setSubCategoryFilter(subCatName));
    }
  };
  
  const handleClearSubCategoryFilter = () => {
    setCurrentPage(1); // Resetear paginación
    dispatch(setSubCategoryFilter(null));
  };

  const handleButtonClick = (product) => {
    navigate(`/product/${product.id_product}`);
  };

  const handleEditProduct = (id_product) => {
    navigate(`/updateProduct/${id_product}`);
  };

  const handleDeleteProduct = (id_product) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(id_product));
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }
  
  // Si no hay productos DESPUÉS de los filtros de API (categoría, subcategoría, búsqueda)
  // Y ANTES del filtro de sección.
  if (!loading && !error && (!allProductsFromState || allProductsFromState.length === 0)) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} py-16`}>
        {/* Mostrar subcategorías incluso si no hay productos para la combinación actual */}
        {categoryFilter && availableSubCategories.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mb-6">
              <h3 className={`text-xl font-semibold mb-3 text-center ${currentSection === 'Dama' ? 'text-gray-800' : 'text-gray-200'}`}>
                Subcategorías de {categoryFilter}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={handleClearSubCategoryFilter}
                  className={`px-4 py-2 rounded-md text-sm font-medium
                    ${!subCategoryFilter 
                      ? (currentSection === 'Dama' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black')
                      : (currentSection === 'Dama' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-200 hover:bg-gray-600')}
                  `}
                >
                  Todas
                </button>
                {availableSubCategories.map(sc => (
                  <button
                    key={sc}
                    onClick={() => handleSubCategoryClick(sc)}
                    className={`px-4 py-2 rounded-md text-sm font-medium
                      ${subCategoryFilter === sc 
                        ? (currentSection === 'Dama' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black')
                        : (currentSection === 'Dama' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-200 hover:bg-gray-600')}
                    `}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>
          )}
        <p className={`${currentSection === 'Dama' ? 'text-gray-700' : 'text-white'} text-lg mt-4`}>
          No hay productos que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }
  
 return (
    <div className={`min-h-screen flex flex-col ${
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} pt-16`}> {/* pt-16 para dejar espacio al navbar fijo */}
      
       {categoryFilter && availableSubCategories.length > 0 && (
        <div className={`sticky top-16 z-20 py-4 mb-6 shadow-md 
                       ${currentSection === 'Dama' ? 'bg-white bg-opacity-95' : 'bg-colorFooter bg-opacity-95'} backdrop-blur-sm`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <h3 className={`text-lg md:text-xl font-nunito mb-4 text-center ${currentSection === 'Dama' ? 'text-gray-800' : 'text-gray-200'}`}>
                    Selecciona más opciones de  {categoryFilter}
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3"> {/* Aumentado el gap y centrado vertical */}
                    {/* Botón Todas */}
                    <button
                      onClick={handleClearSubCategoryFilter}
                      className={`
                        px-4 py-2 rounded-lg text-xl font-nunito font-thin shadow-sm
                        transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75
                        ${!subCategoryFilter 
                          ? (currentSection === 'Dama' 
                              ? 'bg-women text-slate-700 shadow-lg ring-pink-300' // Estilo activo para Dama
                              : 'bg-gray-700 text-white shadow-lg ring-gray-600') // Estilo activo para otras secciones
                          : (currentSection === 'Dama' 
                              ? 'bg-women text-slate-700 hover:bg-pink-200 ring-pink-400' // Estilo inactivo para Dama
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 ring-gray-500') // Estilo inactivo para otras secciones
                        }
                      `}
                    >
                      Ver Todas
                    </button>
                    
                    {/* Botones de Subcategorías */}
                    {availableSubCategories.map(sc => (
                      <button
                        key={sc}
                        onClick={() => handleSubCategoryClick(sc)}
                        className={`
                          px-4 py-2 rounded-lg text-xl font-nunito font-thin shadow-sm
                          transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75
                          ${subCategoryFilter === sc 
                            ? (currentSection === 'Dama' 
                                ? 'bg-pink-600 text-white shadow-lg ring-pink-500' // Estilo activo para Dama
                                : 'bg-gray-700 text-white shadow-lg ring-gray-600') // Estilo activo para otras secciones
                            : (currentSection === 'Dama' 
                                ? 'bg-pink-100 text-slate-700 hover:bg-pink-200 ring-pink-500' // Estilo inactivo para Dama
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 ring-gray-500') // Estilo inactivo para otras secciones
                          }
                        `}
                      >
                        {sc}
                      </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-grow w-full pb-8"> {/* Contenedor de productos y paginación */}
        {/* Grid de productos */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 uppercase font-nunito font-thin mt-8">
            {currentProducts.map((product) => {
              // Contar cuántas variantes de color tiene este producto
              const variantCount = sectionFilteredProducts.filter(
                p => p.name === product.name && p.id_SB === product.id_SB
              ).length;
              
              return (
              <div 
                key={product.id_product} 
                className={`group relative max-w-xs rounded-lg mx-auto flex flex-col ${
                  currentSection === 'Dama' 
                    ? 'shadow-silver-soft' 
                    : '' 
                }`}
              >
                {/* ... (resto de la card del producto sin cambios) ... */}
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
                  <Link to={`/product/${product.id_product}`}>
                    <img
                      src={
                        product.Images && product.Images.length > 0
                          ? product.Images[0].url
                          : "https://via.placeholder.com/150"
                      }
                      alt={product.name}
                      className="h-full w-full object-cover object-center rounded-lg"
                    />
                  </Link>
                  {product.isOffer && (
                    <span className="absolute top-2 left-2 bg-gray-500 text-colorLogo text-xl px-2 py-0 rounded-md font-nunito font-thin z-10">
                      OFERTA
                    </span>
                  )}
                  {variantCount > 1 && (
                    <span className={`absolute top-2 right-2 ${
                      currentSection === 'Dama' ? 'bg-pink-600' : 'bg-colorLogo/90'
                    } text-white text-xs px-2 py-1 rounded-full font-medium z-10 flex items-center gap-1`}>
                      <span className="text-sm">{variantCount}</span>
                      <span className="text-[10px]">colores</span>
                    </span>
                  )}
                </div>
                <div className="mt-4 px-4">
                  <h3 
                    className={`text-2xl font-thin font-nunito ${
                      currentSection === 'Dama' ? 'text-gray-800' : 'text-gray-300'
                    }`}
                  >
                    <Link 
                      to={`/product/${product.id_product}`}
                      className={currentSection === 'Dama' ? 'hover:text-colorDetalle' : 'hover:text-colorLogo'}
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p  
                    className={`text-lg font-thin font-nunito ${
                      currentSection === 'Dama' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    ${new Intl.NumberFormat('es-ES').format(product.price)}
                  </p>
                </div>
                <div className="mt-auto pt-2 pb-4 px-4 flex justify-between items-center"> 
                  <button
                    onClick={() => handleButtonClick(product)}
                    className={`mt-4 flex items-center justify-center w-full ${
                      currentSection === 'Dama' ? 'bg-women hover:bg-white border border-gray-300': 'bg-colorLogo'} font-nunito font-thin ${currentSection === 'Dama' ? 'text-black' : 'text-gray-900'} py-2 px-4 rounded-lg ${currentSection !== 'Dama' ? 'hover:bg-yellow-700' : 'hover:bg-gray-100'} transition-colors duration-300`}
                  >
                    <FiShoppingCart className={`mr-2 ${
                      currentSection === 'Dama' ? 'text-black' : 'text-colorFooter'} `} /> Añadir al carrito
                  </button>
                </div>
                {userInfo && userInfo.role === "admin" && (
                  <div className="absolute top-2 right-2 flex space-x-2 z-10">
                    <button
                      className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200"
                      onClick={() => handleEditProduct(product.id_product)}
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-700"
                      onClick={() => handleDeleteProduct(product.id_product)}
                    >
                      <FiTrash size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        ) : (
          // Este mensaje se muestra si allProductsFromState tiene productos,
          // pero sectionFilteredProducts (y por ende currentProducts) está vacío.
          // Esto significa que hay productos para la categoría/subcategoría/búsqueda general,
          // pero no para la sección actual (Dama/Caballero).
          allProductsFromState.length > 0 && (
            <p className={`text-center mt-8 ${currentSection === 'Dama' ? 'text-gray-700' : 'text-white'} text-lg`}>
              No hay productos disponibles para esta sección con los filtros actuales.
            </p>
          )
        )}
      </div>

      {/* Paginación */}
      {/* Solo mostrar paginación si hay más productos que los que caben en una página */}
      {uniqueProducts.length > productsPerPage && (
        <div className="mt-auto flex justify-center pb-8"> {/* mt-auto para empujar al fondo si el contenido es poco */}
          <nav className="block">
            <ul className="flex pl-0 rounded list-none flex-wrap">
              {Array.from(
                { length: Math.ceil(uniqueProducts.length / productsPerPage) },
                (_, i) => (
                  <li key={i}>
                    <button
                      className={`${
                        currentPage === i + 1
                          ? (currentSection === 'Dama' ? "bg-gray-400 text-black" : "bg-gray-600 text-white hover:bg-gray-400")
                          : (currentSection === 'Dama' ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-gray-700 text-gray-200 hover:bg-gray-300")
                      } px-3 py-2 ml-1 rounded`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
export default ProductsList;
