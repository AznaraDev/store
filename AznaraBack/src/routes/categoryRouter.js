const  Router  = require('express');
const controllers = require('../controllers');

const router = Router();

router.post('/createCategory', controllers.createCategory);

router.get('/', controllers.getCategory);


module.exports = router;