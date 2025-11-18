import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../Redux/Actions/stockActions';
import { fetchCategories } from '../../Redux/Actions/actions';

const ProductsDashboard = () => {
  const dispatch = useDispatch();
  const stockState = useSelector(state => state.stock);
  const { products = [], stats = {}, loading = false, error = null } = stockState?.dashboard || {};
  const categories = useSelector(state => state.categories?.data || []);
  
  // Estados para filtros
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const filters = {};
    if (selectedSection) filters.section = selectedSection;
    if (selectedCategory) filters.categoryId = selectedCategory;
    if (selectedSubCategory) filters.subCategoryId = selectedSubCategory;
    if (stockFilter) filters.stockStatus = stockFilter;
    if (searchTerm) filters.search = searchTerm;
    
    dispatch(fetchDashboard(filters));
  }, [dispatch, selectedSection, selectedCategory, selectedSubCategory, stockFilter, searchTerm]);

  // Configuración de colores por sección
  const sectionColors = {
    Dama: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-700',
      badge: 'bg-pink-100 text-pink-800',
      button: 'bg-pink-600 hover:bg-pink-700'
    },
    Caballero: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    Unisex: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  // Obtener subcategorías según la categoría seleccionada
  // Filtrar categorías válidas (que tengan id)
  const validCategories = categories?.filter(cat => cat && cat.id_category) || [];
  const selectedCategoryData = validCategories.find(cat => cat.id_category === selectedCategory);
  const subCategories = selectedCategoryData?.SubCategories?.filter(sub => sub && sub.id_SB) || [];

  const handleClearFilters = () => {
    setSelectedSection('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setStockFilter('');
    setSearchTerm('');
  };

  const getStockBadge = (product) => {
    if (product.stock === 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Sin Stock</span>;
    }
    if (product.stock <= product.min_stock) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Stock Bajo</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Productos</h1>
        <p className="text-gray-600">Gestiona y visualiza todos los productos del inventario</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Filtro de Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Producto
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las secciones</option>
              <option value="Dama">👗 Dama</option>
              <option value="Caballero">🎩 Caballero</option>
              <option value="Unisex">🌟 Unisex</option>
            </select>
          </div>

          {/* Filtro de Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory(''); // Reset subcategory when category changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {validCategories.map(category => (
                <option key={`category-${category.id_category}`} value={category.id_category}>
                  {category.name_category}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Subcategoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoría
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Todas las subcategorías</option>
              {subCategories.map(subCat => (
                <option key={`subcat-${subCat.id_SB}`} value={subCat.id_SB}>
                  {subCat.name_SB}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros adicionales y acciones */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Stock */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="normal">Con Stock Normal</option>
              <option value="low">Stock Bajo</option>
              <option value="out">Sin Stock</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          {(selectedSection || selectedCategory || selectedSubCategory || stockFilter || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              🔄 Limpiar Filtros
            </button>
          )}

          {/* Estadísticas rápidas */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Total: <strong>{stats?.general?.total || 0}</strong>
            </span>
            <span className="text-gray-600">
              Mostrando: <strong>{products?.length || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <p className="text-red-800 font-semibold">Error al cargar productos</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => dispatch(fetchDashboard({}))}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      {!loading && products && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const colors = sectionColors[product.section] || sectionColors.Unisex;
            
            return (
              <div
                key={`product-${product.id_product}`}
                className={`${colors.bg} ${colors.border} border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow`}
              >
                {/* Imagen del Producto */}
                <div className="relative bg-white h-48">
                  {product.Images && product.Images[0] ? (
                    <img
                      src={product.Images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  {/* Badge de Sección */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md ${colors.badge} text-xs font-semibold`}>
                    {product.section}
                  </div>
                </div>

                {/* Información del Producto */}
                <div className="p-4">
                  <h3 className={`font-semibold text-lg ${colors.text} mb-2 truncate`}>
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio:</span>
                      <span className="font-semibold">${parseInt(product.price).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Stock:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{product.stock}</span>
                        {getStockBadge(product)}
                      </div>
                    </div>

                    {product.Category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="text-gray-900 text-xs">{product.Category.name_category}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link
                      to={`/updateProduct/${product.id_product}`}
                      className={`flex-1 text-center px-3 py-2 text-white text-sm font-medium rounded-md ${colors.button} transition-colors`}
                    >
                      ✏️ Editar
                    </Link>
                    <Link
                      to={`/product/${product.id_product}`}
                      className="px-3 py-2 text-gray-700 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      👁️
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && products && products.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-600 mb-4">
            {selectedSection || selectedCategory || selectedSubCategory || stockFilter || searchTerm
              ? 'No se encontraron productos con los filtros seleccionados'
              : 'Aún no hay productos en el inventario'}
          </p>
          {(selectedSection || selectedCategory || selectedSubCategory || stockFilter || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsDashboard;
