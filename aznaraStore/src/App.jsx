
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
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
import Footer from "./Components/Footer";
import WhatsAppButton from "./Components/WhatsappButton";
import Landing from "./Components/Landing";
import CardsAnimated from "./Components/CardsAnimated";
import ThankYouPage from "./Components/ThankYouPage";
import FilteredProducts from "./Components/Product/FilteredProducts";


  function App() {
    return (
      <Router>
        <div>
         <Navbar/>
          <Routes>
        
            <Route exact path="/register" element={<Register/>}/>
            <Route exact path="/login" element={<Login/>}/>
            <Route exact path="/products" element={<ProductsList />} />
            <Route exact path="/" element={<Landing />} />
            <Route exact path="/" element={<ProductsList />} />
            <Route exact path="/cardsanimated" element={<CardsAnimated />} />
            <Route exact path="/product/:id" element={<ProductDetails />} />
            <Route exact path="/myOrders/:n_document" element={<OrdersDetails />} />
            <Route exact path="/allOrders" element={<OrdersList/>}/>
            <Route exact path="/createProducts" element={<CreateProduct />} />
            <Route exact path="/cart" element={<Cart />} />
            <Route exact path="/checkout" element={<Checkout />} />  
            <Route exact path="/gracias" element={<ThankYouPage />} /> 
            <Route path="/updateProduct/:id" element={<UpdateProduct />} /> 
            <Route path="/category" element={<CreateCategory/>}/>  
            <Route path="/productsCat/:categoryName" element={<FilteredProducts />} />     
          </Routes>
        </div>
        <Footer/>
        <WhatsAppButton /> 
      </Router>
    );
  }
export default App
