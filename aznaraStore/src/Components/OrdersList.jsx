import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderState } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';
import axios from '../axiosConfig';
import { BASE_URL } from '../Config';

const OrdersList = () => {
  const [filterState, setFilterState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [selectedStates, setSelectedStates] = useState({});
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.ordersGeneral);
  const { userInfo } = useSelector(state => state.userLogin);

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

  const handleDeleteOrder = async (id_orderDetail) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la orden y devolverá el stock. No se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/order/${id_orderDetail}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        
        Swal.fire('Eliminado!', 'La orden ha sido eliminada exitosamente.', 'success');
        dispatch(fetchAllOrders());
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la orden', 'error');
      }
    }
  };

  const handleDeleteProduct = async (id_orderDetail, id_product, productName) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Deseas eliminar "${productName}" de esta orden? Se devolverá el stock.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${BASE_URL}/order/${id_orderDetail}/product/${id_product}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        
        if (response.data.data.orderDeleted) {
          Swal.fire('Eliminado!', 'La orden completa ha sido eliminada al no quedar productos.', 'success');
        } else {
          Swal.fire('Eliminado!', 'El producto ha sido eliminado de la orden.', 'success');
        }
        dispatch(fetchAllOrders());
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el producto', 'error');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filtro por estado
    if (filterState && order.state_order !== filterState) {
      return false;
    }
    
    // Filtro por búsqueda (nombre o documento del cliente)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = order.customer?.name?.toLowerCase() || '';
      const customerDocument = order.customer?.n_document?.toLowerCase() || '';
      
      if (!customerName.includes(searchLower) && !customerDocument.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  // Ordenar por fecha
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (sortOrder === 'desc') {
      return dateB - dateA; // Más recientes primero
    } else {
      return dateA - dateB; // Más antiguos primero
    }
  });

  const handleFilterChange = (e) => {
    setFilterState(e.target.value);
  };

  if (loading) {
    return <p className="text-center mt-4">Cargando órdenes...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">Error al cargar órdenes: {typeof error === 'string' ? error : JSON.stringify(error)}</p>;
  }

  return (
    <div className="bg-colorFooter min-h-screen pt-16 pb-16">
      <div className="container mx-auto px-4 py-8 mt-20">
        <h2 className="text-2xl font-semibold mb-4 font-nunito text-gray-300 bg-colorDetalle p-2 rounded">Lista de Pedidos</h2>
        
        {/* Buscador por cliente */}
        <div className="mb-4">
          <label className="mr-2 text-gray-200 font-nunito font-semibold">Buscar por cliente:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre o documento..."
            className="bg-gray-600 text-gray-200 font-nunito px-3 py-2 rounded w-full md:w-96"
          />
        </div>

        {/* Filtro por estado */}
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

        {/* Ordenar por fecha */}
        <div className="mb-4">
          <label className="mr-2 text-gray-200 font-nunito font-semibold">Ordenar por fecha:</label>
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
            className="bg-gray-600 text-gray-200 font-nunito px-2 py-1 rounded"
          >
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {sortedOrders.map(order => (
            <div key={order.id_orderDetail} className={`border rounded p-4 ${order.state_order === 'Envío Realizado' ? 'bg-green-100' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <div className="font-semibold">Fecha: {order.date}</div>
                <div className="flex gap-2 flex-wrap">
                  <div className="font-semibold bg-gray-700 text-white px-2 py-1 rounded">
                    Estado: {order.state_order}
                  </div>
                  <div className="font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                    {order.payment_method || 'No especificado'}
                  </div>
                  {order.payment_method === 'Pago online (Wompi)' && (
                    <div className={`font-semibold px-2 py-1 rounded ${
                      order.transaction_status === 'Aprobado' ? 'bg-green-600 text-white' :
                      order.transaction_status === 'Pendiente' ? 'bg-yellow-500 text-white' :
                      order.transaction_status === 'Rechazado' || order.transaction_status === 'Fallido' ? 'bg-red-600 text-white' :
                      order.transaction_status === 'Cancelado' ? 'bg-gray-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      Pago: {order.transaction_status || 'Pendiente'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Información del cliente */}
              {order.customer && (
                <div className="mb-2 bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-900">Cliente:</div>
                  <div className="text-sm">Nombre: {order.customer.name}</div>
                  <div className="text-sm">Documento: {order.customer.n_document}</div>
                  {order.customer.email && <div className="text-sm">Email: {order.customer.email}</div>}
                  {order.customer.phone && <div className="text-sm">Teléfono: {order.customer.phone}</div>}
                </div>
              )}
              
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
                      <div key={index} className="flex items-center space-x-4 p-2 bg-white rounded border relative">
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
                        {/* Botón eliminar producto */}
                        <button
                          onClick={() => handleDeleteProduct(order.id_orderDetail, item.id_product, item.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : order.products && order.products.length > 0 ? (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-3">🛍️ Productos del Pedido:</div>
                  <div className="space-y-3">
                    {order.products.map((product) => (
                      <div key={product.id_product} className="flex items-center space-x-4 p-2 bg-white rounded border relative">
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
              
              {/* Botón eliminar orden */}
              <button
                onClick={() => handleDeleteOrder(order.id_orderDetail)}
                className="mt-2 ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-nunito font-semibold"
              >
                🗑️ Eliminar Orden
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;




