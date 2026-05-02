const express = require('express');
const { generateAiBio, generateAiIcebreaker } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/bio', generateAiBio);
router.post('/icebreaker', generateAiIcebreaker);

module.exports = router;
