// Recommendation Service - Generates personalized product recommendations
const Product = require('../models/Product');
const { generateProductEmbedding, generateEmbedding } = require('./embeddingService');
const { searchSimilarProducts } = require('./qdrantService');

/**
 * Get recommendations based on a specific product
 * "Users who liked this also liked..."
 * @param {string} productId - Product ID to base recommendations on
 * @param {number} limit - Number of recommendations (default: 10)
 * @returns {Promise<Array>} - Recommended products
 */
const getProductBasedRecommendations = async (productId, limit = 10) => {
  try {
    // Get the product from MongoDB
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return [];
    }

    // Generate embedding for this product
    const productEmbedding = await generateProductEmbedding(product);

    // Search for similar products (excluding the original product)
    const similarProducts = await searchSimilarProducts(productEmbedding, {
      limit: limit + 1, // +1 because we'll exclude the original
      excludeIds: [productId]
    });

    // Filter out the original product and return
    return similarProducts
      .filter(p => p.id !== productId.toString())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting product-based recommendations:', error.message);
    throw error;
  }
};

/**
 * Get recommendations based on user's search query/text
 * @param {string} queryText - User's search text/query
 * @param {number} limit - Number of recommendations (default: 10)
 * @returns {Promise<Array>} - Recommended products
 */
const getQueryBasedRecommendations = async (queryText, limit = 10) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(queryText);

    // Search for similar products
    const recommendedProducts = await searchSimilarProducts(queryEmbedding, {
      limit: limit
    });

    return recommendedProducts;
  } catch (error) {
    console.error('Error getting query-based recommendations:', error.message);
    throw error;
  }
};

/**
 * Get recommendations based on user's preferred products
 * Builds a user preference vector from liked/viewed products
 * @param {string[]} productIds - Array of product IDs the user liked/viewed
 * @param {number} limit - Number of recommendations (default: 10)
 * @returns {Promise<Array>} - Recommended products
 */
const getUserBasedRecommendations = async (productIds, limit = 10) => {
  try {
    if (!productIds || productIds.length === 0) {
      // If no user history, return popular/trending products
      return getPopularProducts(limit);
    }

    // Get products from MongoDB
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    if (products.length === 0) {
      return getPopularProducts(limit);
    }

    // Generate embeddings for all user's products
    const embeddings = await Promise.all(
      products.map(product => generateProductEmbedding(product))
    );

    // Average the embeddings to create a user preference vector
    const vectorSize = embeddings[0].length;
    const userPreferenceVector = new Array(vectorSize).fill(0);
    
    embeddings.forEach(embedding => {
      embedding.forEach((value, index) => {
        userPreferenceVector[index] += value;
      });
    });

    // Normalize by dividing by number of products
    userPreferenceVector.forEach((value, index) => {
      userPreferenceVector[index] = value / embeddings.length;
    });

    // Search for products similar to user preference
    const recommendedProducts = await searchSimilarProducts(userPreferenceVector, {
      limit: limit + productIds.length,
      excludeIds: productIds
    });

    // Filter out already seen products and return
    return recommendedProducts
      .filter(p => !productIds.includes(p.id))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting user-based recommendations:', error.message);
    throw error;
  }
};

/**
 * Get popular/trending products (fallback when no user data)
 * @param {number} limit - Number of products (default: 10)
 * @returns {Promise<Array>} - Popular products
 */
const getPopularProducts = async (limit = 10) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(limit)
      .select('_id name price category brand rating stock description image');

    return products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category,
      brand: p.brand,
      rating: p.rating,
      stock: p.stock,
      description: p.description,
      image: p.image,
      score: 0.5 // Default score for popular products
    }));
  } catch (error) {
    console.error('Error getting popular products:', error.message);
    return [];
  }
};

/**
 * Get hybrid recommendations (combination of different strategies)
 * @param {Object} options - Recommendation options
 * @param {string} options.productId - Optional: base recommendations on this product
 * @param {string} options.queryText - Optional: base recommendations on this query
 * @param {string[]} options.userProductIds - Optional: user's liked/viewed products
 * @param {number} options.limit - Number of recommendations (default: 10)
 * @returns {Promise<Array>} - Recommended products
 */
const getHybridRecommendations = async (options = {}) => {
  const {
    productId = null,
    queryText = null,
    userProductIds = [],
    limit = 10
  } = options;

  // If we have a product ID, use product-based recommendations
  if (productId) {
    return getProductBasedRecommendations(productId, limit);
  }

  // If we have a query, use query-based recommendations
  if (queryText) {
    return getQueryBasedRecommendations(queryText, limit);
  }

  // If we have user products, use user-based recommendations
  if (userProductIds && userProductIds.length > 0) {
    return getUserBasedRecommendations(userProductIds, limit);
  }

  // Fallback to popular products
  return getPopularProducts(limit);
};

module.exports = {
  getProductBasedRecommendations,
  getQueryBasedRecommendations,
  getUserBasedRecommendations,
  getPopularProducts,
  getHybridRecommendations
};

