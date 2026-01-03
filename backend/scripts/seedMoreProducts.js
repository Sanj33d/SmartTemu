// Enhanced seeder: Generates more products for testing recommendations
require('dotenv').config();
const mongoose = require('mongoose');

// Product templates with variety for better recommendations
const productTemplates = [
  // Electronics - Laptops
  { name: 'Gaming Laptop', description: 'RTX 4060, 16GB RAM, 512GB SSD, 144Hz display', price: 1299.99, category: 'Electronics', brand: 'Acer', tags: ['laptop', 'gaming', 'computer', 'rtx'] },
  { name: 'Business Laptop', description: 'Intel i7, 16GB RAM, 512GB SSD, lightweight design', price: 999.99, category: 'Electronics', brand: 'Dell', tags: ['laptop', 'business', 'portable'] },
  { name: 'Ultrabook', description: 'Thin and light 13-inch laptop with long battery life', price: 1199.99, category: 'Electronics', brand: 'HP', tags: ['laptop', 'ultrabook', 'portable'] },
  { name: 'Budget Laptop', description: 'Entry-level laptop perfect for students and basic tasks', price: 399.99, category: 'Electronics', brand: 'Lenovo', tags: ['laptop', 'budget', 'student'] },
  
  // Electronics - Headphones
  { name: 'Noise-Cancelling Headphones', description: 'Over-ear ANC Bluetooth headphones with 30hr battery', price: 249.99, category: 'Electronics', brand: 'SoundMax', tags: ['headphones', 'audio', 'wireless', 'anc'] },
  { name: 'Gaming Headset', description: '7.1 surround sound gaming headset with RGB lighting', price: 89.99, category: 'Electronics', brand: 'GameAudio', tags: ['headphones', 'gaming', 'audio'] },
  { name: 'Wireless Earbuds', description: 'True wireless earbuds with noise cancellation', price: 129.99, category: 'Electronics', brand: 'SoundMax', tags: ['earbuds', 'wireless', 'audio'] },
  { name: 'Studio Headphones', description: 'Professional studio monitoring headphones', price: 199.99, category: 'Electronics', brand: 'AudioPro', tags: ['headphones', 'studio', 'professional'] },
  
  // Electronics - Audio
  { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker with bass boost', price: 79.99, category: 'Electronics', brand: 'SoundBlast', tags: ['speaker', 'audio', 'portable', 'bluetooth'] },
  { name: 'Smart Speaker', description: 'Voice-controlled smart speaker with Alexa', price: 99.99, category: 'Electronics', brand: 'TechHome', tags: ['speaker', 'smart', 'alexa', 'voice'] },
  { name: 'Soundbar', description: '5.1 channel soundbar for TV with subwoofer', price: 299.99, category: 'Electronics', brand: 'AudioPro', tags: ['speaker', 'soundbar', 'tv', 'audio'] },
  
  // Electronics - Peripherals
  { name: 'Wireless Mouse', description: 'Ergonomic 2.4GHz wireless mouse with precision sensor', price: 19.99, category: 'Electronics', brand: 'LogiTech', tags: ['mouse', 'wireless', 'peripherals'] },
  { name: 'Gaming Mouse', description: 'RGB gaming mouse with 16000 DPI sensor', price: 59.99, category: 'Electronics', brand: 'GameTech', tags: ['mouse', 'gaming', 'rgb'] },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', price: 129.99, category: 'Electronics', brand: 'KeyMaster', tags: ['keyboard', 'mechanical', 'rgb', 'gaming'] },
  { name: 'Wireless Keyboard', description: 'Slim wireless keyboard for office and home', price: 49.99, category: 'Electronics', brand: 'LogiTech', tags: ['keyboard', 'wireless', 'office'] },
  { name: 'Webcam', description: '1080p HD webcam with auto-focus and microphone', price: 69.99, category: 'Electronics', brand: 'CamTech', tags: ['webcam', 'video', 'conference'] },
  
  // Electronics - Mobile
  { name: 'Smartphone Case', description: 'Shockproof case for iPhone 15 with screen protector', price: 24.99, category: 'Accessories', brand: 'GuardPro', tags: ['case', 'iphone', 'accessories', 'protection'] },
  { name: 'Phone Stand', description: 'Adjustable phone stand for desk and car', price: 12.99, category: 'Accessories', brand: 'StandPro', tags: ['stand', 'phone', 'accessories'] },
  { name: 'Wireless Charger', description: 'Fast wireless charging pad for smartphones', price: 29.99, category: 'Accessories', brand: 'ChargeTech', tags: ['charger', 'wireless', 'charging'] },
  { name: 'Power Bank', description: '20000mAh portable power bank with fast charging', price: 39.99, category: 'Accessories', brand: 'PowerMax', tags: ['powerbank', 'charging', 'portable'] },
  
  // Home & Kitchen
  { name: 'Coffee Mug', description: 'Ceramic mug 350ml with ergonomic handle', price: 5.99, category: 'Home', brand: 'Mugify', tags: ['mug', 'kitchen', 'coffee'] },
  { name: 'Electric Kettle', description: '1.7L stainless steel electric kettle with auto-shutoff', price: 59.99, category: 'Home Appliances', brand: 'HeatWave', tags: ['kettle', 'kitchen', 'appliance'] },
  { name: 'Coffee Maker', description: '12-cup programmable coffee maker with timer', price: 89.99, category: 'Home Appliances', brand: 'BrewMaster', tags: ['coffee', 'maker', 'appliance'] },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness and color temperature', price: 45.00, category: 'Home', brand: 'BrightLite', tags: ['lamp', 'lighting', 'office', 'led'] },
  { name: 'Table Lamp', description: 'Modern table lamp with touch dimmer', price: 35.99, category: 'Home', brand: 'BrightLite', tags: ['lamp', 'lighting', 'home'] },
  { name: 'Throw Pillow', description: 'Decorative throw pillow with soft cover', price: 19.99, category: 'Home', brand: 'ComfortHome', tags: ['pillow', 'decor', 'home'] },
  { name: 'Wall Clock', description: 'Silent wall clock with modern design', price: 24.99, category: 'Home', brand: 'TimeStyle', tags: ['clock', 'wall', 'decor'] },
  
  // Fitness & Sports
  { name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat 6mm thick', price: 39.99, category: 'Fitness', brand: 'FlexFit', tags: ['yoga', 'fitness', 'exercise', 'mat'] },
  { name: 'Running Shoes', description: 'Lightweight breathable running shoes with cushioned sole', price: 89.99, category: 'Footwear', brand: 'Stride', tags: ['shoes', 'running', 'sports'] },
  { name: 'Gym Bag', description: 'Large gym bag with multiple compartments and shoe pocket', price: 49.99, category: 'Fitness', brand: 'FitGear', tags: ['bag', 'gym', 'fitness'] },
  { name: 'Dumbbells Set', description: 'Adjustable dumbbells set 5-25kg per dumbbell', price: 149.99, category: 'Fitness', brand: 'FitGear', tags: ['weights', 'dumbbells', 'fitness'] },
  { name: 'Resistance Bands', description: 'Set of 5 resistance bands with different resistance levels', price: 24.99, category: 'Fitness', brand: 'FlexFit', tags: ['bands', 'resistance', 'fitness'] },
  { name: 'Foam Roller', description: 'High-density foam roller for muscle recovery', price: 29.99, category: 'Fitness', brand: 'FlexFit', tags: ['foam', 'roller', 'recovery'] },
  { name: 'Water Bottle', description: 'Insulated stainless steel water bottle 1L', price: 19.99, category: 'Fitness', brand: 'Hydrate', tags: ['bottle', 'water', 'fitness'] },
  
  // Clothing
  { name: 'Cotton T-Shirt', description: '100% cotton comfortable t-shirt in various colors', price: 14.99, category: 'Clothing', brand: 'ComfortWear', tags: ['tshirt', 'clothing', 'cotton'] },
  { name: 'Hoodie', description: 'Warm fleece hoodie with front pocket', price: 39.99, category: 'Clothing', brand: 'ComfortWear', tags: ['hoodie', 'clothing', 'warm'] },
  { name: 'Jeans', description: 'Classic fit jeans with stretch fabric', price: 49.99, category: 'Clothing', brand: 'DenimStyle', tags: ['jeans', 'clothing', 'pants'] },
  { name: 'Sneakers', description: 'Casual sneakers with comfortable sole', price: 69.99, category: 'Footwear', brand: 'Stride', tags: ['shoes', 'sneakers', 'casual'] },
  
  // Books & Media
  { name: 'Programming Book', description: 'Complete guide to JavaScript programming', price: 29.99, category: 'Books', brand: 'TechBooks', tags: ['book', 'programming', 'javascript'] },
  { name: 'Cookbook', description: '100 easy recipes for beginners', price: 19.99, category: 'Books', brand: 'CookBooks', tags: ['book', 'cooking', 'recipes'] },
  { name: 'Notebook', description: 'Hardcover notebook with lined pages', price: 9.99, category: 'Stationery', brand: 'WriteWell', tags: ['notebook', 'writing', 'stationery'] },
  
  // More Electronics
  { name: 'USB-C Cable', description: 'Fast charging USB-C cable 2m length', price: 12.99, category: 'Accessories', brand: 'CableTech', tags: ['cable', 'usb', 'charging'] },
  { name: 'HDMI Cable', description: 'High-speed HDMI cable 4K support 2m', price: 15.99, category: 'Accessories', brand: 'CableTech', tags: ['cable', 'hdmi', 'video'] },
  { name: 'USB Hub', description: '4-port USB 3.0 hub with power adapter', price: 24.99, category: 'Accessories', brand: 'HubTech', tags: ['hub', 'usb', 'accessories'] },
  { name: 'External Hard Drive', description: '1TB portable external hard drive USB 3.0', price: 59.99, category: 'Electronics', brand: 'StorageTech', tags: ['storage', 'harddrive', 'external'] },
  { name: 'USB Flash Drive', description: '128GB USB 3.0 flash drive', price: 19.99, category: 'Electronics', brand: 'StorageTech', tags: ['usb', 'flash', 'storage'] },
  
  // More Home Items
  { name: 'Bed Sheets Set', description: 'Cotton bed sheets set with pillowcases', price: 39.99, category: 'Home', brand: 'ComfortHome', tags: ['sheets', 'bedding', 'home'] },
  { name: 'Towel Set', description: 'Soft bath towel set 4 pieces', price: 29.99, category: 'Home', brand: 'ComfortHome', tags: ['towels', 'bath', 'home'] },
  { name: 'Storage Baskets', description: 'Set of 3 decorative storage baskets', price: 24.99, category: 'Home', brand: 'OrganizeHome', tags: ['storage', 'baskets', 'organization'] },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Minimal product schema
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
      isActive: { type: Boolean, default: true },
      image: { type: String, default: '' }
    }, { timestamps: true });

    const Product = mongoose.model('Product', productSchema, 'products');

    // Check if products already exist
    const existingCount = await Product.countDocuments({ isActive: true });
    console.log(`📦 Found ${existingCount} existing products`);

    // Generate products with random stock and ratings
    const productsToInsert = productTemplates.map(template => ({
      ...template,
      stock: Math.floor(Math.random() * 200) + 10, // Random stock 10-210
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Random rating 3.0-5.0
      reviewsCount: Math.floor(Math.random() * 50) + 5, // Random reviews 5-55
      isActive: true
    }));

    // Insert new products (won't duplicate if run multiple times due to unique names)
    let inserted = 0;
    let skipped = 0;
    const skippedNames = [];
    
    for (const product of productsToInsert) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        inserted++;
      } else {
        skipped++;
        skippedNames.push(product.name);
      }
    }

    console.log(`✅ Added ${inserted} new products`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped ${skipped} products (already exist): ${skippedNames.slice(0, 5).join(', ')}${skippedNames.length > 5 ? '...' : ''}`);
    }
    console.log(`📊 Total products now: ${await Product.countDocuments({ isActive: true })}`);

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
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    if (stats[0]) {
      console.log('\n📊 Database Statistics:');
      console.log(`Total Products: ${stats[0].total}`);
      console.log(`Categories: ${stats[0].categories.length} (${stats[0].categories.join(', ')})`);
      console.log(`Price Range: $${stats[0].minPrice.toFixed(2)} - $${stats[0].maxPrice.toFixed(2)}`);
      console.log(`Average Price: $${stats[0].avgPrice.toFixed(2)}`);
    }

    console.log('\n💡 Next Step:');
    console.log('   Run "node scripts/syncProductsToQdrant.js" to sync all products to Qdrant');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();

