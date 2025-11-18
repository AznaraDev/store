const express = require('express');
const router = express.Router();
const stockController = require('../controllers/Stock/stockController');
const isAuth = require('../utils/isAuth');

// 📦 Agregar stock a un producto
router.post('/:id/add', isAuth, stockController.addStock);

// 📉 Reducir stock de un producto
router.post('/:id/remove', isAuth, stockController.removeStock);

// 🔧 Ajustar stock manualmente
router.put('/:id/adjust', isAuth, stockController.adjustStock);

// 📜 Obtener historial de movimientos de un producto
router.get('/:id/history', isAuth, stockController.getStockHistory);

// ⚠️ Obtener productos con stock bajo
router.get('/low-stock', isAuth, stockController.getLowStockProducts);

// ❌ Obtener productos sin stock
router.get('/out-of-stock', isAuth, stockController.getOutOfStockProducts);

module.exports = router;
