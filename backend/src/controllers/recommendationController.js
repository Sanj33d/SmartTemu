// Recommendation Controller - Handles recommendation API requests
const {
  getProductBasedRecommendations,
  getQueryBasedRecommendations,
  getUserBasedRecommendations,
  getPopularProducts,
  getHybridRecommendations
} = require('../services/recommendationService');

/**
 * Get recommendations based on a product
 * GET /api/recommendations/product/:productId
 */
const getProductRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const recommendations = await getProductBasedRecommendations(productId, limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        type: 'product-based'
      }
    });
  } catch (error) {
    console.error('Error in getProductRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get recommendations based on search query
 * GET /api/recommendations/query?q=search+text
 */
const getQueryRecommendations = async (req, res) => {
  try {
    const queryText = req.query.q || req.query.query || '';
    const limit = parseInt(req.query.limit) || 10;

    if (!queryText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query text is required'
      });
    }

    const recommendations = await getQueryBasedRecommendations(queryText, limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        type: 'query-based',
        query: queryText
      }
    });
  } catch (error) {
    console.error('Error in getQueryRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching query-based recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get personalized recommendations for a user
 * GET /api/recommendations/user?productIds=id1,id2,id3
 */
const getUserRecommendations = async (req, res) => {
  try {
    // Get product IDs from query parameter (comma-separated) or request body
    const productIdsParam = req.query.productIds || req.body.productIds;
    const limit = parseInt(req.query.limit) || 10;

    let productIds = [];
    if (productIdsParam) {
      // Handle both comma-separated string and array
      productIds = Array.isArray(productIdsParam)
        ? productIdsParam
        : productIdsParam.split(',').map(id => id.trim()).filter(Boolean);
    }

    const recommendations = await getUserBasedRecommendations(productIds, limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        type: 'user-based',
        basedOnProducts: productIds.length
      }
    });
  } catch (error) {
    console.error('Error in getUserRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get popular/trending products
 * GET /api/recommendations/popular
 */
const getPopularRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await getPopularProducts(limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        type: 'popular'
      }
    });
  } catch (error) {
    console.error('Error in getPopularRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get hybrid recommendations (smart combination)
 * POST /api/recommendations/hybrid
 */
const getHybridRecommendationsHandler = async (req, res) => {
  try {
    const {
      productId,
      queryText,
      userProductIds,
      limit = 10
    } = req.body;

    const recommendations = await getHybridRecommendations({
      productId,
      queryText,
      userProductIds,
      limit
    });

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        type: 'hybrid'
      }
    });
  } catch (error) {
    console.error('Error in getHybridRecommendationsHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hybrid recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getProductRecommendations,
  getQueryRecommendations,
  getUserRecommendations,
  getPopularRecommendations,
  getHybridRecommendationsHandler
};

