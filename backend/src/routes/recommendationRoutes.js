const express = require('express');
const router = express.Router();

const {
  getProductRecommendations,
  getQueryRecommendations,
  getUserRecommendations,
  getPopularRecommendations,
  getHybridRecommendationsHandler
} = require('../controllers/recommendationController');

// GET /api/recommendations/product/:productId - Get recommendations based on a product
router.get('/product/:productId', getProductRecommendations);

// GET /api/recommendations/query?q=search+text - Get recommendations based on search query
router.get('/query', getQueryRecommendations);

// GET /api/recommendations/user?productIds=id1,id2,id3 - Get personalized user recommendations
router.get('/user', getUserRecommendations);

// POST /api/recommendations/user - Get personalized user recommendations (alternative with body)
router.post('/user', getUserRecommendations);

// GET /api/recommendations/popular - Get popular/trending products
router.get('/popular', getPopularRecommendations);

// POST /api/recommendations/hybrid - Get hybrid recommendations (smart combination)
router.post('/hybrid', getHybridRecommendationsHandler);

module.exports = router;

