const { Router } = require('express');
const { createMaterial, getMaterials, updateMaterial, deleteMaterial } = require('../controllers/Material');
const authenticate = require('../utils/isAuth');
const authorize = require('../utils/authorize');

const materialRouter = Router();

// Crear material (solo admin/seller)
materialRouter.post('/', authenticate, authorize(['admin', 'seller']), createMaterial);

// Obtener todos los materiales (con búsqueda y paginación)
materialRouter.get('/', getMaterials);

// Actualizar material (solo admin/seller)
materialRouter.put('/:id', authenticate, authorize(['admin', 'seller']), updateMaterial);

// Eliminar material (solo admin/seller)
materialRouter.delete('/:id', authenticate, authorize(['admin', 'seller']), deleteMaterial);

module.exports = materialRouter;
