import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  
  // ✅ Validación segura del estado del usuario
  const userLoginState = useSelector(state => state.userLogin || {});
  const { userInfo } = userLoginState;

  // Verificar si el usuario tiene permisos de admin/comercio
  const hasAdminPermissions = userInfo && (userInfo.role === 'Admin' || userInfo.role === 'comercio');

  if (!hasAdminPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección del dashboard.
            </p>
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Menú de navegación del dashboard
  const dashboardNavigation = [
    {
      name: 'Panel Principal',
      href: '/taxxa',
      icon: '🏠',
      current: location.pathname === '/taxxa'
    },
    {
      name: 'Facturas Pendientes',
      href: '/pendientInvoices',
      icon: '📋',
      current: location.pathname === '/pendientInvoices'
    },
    {
      name: 'Facturas Emitidas',
      href: '/invoices',
      icon: '📄',
      current: location.pathname === '/invoices'
    },
    {
      name: 'Factura Manual',
      href: '/manual-invoice',
      icon: '✏️',
      current: location.pathname === '/manual-invoice'
    },
    {
      name: 'Configuración',
      href: '/seller-settings',
      icon: '⚙️',
      current: location.pathname === '/seller-settings'
    },
    {
      name: 'Test Taxxa',
      href: '/taxxa-test',
      icon: '🧪',
      current: location.pathname === '/taxxa-test'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Header del Dashboard */}
      

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🧾 Menú Taxxa</h2>
              <nav className="space-y-2">
                {dashboardNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Enlaces adicionales */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Administración</h3>
                <div className="space-y-1">
                  <Link
                    to="/allOrders"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                  >
                    <span className="mr-2">📦</span>
                    Todos los Pedidos
                  </Link>
                  <Link
                    to="/createProducts"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                  >
                    <span className="mr-2">➕</span>
                    Crear Productos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
