const express = require("express");
const router = express.Router();
const webhook = require("../controllers/webhook");

// 📨 Endpoint para recibir eventos de Wompi
router.post('/eventos', webhook.getEventWompi);

module.exports = router;