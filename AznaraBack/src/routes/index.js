const { Router } = require('express');

const router = Router();

router.use("/product", require("./productRouter"));
router.use("/category", require("./categoryRouter"));
router.use("/sb", require("./sbRouter"));
router.use("/material", require("./materialRouter"));
router.use("/order", require('./orderDetailRouter'))
router.use("/user", require("./userRouter"))
router.use("/auth", require("./authRouter"))
router.use("/eventos", require("./webhookRouter"))
router.use("/payment", require("./paymentRouter"))
router.use("/stock", require("./stockRouter"))

// ✅ RUTAS TAXXA
router.use("/buyer", require("./buyerRouter"))
router.use("/bill", require("./billRouter"))
router.use("/invoice", require("./invoiceRouter"))
router.use("/seller", require("./sellerRouter"))


module.exports = router;