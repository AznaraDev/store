import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../Redux/Actions/stockActions';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.stock.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard({}));
  }, [dispatch]);

  // Cards de estadísticas rápidas
  const quickStats = [
    {
      title: 'Total Productos',
      value: stats?.general?.total || 0,
      icon: '📦',
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/products'
    },
    {
      title: 'Stock Total',
      value: stats?.general?.total_stock || 0,
      icon: '📊',
      color: 'bg-green-100 text-green-600',
      link: '/admin/stock'
    },
    {
      title: 'Stock Bajo',
      value: stats?.general?.low_stock || 0,
      icon: '⚠️',
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/stock/alerts'
    },
    {
      title: 'Sin Stock',
      value: stats?.general?.out_of_stock || 0,
      icon: '🚫',
      color: 'bg-red-100 text-red-600',
      link: '/admin/stock/alerts'
    }
  ];

  // Accesos rápidos
  const quickActions = [
    {
      title: 'Crear Producto',
      description: 'Añadir nuevo producto al inventario',
      icon: '➕',
      link: '/createProducts',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200'
    },
    {
      title: 'Ver Pedidos',
      description: 'Gestionar todos los pedidos',
      icon: '🛒',
      link: '/allOrders',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    },
    {
      title: 'Facturas Pendientes',
      description: 'Emitir facturas Taxxa',
      icon: '📋',
      link: '/pendientInvoices',
      color: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
    },
    {
      title: 'Gestión de Stock',
      description: 'Administrar inventario',
      icon: '📦',
      link: '/admin/stock',
      color: 'bg-green-100 text-green-600 hover:bg-green-200'
    },
    {
      title: 'Configuración',
      description: 'Categorías y subcategorías',
      icon: '⚙️',
      link: '/category',
      color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    },
    {
      title: 'Clientes',
      description: 'Lista de clientes',
      icon: '👥',
      link: '/admin/customers',
      color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Bienvenido al panel de gestión de Aznara Store</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stock por Sección */}
      {stats?.bySection && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock por Sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.bySection).map(([section, data]) => (
              <div key={section} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 capitalize">{section}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total productos:</span>
                    <span className="font-semibold">{data.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock total:</span>
                    <span className="font-semibold">{data.total_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Stock bajo:</span>
                    <span className="font-semibold text-yellow-600">{data.low_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Sin stock:</span>
                    <span className="font-semibold text-red-600">{data.out_of_stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`${action.color} rounded-lg p-4 transition-colors`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-4">{action.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-75">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {(stats?.general?.low_stock > 0 || stats?.general?.out_of_stock > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-yellow-800 font-semibold mb-1">Alertas de Inventario</h3>
              <p className="text-yellow-700 text-sm mb-2">
                Hay productos que requieren tu atención:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {stats.general.out_of_stock > 0 && (
                  <li>• {stats.general.out_of_stock} producto(s) sin stock</li>
                )}
                {stats.general.low_stock > 0 && (
                  <li>• {stats.general.low_stock} producto(s) con stock bajo</li>
                )}
              </ul>
              <Link
                to="/admin/stock/alerts"
                className="inline-block mt-3 text-yellow-800 font-medium hover:text-yellow-900 underline"
              >
                Ver detalles →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
