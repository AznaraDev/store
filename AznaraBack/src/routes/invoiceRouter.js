const { Router } = require("express");
const { 
  getAllInvoices, 
  getInvoiceById,
  createInvoiceFromBill,
  createManualInvoice,
  createCreditNote,
  getManualInvoiceData,
  searchBuyerForManual
} = require("../controllers");

const router = Router();

// 📋 Obtener todas las facturas fiscales (enviadas a Taxxa)
// GET /invoice?page=1&limit=10&status=&fromDate=&toDate=
router.get("/", getAllInvoices);

// 📄 Obtener factura fiscal específica por ID
// GET /invoice/:invoiceId
router.get("/:invoiceId", getInvoiceById);

// 🚀 ENVÍO A TAXXA - Crear factura fiscal desde Bill
// POST /invoice/send-from-bill
router.post("/send-from-bill", createInvoiceFromBill);

// 🚀 FACTURACIÓN MANUAL - Crear factura fiscal manual
// POST /invoice/manual
router.post("/manual", createManualInvoice);

// 📄 NOTA DE CRÉDITO - Crear nota de crédito
// POST /invoice/credit-note
router.post("/credit-note", createCreditNote);

// 📋 DATOS PARA FACTURACIÓN MANUAL
// GET /invoice/manual/data
router.get("/manual/data", getManualInvoiceData);

// 🔍 BUSCAR COMPRADOR PARA FACTURACIÓN MANUAL
// GET /invoice/manual/buyer/:document
router.get("/manual/buyer/:document", searchBuyerForManual);

module.exports = router;
