const { QdrantClient } = require('@qdrant/js-client-rest');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || null; 

// Create Qdrant client
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY
});

// Collection name for products
const PRODUCTS_COLLECTION = 'products';

module.exports = {
  qdrantClient,
  PRODUCTS_COLLECTION
};

