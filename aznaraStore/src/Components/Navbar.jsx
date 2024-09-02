import React, { useEffect } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FiAlignJustify } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logoSunya.png';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchFilteredProducts, setPriceFilter, setCategoryFilter, fetchCategories, logout } from '../Redux/Actions/actions';

const navigation = [
  { name: 'Nuestros Productos', href: '/', current: true },
  { name: 'Donde Encontrarnos', href: '#', current: false },
  { name: 'Contacto', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const dispatch = useDispatch();
  const searchTerm = useSelector(state => state.searchTerm);
  const priceFilter = useSelector(state => state.priceFilter);
  const categoryFilter = useSelector(state => state.categoryFilter);
  const categories = useSelector((state) => state.categories.data);
  const userInfo = useSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    dispatch(fetchCategories()); 
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
               to="/"
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
               to="/"
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
    <Disclosure as="nav" className="bg-yellow-200">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
            </Disclosure.Button>
          </div>
          <div className=" items-center flex-shrink-0 h-32 w-32 sm:block hidden mt-6">
  <img
    alt="Your Company"
    src={logo}
    className="h-full w-full object-contain"
  />
</div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current ? 'bg-green-500 text-white' : 'text-blue-950 hover:bg-green-500 hover:text-white',
                    'rounded-md px-3 py-2 text-sm font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <input
                type="text"
                placeholder="Buscar productos"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
              />
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
              >
                <option value="">Filtrar por categoría</option>
                {categories.map(category => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name_category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Link to="/cart">
              <ShoppingCartIcon aria-hidden="true" className="h-6 w-6 text-blue-950 hover:text-white" />
            </Link>
            <div className="relative ml-3">
              <Menu>
                <Menu.Button className="relative flex rounded-full bg-yellow-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <FiAlignJustify aria-hidden="true" className="h-6 w-6 text-blue-950" />
                </Menu.Button>
                <Menu.Items
                  className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  {renderMenuItems()}
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium'
              )}
            >
              {item.name}
            </Link>
          ))}
          <input
            type="text"
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block px-3 py-2 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="px-3 py-2 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Filtrar por categoría</option>
            {categories.map(category => (
              <option key={category.id_category} value={category.id_category}>
                {category.name_category}
              </option>
            ))}
          </select>
          {/* <select
            value={`${priceFilter.min}-${priceFilter.max}`}
            onChange={handlePriceChange}
            className="px-3 py-2 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Filtrar por precio</option>
            <option value="0-100">0 - 100</option>
            <option value="101-200">101 - 200</option>
            <option value="201-300">201 - 300</option>
           
          </select> */}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}
