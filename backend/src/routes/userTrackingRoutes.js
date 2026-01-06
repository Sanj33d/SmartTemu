// User Tracking Routes
const express = require('express');
const router = express.Router();

const {
  trackProductView,
  trackProductLike,
  removeProductLike,
  getUserTracking
} = require('../controllers/userTrackingController');

// POST /api/user-tracking/view - Track a product view
router.post('/view', trackProductView);

// POST /api/user-tracking/like - Track a product like
router.post('/like', trackProductLike);

// DELETE /api/user-tracking/like - Remove a product like
router.delete('/like', removeProductLike);

// GET /api/user-tracking/:firebaseUid - Get user's tracked products
router.get('/:firebaseUid', getUserTracking);

module.exports = router;


