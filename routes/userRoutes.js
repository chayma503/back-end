const express = require('express');
const router = express.Router();
const { registerUser , verifyEmail} = require('../controllers/userController');
const { loginUser } = require("../controllers/loginController");
const { resetPassword } = require("../controllers/resetPassword");
const { sendResetEmail } = require("../controllers/forgotPassword");



// Route POST /register
router.post('/register', registerUser);
router.post("/login", loginUser);
router.get('/verify/:token', verifyEmail);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", sendResetEmail);





module.exports = router;
