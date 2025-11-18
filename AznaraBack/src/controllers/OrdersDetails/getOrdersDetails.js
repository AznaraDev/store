// controllers/getAllorders.js
const { OrderDetail, Product, Image } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
 try {
 const { latest } = req.query;
 const orders = await OrderDetail.findAll({
 include: {
 model: Product,
 as: 'products',
 include: [
   {
     model: Image,
     as: 'Images',
     attributes: ['id_image', 'url']
   }
 ]
 },
 order: [['createdAt', 'DESC']]
 });

if (latest === 'true') {
 // Si se pide la última orden, devolver solo la más reciente con todos los detalles
 if (orders.length === 0) {
 return response(res, 404, { error: "No se encontraron órdenes." });
 }
 const latestOrder = orders[0];
 const formattedOrder = {
 id_orderDetail: latestOrder.id_orderDetail,
 date: latestOrder.date,
 amount: latestOrder.amount,
 quantity: latestOrder.quantity,
 state_order: latestOrder.state_order,
 address: latestOrder.address,
 deliveryAddress: latestOrder.deliveryAddress,
 n_document: latestOrder.n_document,
 products: latestOrder.products.map(product => ({
 id_product: product.id_product,
 integritySignature: latestOrder.integritySignature,
 trackingNumber: latestOrder.trackingNumber,
 })),
 };
 return response(res, 200, { orderDetail: formattedOrder });
 }

const formattedOrders = orders.map(order => ({
 id_orderDetail: order.id_orderDetail,
 date: order.date,
 amount: order.amount,
 quantity: order.quantity,
 state_order: order.state_order,
 address: order.address,
 deliveryAddress: order.deliveryAddress,
 recipient_name: order.recipient_name,
 recipient_phone: order.recipient_phone,
 city: order.city,
 postal_code: order.postal_code,
 delivery_notes: order.delivery_notes,
 trackingNumber: order.trackingNumber,
 cart_items: order.cart_items,
 products: order.products.map(product => ({
   id_product: product.id_product,
   name: product.name,
   price: product.price,
   sizes: product.sizes,
   colors: product.colors,
   Images: product.Images
 }))
}));

return response(res, 200, { orders: formattedOrders });
 } catch (error) {
 console.error('Error fetching orders:', error);
 return response(res, 500, { error: error.message });
 }
};