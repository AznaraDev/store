
const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const secretoIntegridad = 'test_integrity_VMVZ36lyoQot5DsN0fBXAmp4onT5T86G'; 

function generarFirmaIntegridad(id_orderDetail, monto, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${id_orderDetail}${monto}${moneda}${secretoIntegridad}`;
  return crypto.createHash('sha256').update(cadenaConcatenada).digest('hex');
}

module.exports = async (req, res) => {
  try {
    const { 
      date, 
      amount, 
      quantity, 
      state_order, 
      id_product, 
      address, 
      deliveryAddress, 
      recipient_name,
      recipient_phone,
      city,
      postal_code,
      delivery_notes,
      cart_items,
      n_document 
    } = req.body;

    if (!date || !amount || !quantity || !state_order || !id_product || !address ) {
      return response(res, 400, { error: "Missing Ordering Data" });
    }
    
    // Validar campos requeridos para envío a domicilio
    if (address === 'Envio a domicilio') {
      if (!deliveryAddress || !recipient_name || !recipient_phone || !city) {
        return response(res, 400, { error: "Missing required delivery information" });
      }
    }

    const lastOrder = await OrderDetail.findOne({ order: [['createdAt', 'DESC']] });
    const lastOrderNumber = lastOrder ? lastOrder.id_orderDetail : 0;
    const referencia = `SO-${lastOrderNumber + 1}`;
    
    // Generar la firma de integridad
    const integritySignature = generarFirmaIntegridad(
      referencia,
      amount * 100, // Convertir el monto a centavos
      'COP',
      secretoIntegridad
    );

    const orderDetailData = {
     id_category: uuidv4(),
      date,
      amount,
      quantity,
      state_order,
      address,
      deliveryAddress: address === 'Envio a domicilio' ? deliveryAddress : null,
      recipient_name: address === 'Envio a domicilio' ? recipient_name : null,
      recipient_phone: address === 'Envio a domicilio' ? recipient_phone : null,
      city: address === 'Envio a domicilio' ? city : null,
      postal_code: address === 'Envio a domicilio' ? postal_code : null,
      delivery_notes: address === 'Envio a domicilio' ? delivery_notes : null,
      cart_items: cart_items || null,
      n_document,
      integritySignature,
    };

    const orderDetail = await OrderDetail.create(orderDetailData);
    
    // Descontar stock automáticamente cuando se crea el pedido
    // Procesar descuento de stock si hay cart_items
    if (cart_items && Array.isArray(cart_items) && cart_items.length > 0) {
      for (const item of cart_items) {
        if (item.id_product && item.quantity) {
          const product = await Product.findByPk(item.id_product);
          
          if (product) {
            const previousStock = product.stock || 0;
            const quantityToReduce = parseInt(item.quantity);
            
            if (previousStock >= quantityToReduce) {
              const newStock = previousStock - quantityToReduce;
              
              // Actualizar stock del producto
              await product.update({ stock: newStock });
              
              // Registrar movimiento de stock
              await StockMovement.create({
                id_product: item.id_product,
                movement_type: 'venta',
                quantity: -quantityToReduce,
                previous_stock: previousStock,
                new_stock: newStock,
                reason: 'Venta - Pedido creado',
                performed_by: n_document || 'Sistema',
                reference_id: orderDetail.id_orderDetail,
                notes: `Pedido ${orderDetail.id_orderDetail} - ${item.name || 'Producto'}`
              });
              
              console.log(`Stock descontado: ${item.name}, cantidad: ${quantityToReduce}, nuevo stock: ${newStock}`);
            } else {
              console.warn(`Stock insuficiente para producto ${item.id_product}: disponible ${previousStock}, solicitado ${quantityToReduce}`);
            }
          }
        }
      }
    }
    
    const productUpdates = id_product.map(productId => ({
      id_orderDetail: orderDetail.id_orderDetail,
      id_product: productId
    }));

    await Promise.all(productUpdates.map(async ({ id_orderDetail, id_product }) => {
      await Product.update({ id_orderDetail }, { where: { id_product } });
    }));

    const updatedOrderDetail = await OrderDetail.findOne({
      where: { id_orderDetail: orderDetail.id_orderDetail },
      include: {
        model: Product,
        as: 'products',
        attributes: ['id_product'],
      }
    });
    console.log("Order created:", updatedOrderDetail);
    console.log("Order created:", orderDetail);
    return response(res, 201, { orderDetail });
  } catch (error) {
    console.error("Error creating orderDetail:", error);
    return response(res, 500, { error: error.message });
  }
};
