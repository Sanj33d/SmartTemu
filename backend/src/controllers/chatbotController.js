//not tested yet
const Groq = require('groq-sdk');
const Product = require('../models/Product'); // Still used for metadata only
const { generateEmbedding } = require('../services/embeddingService');
const { searchSimilarProducts } = require('../services/qdrantService');

let groq = null;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
};

// Cache metadata to avoid hitting DB on every chat message
let cachedStats = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCachedMetadata = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedStats && (now - lastCacheTime < CACHE_DURATION)) {
    return cachedStats;
  }
  
  // Fetch fresh data if cache expired
  const [categories, stats, totalProducts] = await Promise.all([
    Product.distinct('category'),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]),
    Product.countDocuments({ isActive: true })
  ]);
  
  cachedStats = {
    categories,
    priceRange: stats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
    totalProducts
  };
  
  lastCacheTime = now;
  return cachedStats;
};


// Extract price filters from user query (used for both MongoDB and Qdrant flows)
const parsePriceFilters = (userQuery) => {
  let minPrice = null;
  let maxPrice = null;
  
  // Handle range queries: "between X and Y", "from X to Y", "X to Y", "X-Y"
  const betweenMatch = userQuery.match(/(?:between|from)\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)/i) ||
                        userQuery.match(/\$?(\d+)\s*(?:to|-)\s*\$?(\d+)/i);
  
  if (betweenMatch) {
    // "between 50 and 100" or "from $50 to $100" → min: 50, max: 100
    const val1 = parseFloat(betweenMatch[1]);
    const val2 = parseFloat(betweenMatch[2]);
    minPrice = Math.min(val1, val2);
    maxPrice = Math.max(val1, val2);
  } else {
    // Handle "under X" or "over Y"
    const maxPriceMatch = userQuery.match(/(?:under|below|less than|maximum|max)\s*\$?(\d+)/i);
    const minPriceMatch = userQuery.match(/(?:over|above|more than|minimum|min)\s*\$?(\d+)/i);
    
    if (maxPriceMatch) {
      maxPrice = parseFloat(maxPriceMatch[1]);
    }
    if (minPriceMatch) {
      minPrice = parseFloat(minPriceMatch[1]);
    }
  }
  
  return { minPrice, maxPrice };
};



const getProductContext = async (userQuery) => {
  try {
    const metadata = await getCachedMetadata();
    const { minPrice, maxPrice } = parsePriceFilters(userQuery);
    
    // 1) Semantic search via Qdrant (single source of truth for product matching)
    const queryEmbedding = await generateEmbedding(userQuery);
    
    // Get more candidates than we need so we can filter by price and still have results
    let candidates = await searchSimilarProducts(queryEmbedding, {
      limit: 30
    });
    
    // Apply price filters on Qdrant payload (if present)
    if (minPrice != null || maxPrice != null) {
      candidates = candidates.filter(p => {
        const price = typeof p.price === 'number' ? p.price : null;
        if (price == null) return false;
        if (minPrice != null && price < minPrice) return false;
        if (maxPrice != null && price > maxPrice) return false;
        return true;
      });
    }
    
    // Map to the format expected by the AI prompt
    const products = candidates.slice(0, 10).map(p => ({
      name: p.name,
      price: p.price,
      category: p.category,
      brand: p.brand,
      rating: p.rating,
      stock: p.stock,
      description: p.description
    }));
    
    return {
      products,
      metadata
    };
    
  } catch (error) {
    console.error('Error fetching product context:', error);
    // Return empty context on error
    const metadata = await getCachedMetadata().catch(() => ({
      categories: [],
      priceRange: { minPrice: 0, maxPrice: 0, avgPrice: 0 },
      totalProducts: 0
    }));
    
    return {
      products: [],
      metadata
    };
  }
};


const generateAIResponse = async (userQuery, context) => {
  try {
    const groqClient = getGroqClient();
    const { products, metadata } = context;
    
    // Format products into clean string for AI
    const productContext = products.length > 0
      ? products.map(p => 
          `- ${p.name}${p.brand ? ` (${p.brand})` : ''}: $${p.price} - ${p.category} - Rating: ${p.rating}/5 - ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}`
        ).join('\n')
      : 'No products found matching the query.';
    
    const systemPrompt = `You are the AI Sales Assistant for SmartTemu, an AI-powered e-commerce platform.

CONTEXT:
- Available Categories: ${metadata?.categories.join(', ') || 'N/A'}
- Total Products: ${metadata?.totalProducts || 0}
- Price Range: $${metadata?.priceRange?.minPrice?.toFixed(2) || '0'} - $${metadata?.priceRange?.maxPrice?.toFixed(2) || '0'}

USER QUERY: "${userQuery}"

RELEVANT PRODUCTS FOUND IN DATABASE:
${productContext}

INSTRUCTIONS:
1. Answer the user's question using ONLY the product data provided above.
2. If the user asks for a specific product and it's in the list, recommend it with details.
3. If the product is NOT in the list, apologize and suggest browsing available categories.
4. Be conversational, friendly, and helpful.
5. Include key details like price, category, rating, and stock status when mentioning products.
6. Keep responses concise but informative.
7. If you don't have information, say so honestly.`;

    const completion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500
    });
    
    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error generating a response. Please try again.';
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};



const handleChatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message'
      });
    }
    
    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot service is not configured. Please set GROQ_API_KEY in environment variables.'
      });
    }
    
    // Get context and generate response
    const context = await getProductContext(message);
    const response = await generateAIResponse(message, context);
    
    // Return response
    res.status(200).json({
      success: true,
      data: {
        response,
        context: {
          productsFound: context.products.length,
          categories: context.metadata?.categories || []
        }
      }
    });
    
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chatbot request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  handleChatbotMessage
};
