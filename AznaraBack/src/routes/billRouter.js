const { Router } = require("express");
const { 
  generateBill, 
  getAllBills, 
  getBillById 
} = require("../controllers");

const router = Router();

// 🧾 Generar factura desde OrderDetail
// POST /bill/generate/:orderDetailId
router.post("/generate/:orderDetailId", generateBill);

// 📋 Obtener todas las facturas (con filtros y paginación)
// GET /bill?status=paid&page=1&limit=10&fromDate=&toDate=&customerDocument=&includeDetails=true
router.get("/", getAllBills);

// 📄 Obtener factura específica por ID
// GET /bill/:billId
router.get("/:billId", getBillById);

module.exports = router;
