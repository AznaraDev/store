const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;
  const { state_order, trackingNumber, transaction_status } = req.body;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    // Verificar si el valor del estado de la orden es válido
    const validStatesOrder = [
      "Pedido Realizado",
      "En Preparación",
      "Listo para entregar",
      "Envío Realizado",
      "Retirado",
    ];
    if (state_order && !validStatesOrder.includes(state_order)) {
      return response(res, 400, { error: "Invalid state_order value" });
    }

    const validTransactionStates = [
      "Pendiente",
      "Aprobado",
      "Rechazado",
      "Fallido",
      "Cancelado",
    ];
    if (
      transaction_status &&
      !validTransactionStates.includes(transaction_status)
    ) {
      return response(res, 400, { error: "Invalid transaction_status value" });
    }

    // Guardar el estado anterior de la transacción
    const previousTransactionStatus = orderDetail.transaction_status;
    
    // Devolver stock si el pedido se cancela
    if (transaction_status === 'Cancelado' && previousTransactionStatus !== 'Cancelado') {
      // Procesar devolución de stock si hay cart_items
      if (orderDetail.cart_items && Array.isArray(orderDetail.cart_items) && orderDetail.cart_items.length > 0) {
        for (const item of orderDetail.cart_items) {
          if (item.id_product && item.quantity) {
            const product = await Product.findByPk(item.id_product);
            
            if (product) {
              const previousStock = product.stock || 0;
              const quantityToReturn = parseInt(item.quantity);
              const newStock = previousStock + quantityToReturn;
              
              // Actualizar stock del producto
              await product.update({ stock: newStock });
              
              // Registrar movimiento de stock
              await StockMovement.create({
                id_product: item.id_product,
                movement_type: 'devolucion',
                quantity: quantityToReturn,
                previous_stock: previousStock,
                new_stock: newStock,
                reason: 'Devolución - Pedido cancelado',
                performed_by: req.user?.n_document || 'Sistema',
                reference_id: orderDetail.id_orderDetail,
                notes: `Cancelación de pedido ${orderDetail.id_orderDetail} - ${item.name || 'Producto'}`
              });
              
              console.log(`Stock devuelto: ${item.name}, cantidad: ${quantityToReturn}, nuevo stock: ${newStock}`);
            }
          }
        }
      }
    }
    
    if (state_order) {
      orderDetail.state_order = state_order;
    }

   
    if (trackingNumber) {
      orderDetail.trackingNumber = trackingNumber;
    }

    
    if (transaction_status) {
      orderDetail.transaction_status = transaction_status;
    }

    
    await orderDetail.save();

    return response(res, 200, { orderDetail });
  } catch (error) {
    console.error("Error updating order detail:", error);
    return response(res, 500, { error: error.message });
  }
};

