const {catchedAsync} = require("../utils");

const webhook = require("./webhook");




module.exports = {
    createProduct:catchedAsync(require("./Products/createProduct")),
    createCategory:catchedAsync(require("./Category/createCategory")),
    createSB:catchedAsync(require("./SubCategory/createSB")),
    putProduct:catchedAsync(require("./Products/putProduct")),
    deleteProduct:catchedAsync(require("./Products/deleteProduct")),
    getAllProduct:catchedAsync(require("./Products/getAllProduct")),
    getProductId:catchedAsync(require("./Products/getProductId")),
    putUser:catchedAsync(require("./Users/putUser")),
    deleteUser:catchedAsync(require("./Users/deleteUser")),
    getCategory:catchedAsync(require("./Category/getCategory")),
    getSB:catchedAsync(require("./SubCategory/getSB")),
    createOrderDetail:catchedAsync(require("./OrdersDetails/createOrderDetail")),
    getOrdersDetails:catchedAsync(require("./OrdersDetails/getOrdersDetails")),
    createUsers:catchedAsync(require("./Users/createUsers")),
    getOrderDetailID:catchedAsync(require("./OrdersDetails/getOrderDetailID")),
    updateOrderDetail:catchedAsync(require("./OrdersDetails/updateOrderDetail")),
    deleteOrderDetail:catchedAsync(require("./OrdersDetails/deleteOrderDetail")),
    removeProductFromOrder:catchedAsync(require("./OrdersDetails/removeProductFromOrder")),
    webhook:catchedAsync(require("./webhook")),
    suscription:catchedAsync(require("./Users/suscription")),
    
    // ✅ TAXXA CONTROLLERS - BUYER
    checkOrCreateBuyer:catchedAsync(require("./Taxxa/buyerController").checkOrCreateBuyer),
    createBuyer:catchedAsync(require("./Taxxa/buyerController").createBuyer),
    getBuyerByDocument:catchedAsync(require("./Taxxa/buyerController").getBuyerByDocument),
    getAllBuyers:catchedAsync(require("./Taxxa/buyerController").getAllBuyers),
    updateBuyer:catchedAsync(require("./Taxxa/buyerController").updateBuyer),
    
    // ✅ TAXXA CONTROLLERS - BILL  
    generateBill:catchedAsync(require("./Taxxa/BillControllers").generateBill),
    getAllBills:catchedAsync(require("./Taxxa/BillControllers").getAllBills),
    getBillById:catchedAsync(require("./Taxxa/BillControllers").getBillById),
    
    // ✅ TAXXA CONTROLLERS - INVOICE
    getAllInvoices:catchedAsync(require("./Taxxa/invoiceController").getAllInvoices),
    getInvoiceById:catchedAsync(require("./Taxxa/invoiceController").getInvoiceById),
    
    // ✅ TAXXA CONTROLLERS - TAXXA SERVICE (Envío a Taxxa)
    createInvoiceFromBill:catchedAsync(require("./Taxxa/TaxxaService").createInvoiceFromBill),
    createManualInvoice:catchedAsync(require("./Taxxa/TaxxaService").createManualInvoice),
    createCreditNote:catchedAsync(require("./Taxxa/TaxxaService").createCreditNote),
    getManualInvoiceData:catchedAsync(require("./Taxxa/TaxxaService").getManualInvoiceData),
    searchBuyerForManual:catchedAsync(require("./Taxxa/TaxxaService").searchBuyerForManual),
    
    // ✅ TAXXA CONTROLLERS - SELLER DATA
    createSellerData:catchedAsync(require("./Taxxa/sellerDataControllers").createSellerData),
    getSellerData:catchedAsync(require("./Taxxa/sellerDataControllers").getSellerData),
    updateSellerData:catchedAsync(require("./Taxxa/sellerDataControllers").updateSellerData),
    
    // ✅ CATEGORY & SUBCATEGORY CONTROLLERS
    updateCategory:catchedAsync(require("./Category/updateCategory")),
    deleteCategory:catchedAsync(require("./Category/deleteCategory")),
    createSubCategory:catchedAsync(require("./SubCategory/createSubCategory")),
    getSubCategories:catchedAsync(require("./SubCategory/getSubCategories")),
    updateSubCategory:catchedAsync(require("./SubCategory/updateSubCategory")),
    deleteSubCategory:catchedAsync(require("./SubCategory/deleteSubCategory"))
}