// En tu controlador (por ejemplo, ordersController.js)
const { OrderDetail } = require("../../data")
const response = require("../../utils/response")

module.exports = async (req, res) => {
  const { id_orderDetail } = req.params;
  const { state_order , trackingNumber } = req.body;

  try {
    const orderDetail = await OrderDetail.findByPk(id_orderDetail);

    if (!orderDetail) {
      return response(res, 404, { error: "Order Detail not found" });
    }

    // Verificar si el valor del estado es válido
    const validStates = ['Pedido Realizado', 'En Preparación', 'Listo para entregar','Envío Realizado', 'Retirado'];
    if (!validStates.includes(state_order)) {
      return response(res, 400, { error: "Invalid state value" });
    }

    orderDetail.state_order = state_order; // Actualizar el estado de la orden

    await orderDetail.save(); // Guardar el cambio en la base de datos
    if (trackingNumber) {
      orderDetail.trackingNumber = trackingNumber; // Actualizar el número de seguimiento si está presente
    }
    await orderDetail.save();
    
    return response(res, 200, { orderDetail });
  } catch (error) {
    console.error("Error updating order detail:", error);
    return response(res, 500, { error: error.message });
  }
};
