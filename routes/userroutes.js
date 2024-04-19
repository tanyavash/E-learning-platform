// const validateToken = require("../middleware/validateTokenHandler");
const express = require('express');
const { registerUser, loginUser, viewUser, updateUser } = require('../controllers/usercontroller');
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.post("/register", registerUser );
router.post("/login", loginUser);
router.get("/viewUser/:userId", viewUser);
router.put("/updateUser/:userId", validateToken, updateUser);

module.exports = router;