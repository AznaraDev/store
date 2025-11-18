import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderState } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';

const OrdersList = () => {
  const [filterState, setFilterState] = useState('');
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [selectedStates, setSelectedStates] = useState({});
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.ordersGeneral);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleUpdateOrderState = (id_orderDetail, newState, trackingNumber) => {
    const validStates = ['Pedido Realizado', 'En Preparación', 'Listo para entregar', 'Envío Realizado', 'Retirado'];
    if (!validStates.includes(newState)) {
      alert('Estado inválido');
      return;
    }

    if (newState === 'Envío Realizado' && !trackingNumber) {
      alert('Por favor, ingrese el número de seguimiento.');
      return;
    }

    dispatch(updateOrderState(id_orderDetail, newState, trackingNumber))
      .then(() => {
        dispatch(fetchAllOrders());
        Swal.fire({
          title: 'Success',
          text: 'Cambio de estado exitoso!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });
  };

  const handleTrackingNumberChange = (id_orderDetail, value) => {
    setTrackingNumbers({
      ...trackingNumbers,
      [id_orderDetail]: value,
    });
  };

  const handleStateChange = (id_orderDetail, newState) => {
    setSelectedStates({
      ...selectedStates,
      [id_orderDetail]: newState,
    });
  };

  const getAvailableStates = (currentState) => {
    const states = ['Pedido Realizado', 'En Preparación', 'Listo para entregar', 'Envío Realizado', 'Retirado'];
    return states.filter(state => state !== currentState);
  };

  const filteredOrders = orders.filter(order => {
    if (!filterState) {
      return true; 
    }
    return order.state_order === filterState; 
  });

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  if (loading) {
    return <p className="text-center mt-4">Cargando órdenes...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">Error al cargar órdenes: {error}</p>;
  }

  return (
    <div className="bg-colorFooter min-h-screen pt-16 pb-16">
      <div className="container mx-auto px-4 py-8 mt-20">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-300 bg-colorDetalle p-2 rounded">Lista de Pedidos</h2>
        <div className="mb-4">
          <label className="mr-2 text-gray-200 font-nunito font-semibold">Filtrar por estado:</label>
          <select
            onChange={handleFilterChange}
            value={filterState}
            className="bg-gray-600 text-gray-200 font-nunito px-2 py-1 rounded"
          >
            <option value="">Todos</option>
            <option value="Pedido Realizado">Pedido Realizado</option>
            <option value="En Preparación">En Preparación</option>
            <option value="Listo para entregar">Listo para entregar</option>
            <option value="Envío Realizado">Envío Realizado</option>
            <option value="Retirado">Retirado</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id_orderDetail} className={`border rounded p-4 ${order.state_order === 'Envío Realizado' ? 'bg-green-100' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Fecha: {order.date}</div>
                <div className="font-semibold bg-gray-700 text-white px-2 py-1 rounded">Estado Pedido: {order.state_order}</div>
              </div>
              <div>Cantidad: {order.quantity}</div>
              <div>Monto: ${new Intl.NumberFormat('es-ES').format(order.amount)}</div>
              <div className="font-semibold">N° Pedido: {order.id_orderDetail}</div>
              
              {/* Información de entrega */}
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">📦 Información de Entrega:</div>
                <div className="font-semibold">Tipo: {order.address}</div>
                
                {order.address === 'Envio a domicilio' ? (
                  <>
                    <div className="mt-2">
                      <strong>Destinatario:</strong> {order.recipient_name || 'No especificado'}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {order.recipient_phone || 'No especificado'}
                    </div>
                    <div>
                      <strong>Ciudad:</strong> {order.city || 'No especificada'}
                    </div>
                    <div>
                      <strong>Dirección:</strong> {order.deliveryAddress || 'No especificada'}
                    </div>
                    {order.postal_code && (
                      <div>
                        <strong>Código Postal:</strong> {order.postal_code}
                      </div>
                    )}
                    {order.delivery_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <strong>Notas:</strong> {order.delivery_notes}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-2 text-green-700 font-semibold">
                    🏪 El cliente retirará en el local
                  </div>
                )}
              </div>

              {/* Productos del pedido */}
              {order.cart_items && order.cart_items.length > 0 ? (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-3">🛍️ Productos del Pedido:</div>
                  <div className="space-y-3">
                    {order.cart_items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-2 bg-white rounded border">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Precio: ${new Intl.NumberFormat('es-ES').format(item.price)}
                          </div>
                          {item.selectedColor && (
                            <div className="text-sm text-gray-600">
                              Color: {item.selectedColor}
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="text-sm text-gray-600">
                              Talle: {item.selectedSize}
                            </div>
                          )}
                          {item.selectedMaterial && (
                            <div className="text-sm text-gray-600">
                              Material: {item.selectedMaterial}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : order.products && order.products.length > 0 ? (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-3">🛍️ Productos del Pedido:</div>
                  <div className="space-y-3">
                    {order.products.map((product) => (
                      <div key={product.id_product} className="flex items-center space-x-4 p-2 bg-white rounded border">
                        {product.Images && product.Images.length > 0 && (
                          <img 
                            src={product.Images[0].url} 
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            Precio: ${new Intl.NumberFormat('es-ES').format(product.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <div className="mt-3">
                <select
                  onChange={(e) => handleStateChange(order.id_orderDetail, e.target.value)}
                  value={selectedStates[order.id_orderDetail] || order.state_order}
                  className="bg-gray-200 text-black px-2 py-1 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                >
                  <option value="" disabled>Selecciona un estado</option>
                  {getAvailableStates(order.state_order).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              {(selectedStates[order.id_orderDetail] === 'Envío Realizado' || order.state_order === 'Envío Realizado') && (
                <div className="mt-2">
                 <input
                  type="text"
                  placeholder="Número de seguimiento"
                  value={trackingNumbers[order.id_orderDetail] || ''}
                  onChange={(e) => handleTrackingNumberChange(order.id_orderDetail, e.target.value)}
                  className="bg-gray-200 text-black px-2 py-1 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                />
                <button
                  onClick={() => handleUpdateOrderState(order.id_orderDetail, 'Envío Realizado', trackingNumbers[order.id_orderDetail])}
                  className="ml-2 bg-yellow-200 text-black px-4 py-2 rounded"
                  disabled={order.state_order === 'Envío Realizado'}
                >
                  {order.state_order === 'Envío Realizado' ? 'Número Enviado' : 'Confirmar Número de Seguimiento'}
                </button>
                </div>
              )}
              <button
                onClick={() => handleUpdateOrderState(order.id_orderDetail, selectedStates[order.id_orderDetail] || order.state_order)}
                className="mt-2 bg-yellow-600 text-gray-800 px-4 py-2 rounded font-nunito font-semibold"
                disabled={order.state_order === 'Envío Realizado'}
              >
                Confirmar Cambio de Estado
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;




