import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../Redux/Actions/stockActions';
import { fetchCategories } from '../../Redux/Actions/actions';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../Redux/Actions/categoryActions';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BASE_URL } from '../../Config';

const ProductsDashboard = () => {
  const dispatch = useDispatch();
  const stockState = useSelector(state => state.stock);
  const { products = [], stats = {}, loading = false, error = null } = stockState?.dashboard || {};
  const categories = useSelector(state => state.categories?.data || []);
  const subCategories = useSelector(state => state.subCategories?.data || []);
  
  console.log('ProductsDashboard - categories:', categories);
  console.log('ProductsDashboard - categories type:', typeof categories, Array.isArray(categories));
  
  // Estados para pestañas
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'subcategories', 'materials'
  
  // Estados para filtros de productos
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para gestión de categorías
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name_category: '', section: '' });
  
  // Estados para gestión de subcategorías
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [subCategoryForm, setSubCategoryForm] = useState({ name_SB: '', id_category: '' });
  const [filterCategoryId, setFilterCategoryId] = useState('');
  
  // Estados para gestión de materiales
  const [materials, setMaterials] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({ name: '', description: '' });
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  
  // Estados para alertas
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (activeTab === 'products') {
      const filters = {};
      if (selectedSection) filters.section = selectedSection;
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (selectedSubCategory) filters.subCategoryId = selectedSubCategory;
      if (stockFilter) filters.stockStatus = stockFilter;
      if (searchTerm) filters.search = searchTerm;
      
      dispatch(fetchDashboard(filters));
    }
  }, [dispatch, activeTab, selectedSection, selectedCategory, selectedSubCategory, stockFilter, searchTerm]);

  // Funciones auxiliares
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  // ==================== CATEGORY HANDLERS ====================
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name_category: '', section: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name_category: category.name_category,
      section: category.section || ''
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name_category.trim()) {
      showAlert('El nombre de la categoría es requerido', 'error');
      return;
    }

    const result = editingCategory
      ? await dispatch(updateCategory(editingCategory.id_category, categoryForm))
      : await dispatch(createCategory(categoryForm));

    if (result.success) {
      showAlert(
        editingCategory ? '✅ Categoría actualizada exitosamente' : '✅ Categoría creada exitosamente',
        'success'
      );
      setShowCategoryModal(false);
      dispatch(fetchCategories());
    } else {
      showAlert(`❌ Error: ${result.error}`, 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    const result = await dispatch(deleteCategory(categoryId));
    if (result.success) {
      showAlert('✅ Categoría eliminada exitosamente', 'success');
      dispatch(fetchCategories());
    } else {
      showAlert(`❌ ${result.error}`, 'error');
    }
  };

  // ==================== SUBCATEGORY HANDLERS ====================
  const handleCreateSubCategory = () => {
    setEditingSubCategory(null);
    setSubCategoryForm({ name_SB: '', id_category: '' });
    setShowSubCategoryModal(true);
  };

  const handleEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      name_SB: subCategory.name_SB,
      id_category: subCategory.id_category
    });
    setShowSubCategoryModal(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name_SB.trim() || !subCategoryForm.id_category) {
      showAlert('Todos los campos son requeridos', 'error');
      return;
    }

    const result = editingSubCategory
      ? await dispatch(updateSubCategory(editingSubCategory.id_SB, subCategoryForm))
      : await dispatch(createSubCategory(subCategoryForm));

    if (result.success) {
      showAlert(
        editingSubCategory ? '✅ Subcategoría actualizada exitosamente' : '✅ Subcategoría creada exitosamente',
        'success'
      );
      setShowSubCategoryModal(false);
      dispatch(fetchSubCategories());
    } else {
      showAlert(`❌ Error: ${result.error}`, 'error');
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    if (!confirm('¿Estás seguro de eliminar esta subcategoría? Esta acción no se puede deshacer.')) {
      return;
    }

    const result = await dispatch(deleteSubCategory(subCategoryId));
    if (result.success) {
      showAlert('✅ Subcategoría eliminada exitosamente', 'success');
      dispatch(fetchSubCategories());
    } else {
      showAlert(`❌ ${result.error}`, 'error');
    }
  };

  // ==================== MATERIAL HANDLERS ====================
  const userInfo = useSelector((state) => state.userLogin?.userInfo);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/material?limit=100`);
      console.log('fetchMaterials response:', response.data);
      setMaterials(response.data.data?.materials || []);
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      showAlert('Error al cargar materiales', 'error');
    }
  };

  const handleCreateMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', description: '' });
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      description: material.description || ''
    });
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.name.trim()) {
      showAlert('El nombre del material es requerido', 'error');
      return;
    }

    try {
      if (editingMaterial) {
        await axios.put(
          `${BASE_URL}/material/${editingMaterial.id_material}`,
          materialForm,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        showAlert('✅ Material actualizado exitosamente', 'success');
      } else {
        await axios.post(`${BASE_URL}/material`, materialForm, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        showAlert('✅ Material creado exitosamente', 'success');
      }
      setShowMaterialModal(false);
      fetchMaterials();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al guardar el material';
      showAlert(`❌ ${message}`, 'error');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('¿Estás seguro de eliminar este material? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/material/${materialId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      showAlert('✅ Material eliminado exitosamente', 'success');
      fetchMaterials();
    } catch (error) {
      showAlert('❌ Error al eliminar material', 'error');
    }
  };

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

  // Obtener subcategorías según la categoría seleccionada para filtros
  // Filtrar categorías válidas (que tengan id)
  const validCategories = categories?.filter(cat => cat && cat.id_category) || [];
  const selectedCategoryData = validCategories.find(cat => cat.id_category === selectedCategory);
  const subCategoriesForFilter = selectedCategoryData?.SubCategories?.filter(sub => sub && sub.id_SB) || [];

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

      {/* Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`${alert.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {alert.message}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Productos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📁 Gestionar Categorías
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'subcategories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📂 Gestionar Subcategorías
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'materials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🧵 Gestionar Materiales
          </button>
        </nav>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div>
          
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
              {subCategoriesForFilter.map(subCat => (
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
              <p className="text-red-600 text-sm mt-1">
                {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
              </p>
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
      )}

      {/* Tab Content: Categories */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Categorías</h2>
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Crear Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(categories) && categories.map((category) => (
              <div
                key={category?.id_category}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{category?.name_category}</h3>
                    {category.section && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {category.section}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id_category)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600">Crea tu primera categoría para comenzar</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Subcategories */}
      {activeTab === 'subcategories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Subcategorías</h2>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id_category} value={cat.id_category}>
                    {cat.name_category}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateSubCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Crear Subcategoría
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories
              .filter((sub) => !filterCategoryId || sub.id_category === filterCategoryId)
              .map((subCategory) => {
                const category = categories.find((c) => c.id_category === subCategory.id_category);
                return (
                  <div
                    key={subCategory.id_SB}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{subCategory.name_SB}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Categoría: {category?.name_category || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditSubCategory(subCategory)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(subCategory.id_SB)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {subCategories.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay subcategorías</h3>
              <p className="text-gray-600">Crea tu primera subcategoría para comenzar</p>
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={categoryForm.name_category}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Anillos, Cadenas, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección
                </label>
                <select
                  value={categoryForm.section}
                  onChange={(e) => setCategoryForm({ ...categoryForm, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar sección</option>
                  <option value="Dama">👗 Dama</option>
                  <option value="Caballero">🎩 Caballero</option>
                  <option value="Unisex">🌟 Unisex</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingSubCategory ? 'Editar Subcategoría' : 'Crear Subcategoría'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Subcategoría *
                </label>
                <input
                  type="text"
                  value={subCategoryForm.name_SB}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name_SB: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Anillos de Oro, Cadenas de Plata, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={subCategoryForm.id_category}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, id_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id_category} value={cat.id_category}>
                      {cat.name_category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubCategoryModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSubCategory}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingSubCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div>
          {/* Header con botón crear */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Gestión de Materiales</h3>
              <p className="text-sm text-gray-600 mt-1">Crea y administra materiales para usar en productos</p>
            </div>
            <button
              onClick={handleCreateMaterial}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Material
            </button>
          </div>

          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar material..."
              value={materialSearchTerm}
              onChange={(e) => setMaterialSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lista de materiales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials
              .filter(m => m.name.toLowerCase().includes(materialSearchTerm.toLowerCase()))
              .map((material) => (
                <div
                  key={material.id_material}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{material.name}</h3>
                    {material.description && (
                      <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id_material)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {materials.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">No hay materiales registrados</p>
              <button
                onClick={handleCreateMaterial}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Crear el primer material
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Material */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej: Oro Laminado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción opcional del material"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMaterial}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingMaterial ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsDashboard;
