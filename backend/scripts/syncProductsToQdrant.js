// Script to sync products from MongoDB to Qdrant
// Run with: node scripts/syncProductsToQdrant.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const { initializeCollection, upsertProduct } = require('../src/services/qdrantService');
const { generateProductEmbedding } = require('../src/services/embeddingService');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const syncProducts = async () => {
  try {
    console.log('🔄 Starting product sync to Qdrant...\n');

    // Initialize Qdrant collection
    await initializeCollection();

    // Get all active products from MongoDB
    const products = await Product.find({ isActive: true });
    console.log(`📦 Found ${products.length} active products to sync\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Make sure you have products in your database.');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Process products in batches (to avoid overwhelming the API)
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (product) => {
          try {
            // Generate embedding for the product
            const embedding = await generateProductEmbedding(product);

            // Prepare payload (metadata) for Qdrant
            const payload = {
              name: product.name,
              description: product.description,
              price: product.price,
              category: product.category,
              brand: product.brand || null,
              tags: product.tags || [],
              rating: product.rating || 0,
              reviewsCount: product.reviewsCount || 0,
              stock: product.stock || 0,
              image: product.image || null,
              mongoId: product._id.toString() // Keep reference to MongoDB ID
            };

            // Upsert to Qdrant
            await upsertProduct(product._id.toString(), embedding, payload);
            
            successCount++;
            if (successCount % 10 === 0) {
              console.log(`✅ Synced ${successCount}/${products.length} products...`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error syncing product ${product._id}:`, error.message);
          }
        })
      );

      // Small delay between batches to avoid rate limiting (Hugging Face free tier)
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between batches
      }
    }

    console.log(`\n✅ Sync complete!`);
    console.log(`   Successfully synced: ${successCount} products`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} products`);
    }
    console.log(`\n💡 Products are now searchable via Qdrant vector search!`);

  } catch (error) {
    console.error('❌ Sync error:', error.message);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await syncProducts();
  await mongoose.connection.close();
  process.exit(0);
};

main();

