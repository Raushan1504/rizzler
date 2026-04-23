const express = require('express');
const { swipeUser } = require('../controllers/swipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/swipe
router.post('/', protect, swipeUser);

module.exports = router;
