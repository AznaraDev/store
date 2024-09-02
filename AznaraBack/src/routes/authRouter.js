const express = require("express");
const router = express.Router();
const createUsers = require("../controllers/Users/createUsers");
const authUser = require("../controllers/Users/authUser");


router.post("/register", createUsers);

router.post("/login", authUser);

module.exports = router;
