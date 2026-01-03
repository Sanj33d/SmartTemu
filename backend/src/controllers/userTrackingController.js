// User Tracking Controller - Tracks user interactions for recommendations
const User = require('../models/User');

/**
 * Track a product view
 * POST /api/user-tracking/view
 */
const trackProductView = async (req, res) => {
  try {
    const { firebaseUid, productId } = req.body;

    if (!firebaseUid || !productId) {
      return res.status(400).json({
        success: false,
        message: 'firebaseUid and productId are required'
      });
    }

    // Find or create user
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      // Create new user (you might want to get email from Firebase token)
      user = await User.create({
        firebaseUid,
        email: req.body.email || 'unknown@example.com',
        viewedProducts: [],
        likedProducts: [],
        purchasedProducts: []
      });
    }

    // Add view if not already tracked (avoid duplicates)
    const existingView = user.viewedProducts.find(
      v => v.productId.toString() === productId
    );

    if (!existingView) {
      user.viewedProducts.push({
        productId,
        viewedAt: new Date()
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product view tracked',
      data: {
        totalViews: user.viewedProducts.length
      }
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking product view',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Track a product like/favorite
 * POST /api/user-tracking/like
 */
const trackProductLike = async (req, res) => {
  try {
    const { firebaseUid, productId } = req.body;

    if (!firebaseUid || !productId) {
      return res.status(400).json({
        success: false,
        message: 'firebaseUid and productId are required'
      });
    }

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: req.body.email || 'unknown@example.com',
        viewedProducts: [],
        likedProducts: [],
        purchasedProducts: []
      });
    }

    // Add like if not already liked
    if (!user.likedProducts.includes(productId)) {
      user.likedProducts.push(productId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product liked',
      data: {
        totalLikes: user.likedProducts.length
      }
    });
  } catch (error) {
    console.error('Error tracking product like:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking product like',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Remove a product like
 * DELETE /api/user-tracking/like
 */
const removeProductLike = async (req, res) => {
  try {
    const { firebaseUid, productId } = req.body;

    if (!firebaseUid || !productId) {
      return res.status(400).json({
        success: false,
        message: 'firebaseUid and productId are required'
      });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.likedProducts = user.likedProducts.filter(
      id => id.toString() !== productId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product like removed',
      data: {
        totalLikes: user.likedProducts.length
      }
    });
  } catch (error) {
    console.error('Error removing product like:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing product like',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get user's tracked products
 * GET /api/user-tracking/:firebaseUid
 */
const getUserTracking = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid })
      .populate('viewedProducts.productId', 'name category')
      .populate('likedProducts', 'name category')
      .populate('purchasedProducts.productId', 'name category');

    if (!user) {
      return res.status(200).json({
        success: true,
        data: {
          viewedProducts: [],
          likedProducts: [],
          purchasedProducts: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        viewedProducts: user.viewedProducts.map(v => ({
          productId: v.productId._id || v.productId,
          viewedAt: v.viewedAt
        })),
        likedProducts: user.likedProducts,
        purchasedProducts: user.purchasedProducts.map(p => ({
          productId: p.productId._id || p.productId,
          purchasedAt: p.purchasedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting user tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  trackProductView,
  trackProductLike,
  removeProductLike,
  getUserTracking
};

