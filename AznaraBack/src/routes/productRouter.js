const  Router  = require('express');
const controllers = require('../controllers');
const getProductsDashboard = require('../controllers/Products/getProductsDashboard');

const router = Router();

// 📊 Dashboard - debe ir antes de /:id para no confundirlo con un ID
router.get('/dashboard', getProductsDashboard);

router.get('/', controllers.getAllProduct);
 
router.get('/:id', controllers.getProductId);

router.post('/createProducts', controllers.createProduct);

router.delete('/deleteProducts/:id', controllers.deleteProduct);

router.put('/updateProducts/:id', controllers.putProduct);






module.exports = router;

