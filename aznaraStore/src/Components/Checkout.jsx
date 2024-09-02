import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, clearOrderState, fetchLatestOrder} from '../Redux/Actions/actions';
import Swal from 'sweetalert2';



const Checkout = () => {
  const [address, setAddress] = useState('Retira en local');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
 const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const cart = useSelector((state) => state.cart);
  const orderCreate = useSelector((state) => state.order);
  const latestOrder = useSelector((state) => state.latestOrder);
 
 const [orderData, setOrderData] = useState({
  date: new Date().toISOString().split('T')[0],
  amount: cart.totalPrice,
  quantity: cart.totalItems,
  state_order: 'Pedido Realizado',
  n_document: userInfo ? userInfo.n_document : '',
  id_product: cart.items.map(item => item.id_product),
  address,
  deliveryAddress: address === 'Envio a domicilio' ? deliveryAddress : null,
  });
 
 useEffect(() => {
  if (orderCreate.success) {
  dispatch(fetchLatestOrder());
  Swal.fire({
  title: 'Success',
  text: '¡Compra exitosa!',
  icon: 'success',
  confirmButtonText: 'OK'
  }).then(() => {
  dispatch(clearOrderState());
  setOrderData({
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  quantity: 0,
  state_order: 'Pedido Realizado',
  n_document: '',
  id_product: [],
  address: 'Retira en local',
  deliveryAddress: null,
  });
  });
  }
  }, [orderCreate.success, dispatch]);
 
  useEffect(() => {
    if (latestOrder.success) {
    const { amount, id_orderDetail } = latestOrder.data.orderDetail;
    const checkout = new WidgetCheckout({
    currency: 'COP',
    amountInCents: amount * 100, 
    reference: String(id_orderDetail), 
    publicKey: 'pub_test_udFLMPgs8mDyKqs5bRCWhpwDhj2rGgFw',
    redirectUrl: 'http://localhost:5173/pago', 
    integritySignature: latestOrder.data.integritySignature 
   
    });
   
   checkout.open((result) => {
    const transaction = result.transaction;
    if (transaction.status === 'APPROVED') {
    Swal.fire('Success', 'Payment successful', 'success');
    } else {
    Swal.fire('Error', 'Payment failed', 'error');
    }
    });
    }
   }, [latestOrder]);
 
 useEffect(() => {
  setOrderData((prevData) => ({
  ... prevData,
  id_product: cart.items.map(item => item.id_product),
  amount: cart.totalPrice,
  quantity: cart.totalItems,
  }));
  }, [cart]);
 
 useEffect(() => {
  setOrderData((prevData) => ({
  ... prevData,
  address,
  deliveryAddress: address === 'Envio a domicilio' ? deliveryAddress : null,
  }));
  }, [address, deliveryAddress]);
 
 const handleAddressChange = (e) => {
  setAddress(e.target.value);
  };
 
 const handleDeliveryAddressChange = (e) => {
  setDeliveryAddress(e.target.value);
  };
 
 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setOrderData((prevData) => ({
  ... prevData,
  [name]: value,
  }));
  };
 
 const handleSubmit = (e) => {
  e.preventDefault();
  dispatch(createOrder(orderData));
  };
  return (
    
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center"  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, color: 'rgb(34, 197, 94)' }}>Finalizar Compra</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
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
          <label className="block text-sm font-medium text-gray-700">Tipo de entrega:</label>
          <select
            id="address"
            value={address}
            onChange={handleAddressChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="Retira en local">Retira en local</option>
            <option value="Envio a domicilio">Envio a domicilio</option>
          </select>
        </div>
        {address === 'Envio a domicilio' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Dirección de envío:</label>
            <input
              id="deliveryAddress"
              type="text"
              value={deliveryAddress}
              onChange={handleDeliveryAddressChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2"  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, color: 'rgb(34, 197, 94)' }}>Resumen del Pedido</h3>
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.id_product} className="py-2">
                <div className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.quantity} x ${item.price}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4">
            <span>Cantidad:</span>
            <span>{cart.totalItems}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Total:</span>
            <span>${cart.totalPrice}</span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          disabled={orderCreate.loading}
        >
          {orderCreate.loading ? 'Procesando...' : 'Finalizar Compra'}
        </button>
        {orderCreate.error && <div className="text-red-500 mt-2">{orderCreate.error}</div>}
      </form>
    </div>
  );
};

export default Checkout;

