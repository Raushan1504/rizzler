const express = require('express');
const { getProfile, updateProfile, getDiscoverUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes are protected
router.use(protect);

// GET /api/users/discover
router.get('/discover', getDiscoverUsers);

// GET /api/users/profile
router.get('/profile', getProfile);

// PUT /api/users/profile
router.put('/profile', updateProfile);

module.exports = router;

