// Qdrant Service - Handles all Qdrant vector database operations
const { qdrantClient, PRODUCTS_COLLECTION } = require('../config/qdrant');
const { getEmbeddingDimensions } = require('./embeddingService');

/**
 * Initialize/create the products collection in Qdrant
 * @returns {Promise<void>}
 */
const initializeCollection = async () => {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      col => col.name === PRODUCTS_COLLECTION
    );

    if (collectionExists) {
      console.log(`✅ Collection '${PRODUCTS_COLLECTION}' already exists`);
      return;
    }

    // Create collection with vector size matching our embedding model
    const vectorSize = getEmbeddingDimensions();
    
    await qdrantClient.createCollection(PRODUCTS_COLLECTION, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine' // Cosine similarity (good for text embeddings)
      }
    });

    console.log(`✅ Created collection '${PRODUCTS_COLLECTION}' with ${vectorSize} dimensions`);
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error.message);
    throw error;
  }
};

/**
 * Upsert a product vector into Qdrant
 * @param {string} productId - MongoDB product ID
 * @param {number[]} vector - Embedding vector
 * @param {Object} payload - Product metadata (name, price, category, etc.)
 * @returns {Promise<void>}
 */
const upsertProduct = async (productId, vector, payload) => {
  try {
    await qdrantClient.upsert(PRODUCTS_COLLECTION, {
      wait: true,
      points: [
        {
          id: productId.toString(), // Qdrant uses string IDs
          vector: vector,
          payload: payload
        }
      ]
    });
  } catch (error) {
    console.error(`Error upserting product ${productId}:`, error.message);
    throw error;
  }
};

/**
 * Search for similar products using vector similarity
 * @param {number[]} queryVector - Query embedding vector
 * @param {Object} options - Search options
 * @param {number} options.limit - Number of results (default: 10)
 * @param {Object} options.filter - Optional filter conditions (e.g., { category: 'Electronics' })
 * @param {string[]} options.excludeIds - Product IDs to exclude from results
 * @returns {Promise<Array>} - Array of similar products with scores
 */
const searchSimilarProducts = async (queryVector, options = {}) => {
  try {
    const {
      limit = 10,
      filter = null,
      excludeIds = []
    } = options;

    // Build filter if provided
    let qdrantFilter = null;
    if (filter || excludeIds.length > 0) {
      qdrantFilter = {
        must: [],
        must_not: []
      };

      // Add filter conditions
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          qdrantFilter.must.push({
            key: key,
            match: { value: value }
          });
        });
      }

      // Exclude specific product IDs
      if (excludeIds.length > 0) {
        qdrantFilter.must_not.push({
          has_id: excludeIds.map(id => id.toString())
        });
      }
    }

    const searchResult = await qdrantClient.search(PRODUCTS_COLLECTION, {
      vector: queryVector,
      limit: limit,
      filter: qdrantFilter,
      with_payload: true,
      with_vector: false // Don't return vectors to save bandwidth
    });

    return searchResult.map(result => ({
      id: result.id,
      score: result.score, // Similarity score (0-1, higher is more similar)
      ...result.payload // Product metadata
    }));
  } catch (error) {
    console.error('Error searching similar products:', error.message);
    throw error;
  }
};

/**
 * Delete a product from Qdrant
 * @param {string} productId - Product ID to delete
 * @returns {Promise<void>}
 */
const deleteProduct = async (productId) => {
  try {
    await qdrantClient.delete(PRODUCTS_COLLECTION, {
      wait: true,
      points: [productId.toString()]
    });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error.message);
    throw error;
  }
};

/**
 * Get product by ID from Qdrant
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} - Product data or null if not found
 */
const getProductById = async (productId) => {
  try {
    const result = await qdrantClient.retrieve(PRODUCTS_COLLECTION, {
      ids: [productId.toString()],
      with_payload: true,
      with_vector: false
    });

    if (result.length === 0) return null;

    return {
      id: result[0].id,
      ...result[0].payload
    };
  } catch (error) {
    console.error(`Error getting product ${productId}:`, error.message);
    return null;
  }
};

/**
 * Get collection info (useful for debugging)
 * @returns {Promise<Object>} - Collection information
 */
const getCollectionInfo = async () => {
  try {
    return await qdrantClient.getCollection(PRODUCTS_COLLECTION);
  } catch (error) {
    console.error('Error getting collection info:', error.message);
    throw error;
  }
};

module.exports = {
  initializeCollection,
  upsertProduct,
  searchSimilarProducts,
  deleteProduct,
  getProductById,
  getCollectionInfo
};

