// Product Controller - Search Functionality
const Product = require('../models/Product');
const mongoose = require('mongoose');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const searchProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { q, category, minPrice, maxPrice, page = 1, limit = 10, sort } = req.query;

    
    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption = {_id: -1};
    
    if (sort === 'price-asc') {
      sortOption = {price: 1};}
    
    if (sort === 'price-desc') {
      sortOption = {price: -1};
    }

    if (sort === 'name_asc') {
      sortOption = {name: 1};
    }

    if (sort === 'name_desc') {
      sortOption = {name: -1};
    }


    // Build search query
    const query = {
      isActive: true
    };
    
    // Add text search using regex
    if (q) {
      const escapedQuery = escapeRegExp(q);
      const regex = new RegExp(escapedQuery, 'i'); 
      
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { brand: regex },
        { tags: regex }
      ];
    }
    
    // Add category filter
    if (category) {
      const escapedCategory = escapeRegExp(category);
      query.category = new RegExp(`^${escapedCategory}$`, "i");
    }
    
    // Add price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }
    
    // Execute search with pagination
    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort(sortOption);
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    // Return response
    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

const compareProducts = async (req, res) => {
  try {
    // Extract product IDs from query params or request body
    let productIds = [];
    
    if (req.query.ids) {
      // GET /api/products/compare?ids=id1,id2,id3
      productIds = req.query.ids.split(',').map(id => id.trim());
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      // POST /api/products/compare with { ids: ["id1", "id2", "id3"] }
      productIds = req.body.ids;
    } else if (req.body.productIds && Array.isArray(req.body.productIds)) {
      // Alternative: POST with { productIds: ["id1", "id2", "id3"] }
      productIds = req.body.productIds;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required. Provide ids as query parameter (comma-separated) or in request body as array.'
      });
    }

    // Validate product IDs
    if (productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product ID is required'
      });
    }

    // Limit comparison to 2-5 products
    const MIN_PRODUCTS = 2;
    const MAX_PRODUCTS = 5;

    if (productIds.length < MIN_PRODUCTS) {
      return res.status(400).json({
        success: false,
        message: `At least ${MIN_PRODUCTS} products are required for comparison`
      });
    }

    if (productIds.length > MAX_PRODUCTS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_PRODUCTS} products can be compared at once`
      });
    }

    // Validate MongoDB ObjectId format
    const validIds = [];
    const invalidIds = [];

    for (const id of productIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validIds.push(new mongoose.Types.ObjectId(id));
      } else {
        invalidIds.push(id);
      }
    }

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        invalidIds
      });
    }

    // Remove duplicates
    const uniqueIds = [...new Set(validIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

    if (uniqueIds.length < MIN_PRODUCTS) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate product IDs detected. Please provide unique products for comparison'
      });
    }

    // Fetch products from database
    const products = await Product.find({
      _id: { $in: uniqueIds },
      isActive: true
    }).select('name description price category brand tags image stock rating reviewsCount createdAt updatedAt');

    // Check if all requested products were found
    const foundIds = products.map(p => p._id.toString());
    const missingIds = uniqueIds
      .map(id => id.toString())
      .filter(id => !foundIds.includes(id));

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active products found with the provided IDs'
      });
    }

    if (missingIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: 'Some products were not found or are inactive',
        missingIds,
        foundProducts: products.length
      });
    }

    // Sort products to match the order of requested IDs
    const sortedProducts = uniqueIds
      .map(id => products.find(p => p._id.toString() === id.toString()))
      .filter(p => p !== undefined);

    // Calculate comparison metrics
    const prices = sortedProducts.map(p => p.price);
    const ratings = sortedProducts.map(p => p.rating);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // Find best value (price/rating ratio)
    const valueRatios = sortedProducts.map(p => ({
      productId: p._id.toString(),
      value: p.rating > 0 ? p.price / p.rating : Infinity
    }));
    const bestValue = valueRatios.reduce((best, current) => 
      current.value < best.value ? current : best
    );

    // Prepare response data
    const comparisonData = sortedProducts.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || 'N/A',
      tags: product.tags || [],
      image: product.image || '',
      stock: product.stock,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      inStock: product.stock > 0,
      isBestPrice: product.price === minPrice,
      isBestRating: product.rating === maxRating,
      isBestValue: product._id.toString() === bestValue.productId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    // Return response
    res.status(200).json({
      success: true,
      data: {
        products: comparisonData,
        summary: {
          totalProducts: comparisonData.length,
          priceRange: {
            min: minPrice,
            max: maxPrice,
            average: parseFloat(avgPrice.toFixed(2))
          },
          ratingRange: {
            min: minRating,
            max: maxRating,
            average: parseFloat(avgRating.toFixed(2))
          },
          bestValueProductId: bestValue.productId
        }
      }
    });

  } catch (error) {
    console.error('Product comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing products',
      error: error.message
    });
  }
};

module.exports = {
  searchProducts,
  compareProducts
};