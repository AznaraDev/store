const { Router } = require("express");
const { 
  createSellerData, 
  getSellerData, 
  updateSellerData 
} = require("../controllers");

const router = Router();

// 🏢 Obtener datos de la empresa vendedora
// GET /seller
router.get("/", getSellerData);

// 🆕 Crear/configurar datos de la empresa vendedora
// POST /seller
router.post("/", createSellerData);

// ✏️ Actualizar datos de la empresa vendedora
// PUT /seller
router.put("/", updateSellerData);

module.exports = router;
