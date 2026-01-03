// User Model for tracking user preferences and interactions
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase UID (from Firebase Auth)
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  // Product IDs the user has viewed
  viewedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Product IDs the user has liked/favorited
  likedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Product IDs the user has purchased
  purchasedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Last time recommendations were generated (for caching)
  lastRecommendationUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries (firebaseUid already has unique index, so don't duplicate)
userSchema.index({ 'viewedProducts.productId': 1 });
userSchema.index({ likedProducts: 1 });

module.exports = mongoose.model('User', userSchema);

