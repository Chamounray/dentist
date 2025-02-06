const express = require('express');
const { register, login, validateToken, refreshToken, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/validate-token', validateToken);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;