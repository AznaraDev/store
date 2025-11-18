const { Payment, OrderDetail, User } = require('../../data');

const paymentController = {
    // Obtener todos los pagos con información relacionada
    getAllPayments: async (req, res) => {
        try {
            const payments = await Payment.findAll({
                include: [
                    {
                        model: OrderDetail,
                        attributes: ['id_orderDetail', 'date', 'amount', 'state_order', 'reference'],
                        include: [
                            {
                                model: User,
                                attributes: ['n_document', 'first_name', 'last_name', 'email']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error obteniendo pagos:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Obtener un pago por ID
    getPaymentById: async (req, res) => {
        try {
            const { id } = req.params;

            const payment = await Payment.findByPk(id, {
                include: [
                    {
                        model: OrderDetail,
                        attributes: ['id_orderDetail', 'date', 'amount', 'state_order', 'reference'],
                        include: [
                            {
                                model: User,
                                attributes: ['n_document', 'first_name', 'last_name', 'email']
                            }
                        ]
                    }
                ]
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            console.error('Error obteniendo pago:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Obtener pagos por estado
    getPaymentsByStatus: async (req, res) => {
        try {
            const { status } = req.params;

            const validStatuses = ['Pago', 'Pendiente', 'Rechazado', 'Error'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido. Debe ser: Pago, Pendiente, Rechazado o Error'
                });
            }

            const payments = await Payment.findAll({
                where: { payment_state: status },
                include: [
                    {
                        model: OrderDetail,
                        attributes: ['id_orderDetail', 'date', 'amount', 'state_order', 'reference'],
                        include: [
                            {
                                model: User,
                                attributes: ['n_document', 'first_name', 'last_name', 'email']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error obteniendo pagos por estado:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Obtener pagos de un OrderDetail específico
    getPaymentsByOrderDetail: async (req, res) => {
        try {
            const { orderDetailId } = req.params;

            const payments = await Payment.findAll({
                where: { id_orderDetail: orderDetailId },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error obteniendo pagos del pedido:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = paymentController;
