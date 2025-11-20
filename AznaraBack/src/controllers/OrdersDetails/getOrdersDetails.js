// controllers/getAllorders.js
const { OrderDetail, Product, Image, User } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
 try {
 const { latest, n_document, name, search } = req.query;
 
 // Construir filtros dinámicos
 let whereClause = {};
 let userWhereClause = {};
 
 // Filtro por documento específico
 if (n_document) {
   whereClause.n_document = n_document;
 }
 
 // Filtro por nombre (buscar en User - first_name o last_name)
 if (name) {
   userWhereClause[Op.or] = [
     { first_name: { [Op.iLike]: `%${name}%` } },
     { last_name: { [Op.iLike]: `%${name}%` } }
   ];
 }
 
 // Filtro de búsqueda general (documento o nombre)
 if (search) {
   userWhereClause[Op.or] = [
     { first_name: { [Op.iLike]: `%${search}%` } },
     { last_name: { [Op.iLike]: `%${search}%` } },
     { n_document: { [Op.iLike]: `%${search}%` } }
   ];
 }
 
 const orders = await OrderDetail.findAll({
 where: whereClause,
 include: [
   {
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
   {
     model: User,
     attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone'],
     where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
     required: Object.keys(userWhereClause).length > 0 // Solo hacer INNER JOIN si hay filtro de usuario
   }
 ],
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
 payment_method: latestOrder.payment_method,
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
 payment_method: order.payment_method,
 deliveryAddress: order.deliveryAddress,
 recipient_name: order.recipient_name,
 recipient_phone: order.recipient_phone,
 city: order.city,
 postal_code: order.postal_code,
 delivery_notes: order.delivery_notes,
 trackingNumber: order.trackingNumber,
 transaction_status: order.transaction_status,
 cart_items: order.cart_items,
 customer: order.User ? {
   n_document: order.User.n_document,
   name: `${order.User.first_name || ''} ${order.User.last_name || ''}`.trim(),
   email: order.User.email,
   phone: order.User.phone
 } : null,
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