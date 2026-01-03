// Script to recreate Qdrant collection with correct settings
// Run with: node scripts/recreateQdrantCollection.js

require('dotenv').config();
const { qdrantClient, PRODUCTS_COLLECTION } = require('../src/config/qdrant');
const { getEmbeddingDimensions } = require('../src/services/embeddingService');

const recreateCollection = async () => {
  try {
    console.log('🔍 Checking existing collection...\n');

    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      col => col.name === PRODUCTS_COLLECTION
    );

    if (collectionExists) {
      // Get collection info
      console.log('📊 Current collection info:');
      const collectionInfo = await qdrantClient.getCollection(PRODUCTS_COLLECTION);
      console.log('Vector size:', collectionInfo.config?.params?.vectors?.size);
      console.log('Distance metric:', collectionInfo.config?.params?.vectors?.distance);
      console.log('Points count:', collectionInfo.points_count);
      console.log();

      // Delete the collection
      console.log(`🗑️  Deleting existing collection '${PRODUCTS_COLLECTION}'...`);
      await qdrantClient.deleteCollection(PRODUCTS_COLLECTION);
      console.log('✅ Collection deleted\n');
    } else {
      console.log(`ℹ️  Collection '${PRODUCTS_COLLECTION}' does not exist yet\n`);
    }

    // Create new collection with correct dimensions
    const vectorSize = getEmbeddingDimensions();
    console.log(`📦 Creating new collection with ${vectorSize} dimensions...`);

    await qdrantClient.createCollection(PRODUCTS_COLLECTION, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine' // Cosine similarity (good for text embeddings)
      },
      // Allow any string as ID (not just UUIDs)
      on_disk_payload: true
    });

    console.log(`✅ Collection '${PRODUCTS_COLLECTION}' created successfully!\n`);

    // Verify the new collection
    const newCollectionInfo = await qdrantClient.getCollection(PRODUCTS_COLLECTION);
    console.log('✅ Verification:');
    console.log('Vector size:', newCollectionInfo.config?.params?.vectors?.size);
    console.log('Distance metric:', newCollectionInfo.config?.params?.vectors?.distance);
    console.log();

    console.log('🎉 Collection is ready! You can now run the sync script.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
};

recreateCollection();

