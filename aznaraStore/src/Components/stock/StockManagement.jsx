import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../Config';
import DashboardLayout from '../Dashboard/DashboardLayout';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { userInfo } = useSelector(state => state.userLogin);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, showLowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        lowStock: showLowStockOnly
      };

      const response = await axios.get(`${BASE_URL}/stock/products`, {
        params,
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Stock Crítico';
      case 'low': return 'Stock Bajo';
      default: return 'Stock Normal';
    }
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case 'entrada': return '📥';
      case 'salida': return '📤';
      case 'venta': return '🛒';
      case 'devolucion': return '↩️';
      case 'ajuste': return '🔧';
      default: return '📦';
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'entrada': return 'text-green-600';
      case 'salida': return 'text-red-600';
      case 'venta': return 'text-blue-600';
      case 'devolucion': return 'text-purple-600';
      case 'ajuste': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Stock</h1>
            <p className="text-gray-600">Visualiza y controla el inventario de tus productos</p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtro stock bajo */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => {
                      setShowLowStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Solo stock bajo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {products.map(product => (
                  <div key={product.id_product} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Imagen del producto */}
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}

                        {/* Información principal */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">
                                {product.category} {product.subCategory && `• ${product.subCategory}`}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stockStatus)}`}>
                              {getStockStatusText(product.stockStatus)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Stock Actual</p>
                              <p className="text-xl font-bold text-gray-900">{product.stock}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Precio</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ${new Intl.NumberFormat('es-ES').format(product.price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Movimientos</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {product.recentMovements.length}
                              </p>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => setSelectedProduct(selectedProduct === product.id_product ? null : product.id_product)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {selectedProduct === product.id_product ? 'Ocultar' : 'Ver'} movimientos
                              </button>
                            </div>
                          </div>

                          {/* Movimientos de stock */}
                          {selectedProduct === product.id_product && product.recentMovements.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Últimos movimientos</h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {product.recentMovements.map(movement => (
                                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">{getMovementTypeIcon(movement.type)}</span>
                                      <div>
                                        <p className={`font-medium ${getMovementTypeColor(movement.type)}`}>
                                          {movement.type.toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500">{movement.reason || 'Sin descripción'}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {movement.previousStock} → {movement.newStock}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(movement.date).toLocaleDateString('es-ES', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockManagement;
