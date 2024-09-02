const  Router  = require('express');
const controllers = require('../controllers')

const router = Router();

router.post('/create', controllers.createOrderDetail);
router.get('/', controllers.getOrdersDetails)
router.get('/:n_document',controllers.getOrderDetailID);
router.put('/:id_orderDetail', controllers.updateOrderDetail);
module.exports = router;