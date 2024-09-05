import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementQuantity, removeFromCart, clearCart, decrementQuantity } from '../Redux/Actions/actions';
import { Link, useNavigate } from 'react-router-dom';
import { SlTrash, SlMinus, SlPlus } from "react-icons/sl";

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const navigate = useNavigate();

  const handleIncrementQuantity = (productId) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecrementQuantity = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    if (!userInfo) {
      alert('Debes iniciar sesión o registrarte para realizar la compra.');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-colorFooter flex flex-col justify-between pt-16 pb-16">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl text-gray-200 font-bold font-nunito mt-12 mb-10 text-center" >
          PRODUCTOS SELECCIONADOS
        </h1>
        {cart.items.length === 0 ? (
          <p className="text-center text-white font-nunito font-semibold">Tu carrito está vacío.</p>
        ) : (
          <div>
            {cart.items.map((item) => (
              <div key={item.id_product} className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center space-x-4">
                  <img src={item.Images[0]?.url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p>Precio: ${item.price}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700"
                        onClick={() => handleIncrementQuantity(item.id_product)}
                      >
                        <SlPlus />
                      </button>
                      <span className="text-lg">{item.quantity}</span>
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700"
                        onClick={() => handleDecrementQuantity(item.id_product)}
                      >
                        <SlMinus />
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleRemoveFromCart(item.id_product)}
                      >
                        <SlTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-6">
              <p className="text-lg font-semibold">Total: ${cart.totalPrice}</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleClearCart}
              >
                <SlTrash />
              </button>
            </div>
            <div className="mt-8 flex justify-between">
              <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">
                Seguir Comprando
              </Link>
              <button
                onClick={handleCheckout}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
