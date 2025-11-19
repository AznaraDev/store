const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  const { id_orderDetail, id_product } = req.params;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    if (!orderDetail.cart_items || !Array.isArray(orderDetail.cart_items)) {
      return response(res, 400, { error: "No cart items found in this order" });
    }

    // Buscar el producto en el carrito
    const itemIndex = orderDetail.cart_items.findIndex(item => item.id_product === id_product);
    
    if (itemIndex === -1) {
      return response(res, 404, { error: "Product not found in this order" });
    }

    const removedItem = orderDetail.cart_items[itemIndex];

    // Devolver stock si la orden no está cancelada
    if (orderDetail.transaction_status !== 'Cancelado') {
      const product = await Product.findByPk(id_product);
      
      if (product) {
        const previousStock = product.stock || 0;
        const quantityToReturn = parseInt(removedItem.quantity);
        const newStock = previousStock + quantityToReturn;
        
        // Actualizar stock del producto
        await product.update({ stock: newStock });
        
        // Registrar movimiento de stock
        await StockMovement.create({
          id_product: id_product,
          movement_type: 'devolucion',
          quantity: quantityToReturn,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: 'Devolución - Producto eliminado de orden',
          performed_by: req.user?.n_document || 'Sistema',
          reference_id: orderDetail.id_orderDetail,
          notes: `Eliminación de producto de orden ${orderDetail.id_orderDetail} - ${removedItem.name || 'Producto'}`
        });
      }
    }

    // Remover el producto del carrito
    const updatedCartItems = orderDetail.cart_items.filter((_, index) => index !== itemIndex);
    
    // Recalcular el monto y cantidad total
    const newAmount = updatedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newQuantity = updatedCartItems.reduce((sum, item) => sum + parseInt(item.quantity), 0);

    // Si no quedan productos, eliminar la orden completa
    if (updatedCartItems.length === 0) {
      await orderDetail.destroy();
      return response(res, 200, { 
        message: "Product removed. Order deleted as no items remain.",
        orderDeleted: true
      });
    }

    // Actualizar la orden
    await orderDetail.update({
      cart_items: updatedCartItems,
      amount: newAmount,
      quantity: newQuantity
    });

    return response(res, 200, { 
      message: "Product removed from order successfully",
      orderDetail: {
        id_orderDetail: orderDetail.id_orderDetail,
        cart_items: updatedCartItems,
        amount: newAmount,
        quantity: newQuantity
      }
    });
  } catch (error) {
    console.error("Error removing product from order:", error);
    return response(res, 500, { error: error.message });
  }
};
