
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import CreateProduct from "./Components/Product/CreateProduct"
import ProductsList from "./Components/Product/ProducstList";
import ProductDetails from "./Components/Product/ProductDetails";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import Navbar from "./Components/Navbar";
import Register from "./Components/Users/Register";
import Login from "./Components/Users/Login";
import OrdersDetails from "./Components/OrdersDetail";
import OrdersList from "./Components/OrdersList";
import UpdateProduct from "./Components/Product/UpdateProduct";
import CreateCategory from "./Components/Product/CreateCategory";
import CreateSB from "./Components/Product/CreateSB";
import Footer from "./Components/Footer";
import CartButton from "./Components/CartButton";
import Landing from "./Components/Landing";
import CardsAnimated from "./Components/CardsAnimated";
import ThankYouPage from "./Components/ThankYouPage";
import FilteredProducts from "./Components/Product/FilteredProducts";
import PrivateRoute from './Components/PrivateRoute';
import LandingPrincipal from "./Components/LandingPrincipal";
import WhatsappButton from "./Components/WhatsappButton";
import LandingDama from "./Components/Dama/LandingDama";
import { SectionProvider } from "./SectionContext";

// Importar componentes Taxxa
import PanelTaxxa from "./Components/Taxxa/PanelTaxxa";
import FacturasPendientes from "./Components/Taxxa/FacturasPendientes";
import InvoiceList from "./Components/Taxxa/InvoiceList";
import FacturaManual from "./Components/Taxxa/FacturaManual";
import SellerSetting from "./Components/Taxxa/SellerSetting";
import TaxxaTestComponent from "./Components/Taxxa/TaxxaTestComponent";

// Importar componentes Dashboard Admin
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import AdminDashboard from "./Components/Dashboard/AdminDashboard";
import ProductsDashboard from "./Components/Dashboard/ProductsDashboard";
import CustomersList from "./Components/Dashboard/CustomersList";
import CategoriesManager from "./Components/Dashboard/CategoriesManager";
import StockManagement from "./Components/stock/StockManagement";

  function App() {
    return (
      <SectionProvider>
      <Router>
        <AppContent />
      </Router>
      </SectionProvider>
    );
  }

  function AppContent() {
    const location = useLocation();
    const isDashboardRoute = location.pathname.startsWith('/admin') || 
                             location.pathname.startsWith('/taxxa') || 
                             location.pathname === '/allOrders' ||
                             location.pathname === '/createProducts' ||
                             location.pathname === '/pendientInvoices' ||
                             location.pathname === '/invoices' ||
                             location.pathname === '/manual-invoice' ||
                             location.pathname === '/seller-settings' ||
                             location.pathname === '/register';
    
    return (
      <div>
       <Navbar/>
         
          <Routes>
          <Route path="/" element={<LandingPrincipal />} />
            <Route exact path="/register" element={<Register/>}/>
            <Route exact path="/login" element={<Login/>}/>
            <Route exact path="/products" element={<ProductsList />} />
            <Route exact path="/caballeros" element={<Landing />} />
            <Route exact path="/damas" element={<LandingDama />} />
            <Route exact path="/caballerosList" element={<ProductsList />} />
            <Route exact path="/cardsanimated" element={<CardsAnimated />} />
            <Route exact path="/product/:id" element={<ProductDetails />} />
            <Route exact path="/myOrders/:n_document" element={ <PrivateRoute>
              <OrdersDetails />
            </PrivateRoute>} />
            <Route exact path="/allOrders" element={ <PrivateRoute>
              <OrdersList/>
            </PrivateRoute>}/>
            <Route exact path="/createProducts" element={<PrivateRoute>
              <CreateProduct />
            </PrivateRoute>} />
            <Route exact path="/cart" element={<Cart />} />
            <Route exact path="/checkout" element={<Checkout />} />  
            <Route exact path="/gracias" element={<ThankYouPage />} /> 
            <Route path="/updateProduct/:id" element={<PrivateRoute>
              <UpdateProduct />
            </PrivateRoute>} /> 
            <Route path="/category" element={<CreateCategory/>}/>  
            <Route path="/sb" element={<CreateSB/>}/>  
            <Route path="/productsCat/:categoryName" element={<FilteredProducts />} />     
            
            {/* Rutas Admin Panel - Sistema Unificado */}
            <Route path="/admin" element={<PrivateRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </PrivateRoute>} />
            <Route path="/admin/products" element={<PrivateRoute>
              <DashboardLayout>
                <ProductsDashboard />
              </DashboardLayout>
            </PrivateRoute>} />
            <Route path="/admin/stock" element={<PrivateRoute>
              <StockManagement />
            </PrivateRoute>} />
            <Route path="/admin/customers" element={<PrivateRoute>
              <DashboardLayout>
                <CustomersList />
              </DashboardLayout>
            </PrivateRoute>} />
            <Route path="/admin/categories" element={<PrivateRoute>
              <DashboardLayout>
                <CategoriesManager />
              </DashboardLayout>
            </PrivateRoute>} />
            
            {/* Rutas Taxxa - Sistema de Facturación */}
            <Route path="/taxxa" element={<PrivateRoute><PanelTaxxa /></PrivateRoute>} />
            <Route path="/pendientInvoices" element={<PrivateRoute><FacturasPendientes /></PrivateRoute>} />
            <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
            <Route path="/manual-invoice" element={<PrivateRoute><FacturaManual /></PrivateRoute>} />
            <Route path="/seller-settings" element={<PrivateRoute><SellerSetting /></PrivateRoute>} />
            <Route path="/taxxa-test" element={<PrivateRoute><TaxxaTestComponent /></PrivateRoute>} />
          </Routes>
        
        {!isDashboardRoute && <Footer/>}
        <CartButton /> 
        <WhatsappButton/>
      </div>
    );
  }
export default App
