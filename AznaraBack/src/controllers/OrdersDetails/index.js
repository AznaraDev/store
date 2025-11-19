const getOrdersDetails = require("./getOrdersDetails");
const createOrderDetail = require("./createOrderDetail");
const getOrderDetailID = require("./getOrderDetailID");
const deleteOrderDetail = require("./deleteOrderDetail");
const removeProductFromOrder = require("./removeProductFromOrder");

module.exports = {
  getOrdersDetails,
  createOrderDetail,
  getOrderDetailID,
  deleteOrderDetail,
  removeProductFromOrder
}