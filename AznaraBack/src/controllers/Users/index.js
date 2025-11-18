// src/controllers/Users/index.js
const createUsers = require('./createUsers');
const putUser = require('./putUser');
const deleteUser = require('./deleteUser');
const getAllUsers = require('./getAllUsers');
const getUserByDocument = require('./getUserByDocument');
const authUser = require('./authUser')
const suscription = require('./suscription')
const getCustomers = require('./getCustomers')

module.exports = {
  createUsers,
  putUser,
  deleteUser,
  getAllUsers,
  getUserByDocument,
  authUser,
  suscription,
  getCustomers
};
