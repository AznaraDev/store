import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { userInfo } = useSelector(state => state.userLogin);

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

  // Menú de navegación del dashboard organizado por secciones
  const dashboardSections = [
    {
      title: '📊 General',
      items: [
        {
          name: 'Panel Principal',
          href: '/admin',
          icon: '🏠',
          current: location.pathname === '/admin'
        }
      ]
    },
    {
      title: '📦 Inventario',
      items: [
        {
          name: 'Dashboard Productos',
          href: '/admin/products',
          icon: '📊',
          current: location.pathname === '/admin/products'
        },
        {
          name: 'Crear Producto',
          href: '/createProducts',
          icon: '➕',
          current: location.pathname === '/createProducts'
        },
        {
          name: 'Gestión de Stock',
          href: '/admin/stock',
          icon: '📦',
          current: location.pathname === '/admin/stock'
        },
        {
          name: 'Stock Bajo',
          href: '/admin/stock/alerts',
          icon: '⚠️',
          current: location.pathname === '/admin/stock/alerts'
        }
      ]
    },
    {
      title: '🛒 Pedidos',
      items: [
        {
          name: 'Todos los Pedidos',
          href: '/allOrders',
          icon: '📋',
          current: location.pathname === '/allOrders'
        },
        {
          name: 'Pedidos Pendientes',
          href: '/admin/orders/pending',
          icon: '⏳',
          current: location.pathname === '/admin/orders/pending'
        }
      ]
    },
    {
      title: '👥 Clientes',
      items: [
        {
          name: 'Lista de Clientes',
          href: '/admin/customers',
          icon: '👥',
          current: location.pathname === '/admin/customers'
        }
      ]
    },
    {
      title: '🧾 Facturación (Taxxa)',
      items: [
        {
          name: 'Panel Taxxa',
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
          name: 'Configuración Vendedor',
          href: '/seller-settings',
          icon: '⚙️',
          current: location.pathname === '/seller-settings'
        }
      ]
    },
    {
      title: '⚙️ Configuración',
      items: [
        {
          name: 'Categorías',
          href: '/category',
          icon: '🏷️',
          current: location.pathname === '/category'
        },
        {
          name: 'Subcategorías',
          href: '/sb',
          icon: '🔖',
          current: location.pathname === '/sb'
        },
        {
          name: 'Crear Admin',
          href: '/register',
          icon: '👨‍💼',
          current: location.pathname === '/register'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Panel Admin</h2>
              </div>
              
              <nav className="space-y-6">
                {dashboardSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
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
                          <span className="truncate">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Acceso rápido</div>
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                >
                  <span className="mr-2">🏪</span>
                  Ver Tienda
                </Link>
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
