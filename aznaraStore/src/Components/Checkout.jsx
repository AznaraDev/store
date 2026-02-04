import  { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createOrder,
  clearOrderState,
  fetchLatestOrder,
} from "../Redux/Actions/actions";
import Swal from "sweetalert2";
import imgFondo from '../assets/img/banner.png'

const Checkout = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [address, setAddress] = useState("Envio a domicilio");
  const [paymentMethod, setPaymentMethod] = useState("Pago contra entrega");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const cart = useSelector((state) => state.cart);
  const orderCreate = useSelector((state) => state.order);
  const latestOrder = useSelector((state) => state.latestOrder);

  const [orderData, setOrderData] = useState({
    date: currentDate,
    amount: cart.totalPrice,
    quantity: cart.totalItems,
    state_order: "Pedido Realizado",
    n_document: userInfo ? userInfo.n_document : "",
    id_product: cart.items.map((item) => item.id_product),
    cart_items: cart.items,
    address,
    payment_method: paymentMethod,
    deliveryAddress: address === "Envio a domicilio" ? deliveryAddress : null,
    recipient_name: address === "Envio a domicilio" ? recipientName : null,
    recipient_phone: address === "Envio a domicilio" ? recipientPhone : null,
    city: address === "Envio a domicilio" ? city : null,
    postal_code: address === "Envio a domicilio" ? postalCode : null,
    delivery_notes: address === "Envio a domicilio" ? deliveryNotes : null,
  });

  // Manejar creación de orden exitosa
  useEffect(() => {
    if (orderCreate.success && !orderCreate.loading && !orderCreate.error) {
      dispatch(fetchLatestOrder());
      
      // NO mostrar mensaje de éxito aún si es pago con Wompi
      // Solo mostrar para pagos locales o contra entrega
      if (orderData.payment_method !== "Pago online (Wompi)") {
        Swal.fire({
          title: "Success",
          text: "¡Compra exitosa!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          dispatch(clearOrderState());
          // Restablecer datos de la orden
          setOrderData({
            date: currentDate,
            amount: 0,
            quantity: 0,
            state_order: "Pedido Realizado",
            n_document: "",
            id_product: [],
            address: "Envio a domicilio",
            deliveryAddress: null,
          });
         
          navigate("/gracias");
        });
      }
    }
  }, [orderCreate.success, dispatch, navigate, orderData.payment_method, currentDate]);

  // Manejar el widget de Wompi después de la creación de la orden
  useEffect(() => {
    if (latestOrder.success && !latestOrder.loading && !latestOrder.error) {
      const { amount, id_orderDetail, payment_method } = latestOrder.data.orderDetail;
      
      console.log('📦 latestOrder data:', latestOrder.data);
      console.log('💳 payment_method:', payment_method);
      
      // Solo abrir Wompi si eligió pago online
      if (payment_method === "Pago online (Wompi)") {
        console.log('🚀 Abriendo widget de Wompi...');
        
        const checkout = new window.WidgetCheckout({
          currency: "COP",
          amountInCents: amount * 100,
          reference: String(id_orderDetail),
          publicKey: "pub_test_udFLMPgs8mDyKqs5bRCWhpwDhj2rGgFw",
          redirectUrl: "http://localhost:5173/gracias",
          integritySignature: latestOrder.data.integritySignature,
        });
        
        console.log('✅ Widget configurado:', checkout);

        checkout.open((result) => {
          console.log('💰 Resultado del pago:', result);
          const transaction = result.transaction;
          
          if (transaction.status === "APPROVED") {
            Swal.fire({
              title: "Success",
              text: "¡Pago exitoso!",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              dispatch(clearOrderState());
              setOrderData({
                date: currentDate,
                amount: 0,
                quantity: 0,
                state_order: "Pedido Realizado",
                n_document: "",
                id_product: [],
                address: "Envio a domicilio",
                deliveryAddress: null,
              });
              navigate("/gracias");
            });
          } else {
            Swal.fire({
              title: "Error",
              text: `Pago ${transaction.status}. Por favor intenta de nuevo.`,
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        });
      } else {
        // Si es pago en local o contra entrega, no abrir widget
        console.log(`✅ Orden creada con: ${payment_method} - no requiere Wompi widget`);
      }
    }
  }, [latestOrder, dispatch, navigate, currentDate]);

  // Actualizar datos de la orden cuando cambian los artículos del carrito
  useEffect(() => {
    setOrderData((prevData) => ({
      ...prevData,
      id_product: cart.items.map((item) => item.id_product),
      cart_items: cart.items,
      amount: cart.totalPrice,
      quantity: cart.totalItems,
    }));
  }, [cart]);

  // Actualizar dirección de entrega y datos de envío
  useEffect(() => {
    setOrderData((prevData) => ({
      ...prevData,
      address,
      payment_method: paymentMethod,
      cart_items: cart.items,
      deliveryAddress: address === "Envio a domicilio" ? deliveryAddress : null,
      recipient_name: address === "Envio a domicilio" ? recipientName : null,
      recipient_phone: address === "Envio a domicilio" ? recipientPhone : null,
      city: address === "Envio a domicilio" ? city : null,
      postal_code: address === "Envio a domicilio" ? postalCode : null,
      delivery_notes: address === "Envio a domicilio" ? deliveryNotes : null,
    }));
  }, [address, paymentMethod, deliveryAddress, recipientName, recipientPhone, city, postalCode, deliveryNotes, cart.items]);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Cambiar automáticamente el método de pago según la dirección
    if (newAddress === "Retira en local") {
      setPaymentMethod("Pago en local");
    } else {
      // Por defecto, pago contra entrega para envíos
      setPaymentMethod("Pago contra entrega");
    }
  };

  const handleDeliveryAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar dirección de entrega si es necesario
    if (address === "Envio a domicilio") {
      if (!deliveryAddress) {
        Swal.fire("Error", "Por favor ingresa la dirección de envío", "error");
        return;
      }
      if (!recipientName) {
        Swal.fire("Error", "Por favor ingresa el nombre del destinatario", "error");
        return;
      }
      if (!recipientPhone) {
        Swal.fire("Error", "Por favor ingresa el teléfono del destinatario", "error");
        return;
      }
      if (!city) {
        Swal.fire("Error", "Por favor ingresa la ciudad", "error");
        return;
      }
    }
    dispatch(createOrder(orderData));
  };

  return (
    <div 
    className="min-h-screen flex justify-center items-center bg-cover bg-center px-4" 
    style={{ backgroundImage: `url(${imgFondo})`, paddingTop: '4rem' }}  // Ajustar el padding si el navbar es fijo
  >
    <div className="max-w-lg w-full mx-auto p-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold font-nunito mb-4 text-center">
        Finalizar Compra
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold font-nunito text-gray-700">Fecha</label>
          <input
            type="date"
            name="date"
            value={orderData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold font-nunito text-gray-700">
            Tipo de entrega:
          </label>
          <select
            id="address"
            value={address}
            onChange={handleAddressChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
             <option value="Envio a domicilio">Envio a domicilio</option>
            <option value="Retira en local">Retira en local</option>
           
          </select>
        </div>
        
        {/* Método de pago */}
        <div className="mb-4">
          <label className="block text-sm font-semibold font-nunito text-gray-700">
            Método de pago:
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            {address === "Retira en local" ? (
              <option value="Pago en local">Pago en local</option>
            ) : (
              <>
                <option value="Pago contra entrega">Pago contra entrega</option>
                <option value="Pago online (Wompi)">Pago online (Wompi)</option>
              </>
            )}
          </select>
        </div>
        
        {address === "Envio a domicilio" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Nombre completo del destinatario: *
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Teléfono de contacto: *
              </label>
              <input
                id="recipientPhone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Ciudad: *
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Dirección de envío: *
              </label>
              <input
                id="deliveryAddress"
                type="text"
                value={deliveryAddress}
                onChange={handleDeliveryAddressChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Calle, número, apto/oficina"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Código postal (opcional):
              </label>
              <input
                id="postalCode"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-nunito font-semibold text-gray-700">
                Notas adicionales (opcional):
              </label>
              <textarea
                id="deliveryNotes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Referencias, instrucciones especiales..."
              />
            </div>
          </>
        )}
        <div className="mb-4">
          <h3
            className="text-xl font-semibold font-nunito mb-2"
         
          >
            Resumen del Pedido
          </h3>
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.id_product} className="py-2">
                <div className="flex justify-between uppercase">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x ${item.price}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4 uppercase">
            <span>Cantidad:</span>
            <span>{cart.totalItems}</span>
          </div>
          <div className="flex justify-between mt-2 uppercase">
            <span>Total:</span>
            <span>${cart.totalPrice}</span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-colorLogo"
          disabled={orderCreate.loading}
        >
          {orderCreate.loading ? "Procesando..." : "Finalizar Compra"}
        </button>
        {orderCreate.error && (
          <div className="text-red-500 mt-2">{orderCreate.error}</div>
        )}
      </form>
    </div>
  </div>
  );
};

export default Checkout;

