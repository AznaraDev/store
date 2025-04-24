import React, { useEffect, useState, useContext } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Agrega useNavigate para la redirección
import logo from '../assets/img/logoCompleto.png';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchFilteredProducts, setPriceFilter, setCategoryFilter, fetchCategories, logout } from '../Redux/Actions/actions';
//import { SectionContext } from '../SectionContext';
import { useSection } from '../SectionContext';
import { FaInstagram, FaWhatsapp, FaFacebook, FaTiktok } from 'react-icons/fa';

const navigation = [
  { name: 'Tienda', href: '/products', current: true },
  // { name: 'Colecciones', href: '#about', current: false },
  { name: 'Contactanos', href: '#footer', current: false },
  // { name: 'Ofertas', href: '#', current: false },
  
];




function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileContactMenu, setShowMobileContactMenu] = useState(false); // Para móvil
  const { section, setSection } = useSection();
  console.log("Current section in Navbar:", section); 
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const location = useLocation();
  const searchTerm = useSelector(state => state.searchTerm);
  const priceFilter = useSelector(state => state.priceFilter);
  const categoryFilter = useSelector(state => state.categoryFilter);
  const categories = useSelector(state => state.categories.data);
  const userInfo = useSelector(state => state.userLogin.userInfo);
  console.log('User Info:', userInfo);


  useEffect(() => {
    console.log('Current section in Navbar:', section); // Confirmación de carga correcta
  }, [section]);
  
  const publicRoutes = ['/login', '/', '/register', '/products', '/productsCat/:categoryName', '/caballeros', '/cart', '/damas'];
  const handleLogoClick = () => {
    // Limpia la sección al hacer clic en el logo
    setSection(null); // o setSection('') si prefieres una cadena vacía
  };

  useEffect(() => {
    const currentPath = window.location.pathname;

  
    let isPublicRoute = publicRoutes.some(route => {
   
      const routeRegex = new RegExp(`^${route.replace(':categoryName', '[^/]+').replace(':id', '\\d+')}$`);
      return routeRegex.test(currentPath);
    });

   
    if (currentPath.startsWith('/product/')) {
      isPublicRoute = true;
    }

  
    if (!userInfo && !isPublicRoute) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

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


  

  const isHomePage = location.pathname === '/';

  // --- Lógica de Estilos Refinada ---
  let navbarBackgroundClass = '';
  // Texto siempre blanco
  const navbarTextColorClass = 'text-white';
  const navbarHoverTextColorClass = 'hover:text-gray-400'; // O 'hover:opacity-80' si prefieres

  if (isTransparent) {
    navbarBackgroundClass = 'bg-transparent';
  } else if (section === 'Dama') {
    // Si no es transparente y es Dama -> fondo women
    navbarBackgroundClass = 'bg-women';
  } else {
    // Si no es transparente y es Home, Caballero u otra -> fondo negro
    navbarBackgroundClass = 'bg-black';
  }
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
                to="/header"
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
    } else if (userInfo.role === 'Admin' || userInfo.role === 'comercio') {
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
    <Disclosure
      as="nav"
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${navbarBackgroundClass}`}
    >
      {({ open, close }) => ( // Añadir 'close' si quieres cerrar el panel al hacer clic en un enlace
        <>
          {/* ... (Navbar para escritorio sin cambios) ... */}
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" onClick={handleLogoClick}>
                  <img
                    alt="AZNARA Store"
                    src={logo}
                    className="h-14 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Enlaces de navegación para pantallas grandes */}
              <div className="hidden sm:flex flex-1 justify-start ml-10 space-x-8 font-nunito font-thin text 3xl">
                {navigation.map((item) => (
                  <div key={item.name} className="relative"> {/* Añadido relative aquí */}
                    {item.name === 'Contactanos' ? (
                      <> {/* Fragmento para agrupar botón y menú */}
                        <button
                          onClick={() => setShowMenu(!showMenu)} // Toggle para el menú de redes
                          className={`text-2xl font-thin ${navbarTextColorClass} ${navbarHoverTextColorClass}`}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </button>
                        {/* --- Menú Desplegable de Redes Sociales --- */}
                        {showMenu && (
                          <div className="absolute left-0 mt-2 w-48 py-2 bg-white/60 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <a
                              href="https://www.instagram.com/aznara.store?igsh=a2lucDlpd3JyMTF0" // Reemplaza con tu URL
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaInstagram className="mr-2" /> Instagram Caballero
                            </a>
                            <a
                              href="https://www.instagram.com/aznara_woman?igsh=MWI2anc2Z3Zsdnl2ZQ==" // Reemplaza con tu URL
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaInstagram className="mr-2" /> Instagram Dama
                            </a>
                            <a
                              href="https://wa.me/573203679240" // Reemplaza con tu número de WhatsApp
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaWhatsapp className="mr-2" /> WhatsApp
                            </a>
                            <a
                              href="https://l.instagram.com/?u=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AuABpUPUV%2F%3Fmibextid%3DwwXIfr&e=AT0pQY4foVPG0sPjUwbEmSrW3SACPfaaGAAfzZQ-xRyhciR_OJprG7L7rnxNYXs7KkiRhqiK9mJSDlwYElsWaSPr7xPdkYgQdPtrKQ" // Reemplaza con tu URL
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaFacebook className="mr-2" /> Facebook
                            </a>
                            <a
                              href="https://www.tiktok.com/@aznara.store?_t=ZS-8voIkkib1mB&_r=1" // Reemplaza con tu URL de TikTok
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaTiktok className="mr-2" /> TikTok Caballero
                            </a>
                            <a
                              href="https://www.tiktok.com/@aznara.woman?_t=ZS-8voIp4syg2k&_r=1" // Reemplaza con tu URL de TikTok
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaTiktok className="mr-2" /> TikTok Dama
                            </a>
                          </div>
                        )}
                        {/* --- Fin Menú Desplegable --- */}
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        // Aplicar color de texto y hover fijos (blanco)
                        className={`text-2xl font-thin ${navbarTextColorClass} ${item.current ? 'opacity-75' : ''} ${navbarHoverTextColorClass}`}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    )}
                    {/* ... (menú desplegable de Contactanos si existe) ... */}
                  </div>
                ))}
              </div>

              {/* Iconos de carrito y menú */}
              <div className="flex items-center font-nunito font-light space-x-4">
                <Link
                  to="/cart"
                  // Aplicar color de texto y hover fijos (blanco)
                  className={`relative p-2 ${navbarTextColorClass} ${navbarHoverTextColorClass}`}
                >
                  <ShoppingBagIcon className="h-6 w-6 sm:h-6 sm:w-6" aria-hidden="true" />
                </Link>

                {/* User dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button
                    // Aplicar color de texto fijo (blanco)
                    className={`bg-transparent px-3 py-2 rounded-md text-2xl font-thin ${navbarTextColorClass}`}
                  >
                    Menu
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 py-1 bg-white/60 text-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    {renderMenuItems()}
                  </Menu.Items>
                </Menu>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex sm:hidden">
                <Disclosure.Button
                  // Botón móvil siempre blanco
                  className={`inline-flex items-center justify-center rounded-md p-2 ${navbarTextColorClass} hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
                >
                  <span className="sr-only">Abrir menú</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>


          {/* Mobile navigation */}
          <Disclosure.Panel className="sm:hidden bg-gray-800/60">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) =>
                item.name === 'Contactanos' ? (
                  // --- Sección Contactanos Móvil ---
                  <div key={item.name}>
                    <button
                      onClick={() => setShowMobileContactMenu(!showMobileContactMenu)}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </button>
                    {showMobileContactMenu && (
                      <div className="pl-4 mt-1 space-y-1"> {/* Indentación para submenú */}
                        <a
                          href="https://www.instagram.com/aznara.store?igsh=a2lucDlpd3JyMTF0" // Reemplaza con tu URL
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                          // onClick={() => close()} // Opcional: cerrar panel al hacer clic
                        >
                          <FaInstagram className="mr-2" /> Instagram Caballero
                        </a>
                        <a
                              href="https://www.instagram.com/aznara_woman?igsh=MWI2anc2Z3Zsdnl2ZQ==" // Reemplaza con tu URL
                              target="_blank"
                              rel="noopener noreferrer"
                             className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              <FaInstagram className="mr-2" /> Instagram Dama
                            </a>
                        <a
                          href="https://wa.me/573203679240" // Reemplaza con tu número
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                          // onClick={() => close()}
                        >
                          <FaWhatsapp className="mr-2" /> WhatsApp
                        </a>
                        <a
                          href="https://l.instagram.com/?u=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AuABpUPUV%2F%3Fmibextid%3DwwXIfr&e=AT0pQY4foVPG0sPjUwbEmSrW3SACPfaaGAAfzZQ-xRyhciR_OJprG7L7rnxNYXs7KkiRhqiK9mJSDlwYElsWaSPr7xPdkYgQdPtrKQ" // Reemplaza con tu URL
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                          // onClick={() => close()}
                        >
                          <FaFacebook className="mr-2" /> Facebook
                        </a>
                        <a
                              href="https://www.tiktok.com/@aznara.store?_t=ZS-8voIkkib1mB&_r=1" // Reemplaza con tu URL de TikTok
                              target="_blank"
                              rel="noopener noreferrer"
                               className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              <FaTiktok className="mr-2" /> TikTok Caballero
                            </a>
                            <a
                              href="https://www.tiktok.com/@aznara.woman?_t=ZS-8voIp4syg2k&_r=1" // Reemplaza con tu URL de TikTok
                              target="_blank"
                              rel="noopener noreferrer"
                               className="flex items-center px-3 py-2 rounded-md text-sm font-thin font-nunito text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              <FaTiktok className="mr-2" /> TikTok Dama
                            </a>
                      </div>
                    )}
                  </div>
                ) : (
                  // --- Otros Items de Navegación Móvil ---
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-thin font-nunito ${
                      item.current
                        ? 'bg-gray-900 text-white font-thin font-nunito'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white font-thin font-nunito'
                    }`}
                    onClick={() => close()} // Cierra el panel al navegar
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              )}
              {/* Separador y enlaces del menú desplegable (Login/Perfil) para móvil */}
              <div className="border-t border-gray-700 pt-4 mt-4 pb-3"> {/* Añadido mt-4 */}
                 {/* Renderiza los mismos items que el menú desplegable de escritorio pero con estilo móvil */}
                 {!userInfo ? (
                   <>
                     <Disclosure.Button as={Link} to="/login" onClick={() => close()} className="block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Ingresar</Disclosure.Button>
                     <Disclosure.Button as={Link} to="/register" onClick={() => close()} className="block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Registrarse</Disclosure.Button>
                   </>
                 ) : userInfo.role === 'User' ? (
                   <>
                      <Disclosure.Button as={Link} to={`/myOrders/${userInfo.n_document}`} onClick={() => close()} className="block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Mis Pedidos</Disclosure.Button>
                      <Disclosure.Button as="button" onClick={() => { handleLogout(); close(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Salir</Disclosure.Button>
                   </>
                 ) : ( // Admin o comercio
                   <>
                     <Disclosure.Button as={Link} to="/allOrders" onClick={() => close()} className="block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Pedidos</Disclosure.Button>
                     <Disclosure.Button as={Link} to="/createProducts" onClick={() => close()} className="block px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Crear Productos</Disclosure.Button>
                     {/* ... otros enlaces de admin ... */}
                     <Disclosure.Button as="button" onClick={() => { handleLogout(); close(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-thin font-nunito text-gray-300 hover:bg-gray-700 hover:text-white">Salir</Disclosure.Button>
                   </>
                 )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}