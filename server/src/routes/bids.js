const express = require('express');
const router = express.Router();
const { createBid, hire, myCounts, myHired } = require('../controllers/bidController');
const auth = require('../middleware/auth');

router.post('/', auth, createBid);
router.post('/hire', auth, hire);
router.get('/me/counts', auth, myCounts);
router.get('/me/hired', auth, myHired);

module.exports = router;

