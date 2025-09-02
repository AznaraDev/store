const { Router } = require("express");
const { 
  checkOrCreateBuyer,
  createBuyer, 
  getBuyerByDocument, 
  getAllBuyers, 
  updateBuyer 
} = require("../controllers");

const router = Router();

// 🔍 Verificar/obtener buyer existente o datos de user
// GET /buyer/check/:n_document
router.get("/check/:n_document", checkOrCreateBuyer);

// 📋 Obtener buyer por documento 
// GET /buyer/:n_document
router.get("/:n_document", getBuyerByDocument);

// 📄 Obtener todos los buyers (con filtros y paginación)
// GET /buyer?page=1&limit=10&search=&docType=
router.get("/", getAllBuyers);

// 🆕 Crear nuevo buyer
// POST /buyer
router.post("/", createBuyer);

// ✏️ Actualizar buyer existente
// PUT /buyer/:n_document  
router.put("/:n_document", updateBuyer);

module.exports = router;
