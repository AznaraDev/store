import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchFilteredProducts,
  deleteProduct,
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
  const productsPerPage = 8; 
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchTerm = useSelector((state) => state.searchTerm);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);
  const categoryFilter = useSelector((state) => state.categoryFilter); 
 

 useEffect(() => {
    // Siempre llamamos a fetchFilteredProducts.
    // La acción construirá la URL basada en los parámetros proporcionados.
    // Si searchTerm es '', no filtrará por término de búsqueda.
    // Si categoryFilter es '' o null, la acción no lo añadirá a la URL.
    // Los filtros de precio y oferta se pasan como null si no se usan directamente aquí.
    dispatch(fetchFilteredProducts(searchTerm, null, categoryFilter, null));
  }, [dispatch, searchTerm, categoryFilter]); // Añadir categoryFilter a las dependencias

  // Filtrar productos localmente por la sección actual (Dama, Caballero, Unisex)
  // Esto se aplica DESPUÉS de que los productos hayan sido filtrados por categoría y término de búsqueda desde el backend/acción.
  const sectionFilteredProducts = products.filter(
    (product) => product.section === currentSection || product.section === "Unisex"
  );
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  // Aplicar paginación a los productos ya filtrados por sección (y previamente por categoría/búsqueda)
  const currentProducts = sectionFilteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

   // Comprobar si `products` (antes del filtro de sección) está vacío después de aplicar filtros de categoría/búsqueda
  if (!products || products.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} py-16`}>
        <p className={`${currentSection === 'Dama' ? 'text-gray-700' : 'text-white'} text-lg`}>
          No hay productos que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }
  
  // Comprobar si `currentProducts` (después del filtro de sección y paginación) está vacío
  if (!currentProducts || currentProducts.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} py-16`}>
        <p className={`${currentSection === 'Dama' ? 'text-gray-700' : 'text-white'} text-lg`}>
          No hay productos disponibles para esta sección y filtros.
        </p>
      </div>
    );
  }

 return (
    <div className={`min-h-screen flex flex-col ${ // Contenedor flex principal
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} py-16`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-grow w-full"> {/* Añadido flex-grow y w-full */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 uppercase font-nunito font-thin mt-8">
          {currentProducts.map((product) => (
            <div 
              key={product.id_product} 
              className={`group relative max-w-xs rounded-lg mx-auto flex flex-col ${ // Añadido flex flex-col para alinear el botón al final
                currentSection === 'Dama' 
                  ? 'shadow-silver-soft' 
                  : '' 
              }`}
            >
              {/* Contenido de la card (imagen, nombre, precio) */}
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
                <Link to={`/product/${product.id_product}`}>
                  <img
                    src={
                      product.Images && product.Images.length > 0 // Verificación de product.Images
                        ? product.Images[0].url
                        : "https://via.placeholder.com/150"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover object-center rounded-lg" // Mantenido rounded-lg para la imagen
                  />
                </Link>
                {product.isOffer && (
                  <span className="absolute top-2 left-2 bg-gray-500 text-colorLogo text-xl px-2 py-0 rounded-md font-nunito font-thin z-10">
                    OFERTA
                  </span>
                )}
              </div>
              <div className="mt-4 px-4"> {/* Contenedor para nombre y precio */}
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
              {/* Contenedor del botón, empujado al final */}
              <div className="mt-auto pt-2 pb-4 px-4 flex justify-between items-center"> 
                <button
                  onClick={() => handleButtonClick(product)}
                  className={`mt-4 flex items-center justify-center w-full ${ // mt-4 aquí es opcional si mt-auto funciona bien
                    currentSection === 'Dama' ? 'bg-women hover:bg-white border border-gray-300': 'bg-colorLogo'} font-nunito font-thin ${currentSection === 'Dama' ? 'text-black' : 'text-gray-900'} py-2 px-4 rounded-lg ${currentSection !== 'Dama' ? 'hover:bg-yellow-700' : 'hover:bg-gray-100'} transition-colors duration-300`}
                >
                  <FiShoppingCart className={`mr-2 ${
                    currentSection === 'Dama' ? 'text-black' : 'text-colorFooter'} `} /> Añadir al carrito
                </button>
              </div>
              {userInfo && userInfo.role === "Admin" && (
                <div className="absolute top-2 right-2 flex space-x-2 z-10"> {/* z-10 para asegurar visibilidad sobre otros elementos de la card */}
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
          ))}
        </div>
      </div> {/* Fin del div con flex-grow */}

      {/* Paginación */}
      <div className="mt-8 flex justify-center pb-8"> {/* Añadido pb-8 para un poco de espacio inferior */}
        <nav className="block">
          <ul className="flex pl-0 rounded list-none flex-wrap">
            {Array.from(
              { length: Math.ceil(sectionFilteredProducts.length / productsPerPage) },
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
    </div>
  );
};

export default ProductsList;
