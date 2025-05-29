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

 

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

;

  // Filtrar productos por sección actual
  const filteredProducts = products.filter(
    (product) => product.section === currentSection || product.section === "Unisex"
  );
  


  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
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

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorFooter py-16">
        <p className="text-white text-lg">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${
        currentSection === 'Dama' ? 'bg-white' : 'bg-colorFooter'} py-16`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 uppercase font-nunito font-thin">
          {currentProducts.map((product) => (
            <div 
              key={product.id_product} 
              className={`group relative max-w-xs rounded-lg ${ // Clases base para la card
                currentSection === 'Dama' 
                  ? 'shadow-silver-soft' // Aplicar sombra personalizada para Dama, sin fondo explícito aquí
                  : '' // Fondo para otras secciones (puedes ajustar este color si es necesario)
              }`}
            >
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
                <Link to={`/product/${product.id_product}`}>
                  <img
                    src={
                      product.Images.length > 0
                        ? product.Images[0].url
                        : "https://via.placeholder.com/150"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover object-center rounded-lg"
                  />
                </Link>
                {product.isOffer && (
                  <span className="absolute top-2 left-2 bg-gray-500 text-colorLogo text-xl px-2 py-0 rounded-md font-nunito font-thin">
                    OFERTA
                  </span>
                )}
              </div>
              <div className="mt-4 px-4">
                <h3 
                  className={`text-2xl font-thin font-nunito ${
                    currentSection === 'Dama' ? 'text-gray-800' : 'text-gray-300' // Color condicional para el nombre
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
                    currentSection === 'Dama' ? 'text-gray-700' : 'text-gray-300' // Color condicional para el precio
                  }`}
                >
                  ${new Intl.NumberFormat('es-ES').format(product.price)}
                </p>
              </div>
              <div className="mt-4 mb-4 px-4 flex justify-between items-center">
                <button
                  onClick={() => handleButtonClick(product)}
                  className={`mt-4 flex items-center justify-center w-full ${
                    currentSection === 'Dama' ? 'bg-women hover:bg-white ': 'bg-colorLogo'} font-nunito font-thin text-gray-900 py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors duration-300`}
                >
                  <FiShoppingCart className={`mr-2 ${
        currentSection === 'Dama' ? 'text-black' : 'text-colorFooter'} `} /> Añadir al carrito
                </button>
              </div>
              {userInfo && userInfo.role === "Admin" && (
                <div className="absolute top-2 right-2 flex space-x-2">
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

        {/* Paginación */}
        <div className="mt-8 flex justify-center">
          <nav className="block">
            <ul className="flex pl-0 rounded list-none flex-wrap">
              {Array.from(
                { length: Math.ceil(filteredProducts.length / productsPerPage) },
                (_, i) => (
                  <li key={i}>
                    <button
                      className={`${
                        currentPage === i + 1
                          ? "bg-gray-600 text-white hover:bg-gray-400"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-300"
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
    </div>
  );
};

export default ProductsList;
