const  Router  = require('express');
const controllers = require('../controllers');

const router = Router();

router.get('/', controllers.getAllProduct);
 
router.get('/:id', controllers.getProductId);

router.post('/createProducts', controllers.createProduct);

router.delete('/deleteProducts/:id', controllers.deleteProduct);

router.put('/updateProducts/:id', controllers.putProduct);






module.exports = router;

