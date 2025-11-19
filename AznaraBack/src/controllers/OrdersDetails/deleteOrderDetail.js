const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    // Devolver stock si la orden no está cancelada
    if (orderDetail.transaction_status !== 'Cancelado' && orderDetail.cart_items && Array.isArray(orderDetail.cart_items)) {
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
              reason: 'Devolución - Orden eliminada',
              performed_by: req.user?.n_document || 'Sistema',
              reference_id: orderDetail.id_orderDetail,
              notes: `Eliminación de orden ${orderDetail.id_orderDetail} - ${item.name || 'Producto'}`
            });
          }
        }
      }
    }

    // Eliminar la orden (soft delete por paranoid: true)
    await orderDetail.destroy();

    return response(res, 200, { 
      message: "Order deleted successfully",
      id_orderDetail 
    });
  } catch (error) {
    console.error("Error deleting order detail:", error);
    return response(res, 500, { error: error.message });
  }
};
