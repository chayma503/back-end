const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');

// Route POST /register
router.post('/register', registerUser);

module.exports = router;
