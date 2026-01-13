const express = require('express');
const router = express.Router();
const { createGig, listGigs, getGig } = require('../controllers/gigController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/', auth, createGig);
router.get('/', listGigs);
router.get('/:id', optionalAuth, getGig);

module.exports = router;
