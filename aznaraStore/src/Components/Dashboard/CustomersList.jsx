import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CustomersList = () => {
  const { userInfo } = useSelector(state => state.userLogin);
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('totalSpent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userInfo || !userInfo.token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/user/customers/list`, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      });

      const customersData = response.data.customers || [];
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      
      // Extract unique cities
      const uniqueCities = [...new Set(customersData.map(c => c.city).filter(Boolean))];
      setCities(uniqueCities);
      
      // Calculate stats
      setStats({
        totalCustomers: customersData.length,
        totalRevenue: customersData.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        totalOrders: customersData.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort customers whenever search/filter/sort changes
  useEffect(() => {
    if (!customers.length) return;
    
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.n_document?.includes(searchTerm);
      
      const matchesCity = !selectedCity || customer.city === selectedCity;
      
      return matchesSearch && matchesCity;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'totalOrders':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'name':
          compareA = a.full_name?.toLowerCase() || '';
          compareB = b.full_name?.toLowerCase() || '';
          return compareA.localeCompare(compareB);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedCity, sortBy]);



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
            <p className="text-gray-600">
              Usuarios que han realizado al menos una compra
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pedidos Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Ciudad
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⬆️ Ordenar por
                </label>
                <div className="flex gap-2">
                                  <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="totalSpent">Gasto Total</option>
                  <option value="totalOrders">Pedidos</option>
                  <option value="name">Nombre</option>
                  <option value="date">Fecha Registro</option>
                </select>

                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <p className="font-medium text-red-800">Error al cargar clientes</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchCustomers}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Customers Table */}
          {!loading && !error && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciudad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pedidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gasto Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente Desde
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <span className="text-6xl mb-4">🔍</span>
                            <p className="text-lg font-medium">No se encontraron clientes</p>
                            <p className="text-sm">Prueba con otros filtros de búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.n_document}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">
                                  {customer.gender === 'F' ? '👩' : customer.gender === 'M' ? '👨' : '🧑'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.n_document}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.city || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {customer.totalOrders}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(customer.totalSpent)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Results count */}
              {filteredCustomers.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{filteredCustomers.length}</span> de{' '}
                    <span className="font-medium">{customers.length}</span> clientes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export default CustomersList;
