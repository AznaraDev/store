const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Payment/paymentController');
const isAuth = require('../utils/isAuth');

// 📋 Obtener todos los pagos (requiere autenticación)
router.get('/', isAuth, paymentController.getAllPayments);

// 🔍 Obtener un pago específico por ID
router.get('/:id', isAuth, paymentController.getPaymentById);

// 📊 Obtener pagos por estado (Pago, Pendiente, Rechazado, Error)
router.get('/status/:status', isAuth, paymentController.getPaymentsByStatus);

// 📦 Obtener todos los pagos de un OrderDetail específico
router.get('/order/:orderDetailId', isAuth, paymentController.getPaymentsByOrderDetail);

module.exports = router;
