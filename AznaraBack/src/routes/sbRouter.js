const  Router  = require('express');
const controllers = require('../controllers');

const router = Router();

router.post('/createSB', controllers.createSB);

router.get('/', controllers.getSB);


module.exports = router;