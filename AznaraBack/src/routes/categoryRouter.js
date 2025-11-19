const Router = require('express');
const controllers = require('../controllers');
const { authenticate, authorize } = require('../controllers/Users/authMiddleware');

const router = Router();

// ========== CATEGORÍAS ==========
// Obtener todas las categorías (público)
router.get('/', controllers.getCategory);

// Crear categoría (Admin)
router.post('/createCategory', authenticate, authorize(['Admin']), controllers.createCategory);

// Actualizar categoría (Admin)
router.put('/:id', authenticate, authorize(['Admin']), controllers.updateCategory);

// Eliminar categoría (Admin)
router.delete('/:id', authenticate, authorize(['Admin']), controllers.deleteCategory);

// ========== SUBCATEGORÍAS ==========
// Obtener todas las subcategorías (público)
router.get('/subcategory', controllers.getSubCategories);

// Crear subcategoría (Admin)
router.post('/subcategory', authenticate, authorize(['Admin']), controllers.createSubCategory);

// Actualizar subcategoría (Admin)
router.put('/subcategory/:id', authenticate, authorize(['Admin']), controllers.updateSubCategory);

// Eliminar subcategoría (Admin)
router.delete('/subcategory/:id', authenticate, authorize(['Admin']), controllers.deleteSubCategory);

module.exports = router;
