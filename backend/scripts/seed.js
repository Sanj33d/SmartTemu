// Temporary seeder: self-contained, doesn't rely on your app files
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Minimal product shape for testing
    const productSchema = new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      category: String,
      brand: String,
      tags: [String],
      stock: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    // Text index so your /search works well
    productSchema.index({
      name: 'text',
      description: 'text',
      category: 'text',
      brand: 'text',
      tags: 'text'
    });

    const Product = mongoose.model('Product', productSchema, 'products');

    // Clear existing for repeatable testing
    await Product.deleteMany({});

    // Insert dummy products with stock (ratings will be set by seedReviews.js)
    await Product.insertMany([
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic 2.4GHz wireless mouse',
        price: 19.99,
        category: 'Electronics',
        brand: 'LogiTech',
        tags: ['mouse', 'wireless', 'peripherals'],
        stock: 150,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Gaming Laptop',
        description: 'RTX 4060, 16GB RAM, 512GB SSD',
        price: 1299.99,
        category: 'Electronics',
        brand: 'Acer',
        tags: ['laptop', 'gaming', 'computer'],
        stock: 25,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Coffee Mug',
        description: 'Ceramic mug 350ml',
        price: 5.99,
        category: 'Home',
        brand: 'Mugify',
        tags: ['mug', 'kitchen'],
        stock: 300,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Noise-Cancelling Headphones',
        description: 'Over-ear ANC Bluetooth headphones',
        price: 249.99,
        category: 'Electronics',
        brand: 'SoundMax',
        tags: ['headphones', 'audio', 'wireless'],
        stock: 45,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Smartphone Case',
        description: 'Shockproof case for iPhone 15',
        price: 24.99,
        category: 'Accessories',
        brand: 'GuardPro',
        tags: ['case', 'iphone', 'accessories'],
        stock: 200,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip eco-friendly yoga mat',
        price: 39.99,
        category: 'Fitness',
        brand: 'FlexFit',
        tags: ['yoga', 'fitness', 'exercise'],
        stock: 80,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight breathable running shoes',
        price: 89.99,
        category: 'Footwear',
        brand: 'Stride',
        tags: ['shoes', 'running', 'sports'],
        stock: 65,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 45.00,
        category: 'Home',
        brand: 'BrightLite',
        tags: ['lamp', 'lighting', 'office'],
        stock: 90,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Electric Kettle',
        description: '1.7L stainless steel electric kettle',
        price: 59.99,
        category: 'Home Appliances',
        brand: 'HeatWave',
        tags: ['kettle', 'kitchen', 'appliance'],
        stock: 55,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker',
        price: 79.99,
        category: 'Electronics',
        brand: 'SoundBlast',
        tags: ['speaker', 'audio', 'portable'],
        stock: 70,
        rating: 0,
        reviewsCount: 0,
        isActive: true
      }
    ]);

    console.log('✅ Seeded 10 test products successfully!');
    
    // Show statistics
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);
    
    const categories = await Product.distinct('category');
    
    console.log('\n📊 Database Statistics:');
    console.log(`Total Products: ${stats[0].total}`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Price Range: $${stats[0].minPrice.toFixed(2)} - $${stats[0].maxPrice.toFixed(2)}`);
    console.log(`Average Price: $${stats[0].avgPrice.toFixed(2)}`);
    console.log(`Total Stock: ${stats[0].totalStock} items`);
    
    console.log('\n💬 Your chatbot can now answer queries about these products!');
    console.log('\n📝 Next Step (Recommended):');
    console.log('   Run "node scripts/seedReviews.js" to add reviews and ratings to the first 3 products');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();