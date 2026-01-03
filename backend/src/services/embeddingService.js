// Embedding configuration
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'; // Local model from Xenova

// Cache the pipeline instance to avoid reloading the model
let embeddingPipeline = null;
let transformersModule = null;
let isLoading = false;
let loadingPromise = null;

/**
 * Load the transformers module (ES Module dynamic import)
 * @returns {Promise<any>} - The transformers module
 */
const loadTransformers = async () => {
  if (!transformersModule) {
    transformersModule = await import('@xenova/transformers');
  }
  return transformersModule;
};

/**
 * Initialize the embedding pipeline (lazy loading)
 * @returns {Promise<any>} - The embedding pipeline
 */
const getEmbeddingPipeline = async () => {
  // If already loaded, return immediately
  if (embeddingPipeline) {
    return embeddingPipeline;
  }
  
  // If currently loading, wait for the existing load to complete
  if (isLoading && loadingPromise) {
    await loadingPromise;
    return embeddingPipeline;
  }
  
  // Start loading
  isLoading = true;
  console.log('📦 Loading embedding model for the first time...');
  
  loadingPromise = (async () => {
    try {
      const { pipeline } = await loadTransformers();
      embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL);
      console.log('✅ Embedding model loaded successfully!');
    } finally {
      isLoading = false;
    }
  })();
  
  await loadingPromise;
  return embeddingPipeline;
};

/**
 * Generate embedding using local Transformers.js (FREE & OFFLINE)
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - Array of numbers (embedding vector)
 */
const generateEmbedding = async (text) => {
  try {
    // Get the pipeline (loads model on first call, then uses cache)
    const pipe = await getEmbeddingPipeline();
    
    // Generate embedding with mean pooling and normalization
    const output = await pipe(text.trim(), { 
      pooling: 'mean',
      normalize: true 
    });
    
    // Convert tensor to array
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embedding for a product (combines name, description, category, etc.)
 * @param {Object} product - Product object
 * @returns {Promise<number[]>} - Embedding vector
 */
const generateProductEmbedding = async (product) => {
  // Combine product fields into a single text for embedding
  const text = [
    product.name || '',
    product.description || '',
    product.category || '',
    product.brand || '',
    (product.tags || []).join(' ')
  ].filter(Boolean).join(' ');

  return generateEmbedding(text);
};

/**
 * Get embedding dimensions for the current model
 * @returns {number} - Number of dimensions
 */
const getEmbeddingDimensions = () => {
  // all-MiniLM-L6-v2 produces 384-dimensional embeddings
  return 384;
};

module.exports = {
  generateEmbedding,
  generateProductEmbedding,
  getEmbeddingDimensions
};
