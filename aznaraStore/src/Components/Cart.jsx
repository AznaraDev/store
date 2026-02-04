import  { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementQuantity, removeFromCart, clearCart, decrementQuantity, setCartQuantity } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { SlTrash, SlMinus, SlPlus } from "react-icons/sl";
import backgroundImage from '../assets/img/Dama/portadaLogin.png'; // Cambia esta ruta según tu imagen

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const navigate = useNavigate();
console.log(cart)

  const handleIncrementQuantity = (productId) => {
    const item = cart.items.find((it) => it.id_product === productId);
    if (!item) return;
    if (item.quantity + 1 > Number(item.stock)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: `No hay suficiente stock. Solo quedan ${item.stock} unidades.`,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
    dispatch(incrementQuantity(productId));
  };

  const handleDecrementQuantity = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // const handleClearCart = () => {
  //   dispatch(clearCart());
  // };

  const handleCheckout = () => {
    if (!userInfo) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Debes iniciar sesión o registrarte para realizar la compra.',
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      navigate('/checkout');
    }
  };

  // Local quantities + debounce refs
  const [localQuantities, setLocalQuantities] = useState({});
  const timeoutsRef = useRef({});

  useEffect(() => {
    // Initialize local quantities from cart
    const map = {};
    cart.items.forEach((it) => {
      map[it.id_product] = it.quantity;
    });
    setLocalQuantities(map);
  }, [cart.items]);

  return (
    <div className="relative min-h-screen bg-gray-800">
      {/* Imagen de fondo */}
      <img
        src={backgroundImage} // Reemplaza con la ruta de tu imagen
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Contenedor del carrito */}
      <div className="relative flex flex-col justify-center items-center min-h-screen py-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 rounded-lg shadow-lg  lg:p-12 mt-6 w-full max-w-3xl">
          <h1 className="text-2xl text-gray-600 font-thin font-nunito mb-10 text-center">
            PRODUCTOS SELECCIONADOS
          </h1>
          {cart.items.length === 0 ? (
            <p className="text-center text-gray-700 font-nunito font-thin">Tu carrito está vacío.</p>
          ) : (
            <div>
              {cart.items.map((item) => {
                const remaining = Number(item.stock) - item.quantity;
                return (
                  <div key={item.id_product} className="flex items-center justify-between mb-6 border-b pb-4 bg-gray-300 p-6">
                    <div className="flex items-center space-x-4 ">
                      <img src={item.Images[0]?.url} alt={item.name} className="w-28 h-28 object-cover rounded-lg" />
                      <div>
                        <h2 className="text-3xl font-thin font-nunito text-gray-700 uppercase">{item.name}</h2>
                        <p className=" font-nunito font-thin text-2xl text-gray-600">Color: {item.selectedColor}</p>
                        {item.materials && item.materials.length > 0 && (
                          <p className=" font-nunito font-thin text-2xl text-gray-600">Material: {Array.isArray(item.materials) ? item.materials.join(', ') : item.materials}</p>
                        )}
                        <p className=" font-nunito font-thin text-2xl text-gray-600">Talle: {item.selectedSize}</p>
                        <p className=" font-nunito font-thin text-2xl text-gray-600">Precio: ${new Intl.NumberFormat('es-ES').format(item.price)}</p>
                        <div className="flex items-center space-x-2 mt-2 ">
                          <button
                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                            onClick={() => handleDecrementQuantity(item.id_product)}
                          >
                            <SlMinus />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={localQuantities[item.id_product] ?? item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) return;
                              const clamped = Math.max(1, Math.min(val, Number(item.stock)));
                              setLocalQuantities((prev) => ({ ...prev, [item.id_product]: clamped }));

                              // Debounce dispatch per item
                              if (timeoutsRef.current[item.id_product]) {
                                clearTimeout(timeoutsRef.current[item.id_product]);
                              }
                              timeoutsRef.current[item.id_product] = setTimeout(() => {
                                dispatch(setCartQuantity(item.id_product, clamped));
                                delete timeoutsRef.current[item.id_product];
                              }, 600);
                            }}
                            className="w-16 text-center rounded border border-gray-400 bg-white text-gray-700"
                          />
                          <button
                            className={`bg-gray-600 text-white px-3 py-1 rounded ${item.quantity >= Number(item.stock) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                            onClick={() => handleIncrementQuantity(item.id_product)}
                            disabled={item.quantity >= Number(item.stock)}
                            title={item.quantity >= Number(item.stock) ? 'No hay más stock' : `Quedan ${remaining} unidades`}
                          >
                            <SlPlus />
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleRemoveFromCart(item.id_product)}
                          >
                            <SlTrash />
                          </button>
                        </div>

                        {remaining > 0 && remaining <= 3 && (
                          <p className="text-sm text-red-600 mt-2">Últimas {remaining} unidades</p>
                        )}
                        {remaining === 0 && (
                          <p className="text-sm text-red-600 mt-2">Has alcanzado el stock disponible</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center mt-6">
                <p className="text-lg font-thin font-nunito text-gray-700 bg-yellow-600 p-2 rounded">Total:   ${new Intl.NumberFormat('es-ES').format(cart.totalPrice)}</p>
                {/* <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={handleClearCart}
                >
                  <SlTrash />
                </button> */}
              </div>
              <div className="mt-8 flex justify-between">
                <Link to="/products" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 font-nunito font-thin">
                  Seguir Comprando
                </Link>
                <button
                  onClick={handleCheckout}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 font-nunito font-thin"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

