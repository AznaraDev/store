import React, { useEffect, useState } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logoNombre.png';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchFilteredProducts, setPriceFilter, setCategoryFilter, fetchCategories, logout } from '../Redux/Actions/actions';

const navigation = [
  { name: 'Tienda', href: '/products', current: true },
  { name: 'Colecciones', href: '#about', current: false },
  { name: 'Contactanos', href: '#footer', current: false },
  { name: 'Ofertas', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTerm = useSelector(state => state.searchTerm);
  const priceFilter = useSelector(state => state.priceFilter);
  const categoryFilter = useSelector(state => state.categoryFilter);
  const categories = useSelector(state => state.categories.data);
  const userInfo = useSelector(state => state.userLogin.userInfo);
console.log(userInfo)
  useEffect(() => {
    dispatch(fetchCategories());

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dispatch]);

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
    dispatch(fetchFilteredProducts(event.target.value, priceFilter, categoryFilter));
  };

  const handlePriceChange = (event) => {
    const priceRange = event.target.value.split('-').map(Number);
    dispatch(setPriceFilter({ min: priceRange[0], max: priceRange[1] }));
    dispatch(fetchFilteredProducts(searchTerm, { min: priceRange[0], max: priceRange[1] }, categoryFilter));
  };

  const handleCategoryChange = (event) => {
    dispatch(setCategoryFilter(event.target.value));
    dispatch(fetchFilteredProducts(searchTerm, priceFilter, event.target.value));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderMenuItems = () => {
    if (!userInfo) {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/login"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Ingresar
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/register"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Registrarse
              </Link>
            )}
          </Menu.Item>
        </>
      );
    } else if (userInfo.role === 'User') {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`/myOrders/${userInfo.n_document}`}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Mis Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="#"
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    } else if (userInfo.role === 'Admin') {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/allOrders"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/createProducts"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Crear Productos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/facturacion"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Facturación
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/register"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Crear Administrador
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/category"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Nueva Categoría
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/sb"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Nueva SubCategoría
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="#"
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    }
  };

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 text-white ${isTransparent ? 'bg-transparent text-white' : 'bg-colorFooter text-white'}`}>
      <div className="max-w-full px-2 sm:px-4 lg:px-8 py-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                alt="Your Company"
                src={logo}
                className="h-52 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Enlaces de navegación para pantallas grandes */}
          <div className="hidden sm:flex flex-1 justify-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href} // Usa <a> para enlaces de anclaje
                className={`text-xl font-medium text-white ${item.current ? 'text-gray-200' : 'text-gray-700 hover:text-gray-400'}`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:mr-6">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Carrito y menú */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-white">
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                {/* Icono de usuario (ajustar según sea necesario) */}
                <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c3.5 0 6.4 1.6 8 4M12 14c-3.5 0-6.4 1.6-8 4m8-4V3m0 11V3m0 11v-8M8 7h8" />
                </svg>
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {renderMenuItems()}
              </Menu.Items>
            </Menu>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Open main menu</span>
              {open ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </Disclosure.Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 py-3">
          {navigation.map((item) => (
            <Disclosure.Button
              key={item.name}
              as="a"
              href={item.href}
              className={`block px-4 py-2 text-base font-medium text-gray-900 ${item.current ? 'bg-gray-100 text-gray-900' : ''}`}
            >
              {item.name}
            </Disclosure.Button>
          ))}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <Link to="/cart" className="block px-4 py-2 text-base font-medium text-gray-900">
            Carrito
          </Link>
          {renderMenuItems()}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}

