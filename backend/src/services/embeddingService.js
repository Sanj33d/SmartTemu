// Embedding configuration
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || null; // Optional but recommended (higher rate limits)

/**
 * Generate embedding using Hugging Face Inference API (FREE)
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - Array of numbers (embedding vector)
 */
const generateEmbedding = async (text) => {
  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(HUGGINGFACE_API_KEY && { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` })
      },
      body: JSON.stringify({
        inputs: text.trim(),
        options: {
          wait_for_model: true // Wait if model is loading
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const embedding = await response.json();
    
    // Handle different response formats
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      return embedding[0]; // Sometimes returns [[...]]
    }
    if (Array.isArray(embedding)) {
      return embedding;
    }
    
    throw new Error('Unexpected embedding response format');
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    
    // If model is loading, wait a bit and retry once
    if (error.message.includes('loading') || error.message.includes('503')) {
      console.log('⏳ Model is loading, waiting 5 seconds and retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        const retryResponse = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(HUGGINGFACE_API_KEY && { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` })
          },
          body: JSON.stringify({
            inputs: text.trim(),
            options: {
              wait_for_model: true
            }
          })
        });
        
        if (retryResponse.ok) {
          const embedding = await retryResponse.json();
          if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
            return embedding[0];
          }
          if (Array.isArray(embedding)) {
            return embedding;
          }
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError.message);
      }
    }
    
    throw new Error('Failed to generate embedding');
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
  // Hugging Face model dimensions
  if (EMBEDDING_MODEL.includes('all-MiniLM-L6-v2')) return 384;
  if (EMBEDDING_MODEL.includes('all-mpnet-base-v2')) return 768;
  if (EMBEDDING_MODEL.includes('e5-small')) return 384;
  if (EMBEDDING_MODEL.includes('bge-small')) return 384;
  
  // Default for most sentence-transformers models
  return 384;
};

module.exports = {
  generateEmbedding,
  generateProductEmbedding,
  getEmbeddingDimensions
};

