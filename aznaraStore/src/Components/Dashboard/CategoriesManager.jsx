import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../Redux/Actions/categoryActions';

const CategoriesManager = () => {
  const dispatch = useDispatch();
  const { categories, subCategories } = useSelector((state) => state);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'subcategories'
  
  // Estados para categorías
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Estados para subcategorías
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', categoryId: '' });
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [dispatch]);

  // ==================== CATEGORÍAS ====================
  
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const result = await dispatch(createCategory(categoryForm));
    
    if (result.success) {
      showAlert('Categoría creada exitosamente', 'success');
      setCategoryForm({ name: '' });
      setShowCategoryModal(false);
      dispatch(fetchCategories());
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateCategory(editingCategory.id_category, categoryForm));
    
    if (result.success) {
      showAlert('Categoría actualizada exitosamente', 'success');
      setEditingCategory(null);
      setCategoryForm({ name: '' });
      setShowCategoryModal(false);
      dispatch(fetchCategories());
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;
    
    const result = await dispatch(deleteCategory(id));
    
    if (result.success) {
      showAlert(result.message, 'success');
      dispatch(fetchCategories());
      dispatch(fetchSubCategories()); // Refrescar subcategorías también
    } else {
      showAlert(result.error, 'error');
    }
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
    setShowSubCategoryModal(false);
    setEditingCategory(null);
    setEditingSubCategory(null);
    setCategoryForm({ name: '' });
    setSubCategoryForm({ name: '', categoryId: '' });
  };

  // ==================== SUBCATEGORÍAS ====================

  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSubCategory(subCategoryForm));
    
    if (result.success) {
      showAlert('Subcategoría creada exitosamente', 'success');
      setSubCategoryForm({ name: '', categoryId: '' });
      setShowSubCategoryModal(false);
      dispatch(fetchSubCategories());
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateSubCategory(editingSubCategory.id_subCategory, subCategoryForm));
    
    if (result.success) {
      showAlert('Subcategoría actualizada exitosamente', 'success');
      setEditingSubCategory(null);
      setSubCategoryForm({ name: '', categoryId: '' });
      setShowSubCategoryModal(false);
      dispatch(fetchSubCategories());
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la subcategoría "${name}"?`)) return;
    
    const result = await dispatch(deleteSubCategory(id));
    
    if (result.success) {
      showAlert(result.message, 'success');
      dispatch(fetchSubCategories());
    } else {
      showAlert(result.error, 'error');
    }
  };

  const openEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({ 
      name: subCategory.name, 
      categoryId: subCategory.categoryId 
    });
    setShowSubCategoryModal(true);
  };

  const showAlert = (message, type) => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const filteredSubCategories = selectedCategoryFilter
    ? subCategories.data?.filter(sub => sub.categoryId === selectedCategoryFilter)
    : subCategories.data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Categorías</h1>
          <p className="text-gray-600">Administra categorías y subcategorías de productos</p>
        </div>

        {/* Alert */}
        {alertMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            alertMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{alertMessage.type === 'success' ? '✅' : '⚠️'}</span>
              <p>{alertMessage.message}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'categories'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 Categorías ({categories.data?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('subcategories')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'subcategories'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📂 Subcategorías ({subCategories.data?.length || 0})
              </button>
            </nav>
          </div>

          {/* Contenido Categorías */}
          {activeTab === 'categories' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Categorías</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Nueva Categoría
                </button>
              </div>

              {categories.loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.data?.map((category) => (
                    <div key={category.id_category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id_category, category.name)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.SubCategories?.length || 0} subcategorías
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenido Subcategorías */}
          {activeTab === 'subcategories' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Subcategorías</h2>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.data?.map((cat) => (
                      <option key={cat.id_category} value={cat.id_category}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowSubCategoryModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ➕ Nueva Subcategoría
                </button>
              </div>

              {subCategories.loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubCategories?.map((subCategory) => (
                    <div key={subCategory.id_subCategory} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{subCategory.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {subCategory.category?.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditSubCategory(subCategory)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(subCategory.id_subCategory, subCategory.name)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Categoría */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Subcategoría */}
        {showSubCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                {editingSubCategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </h3>
              <form onSubmit={editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={subCategoryForm.name}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={subCategoryForm.categoryId}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.data?.map((cat) => (
                      <option key={cat.id_category} value={cat.id_category}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingSubCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;
