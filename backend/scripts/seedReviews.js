require('dotenv').config();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    trim: true,
    default: 'Anonymous'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: null,
    index: true
  },
  sentimentScore: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  sentimentInsights: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  tags: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema, 'reviews');
const Product = mongoose.model('Product', productSchema, 'products');

const sampleReviews = [
  {
    userName: 'John Doe',
    rating: 5,
    comment: 'Absolutely love this product! The quality is outstanding and it exceeded my expectations. Highly recommend to everyone!',
    sentiment: 'positive',
    sentimentScore: 0.95,
    isVerified: true
  },
  {
    userName: 'Sarah Smith',
    rating: 4,
    comment: 'Great product overall. Works well and looks good. The only minor issue is the packaging could be better.',
    sentiment: 'positive',
    sentimentScore: 0.75,
    isVerified: true
  },
  {
    userName: 'Mike Johnson',
    rating: 1,
    comment: 'Very disappointed with this purchase. The product broke after just one week of use. Poor quality and not worth the money.',
    sentiment: 'negative',
    sentimentScore: 0.15,
    isVerified: false
  },
  {
    userName: 'Emily Chen',
    rating: 3,
    comment: 'It\'s okay, nothing special. Does the job but I expected more for the price. Average quality.',
    sentiment: 'neutral',
    sentimentScore: 0.50,
    isVerified: true
  },
  {
    userName: 'David Wilson',
    rating: 5,
    comment: 'Best purchase I\'ve made this year! Excellent value for money. Fast shipping and perfect condition. Will buy again!',
    sentiment: 'positive',
    sentimentScore: 0.98,
    isVerified: true
  },
  {
    userName: 'Lisa Anderson',
    rating: 2,
    comment: 'Not satisfied at all. The product doesn\'t match the description. Customer service was unhelpful too.',
    sentiment: 'negative',
    sentimentScore: 0.25,
    isVerified: false
  },
  {
    userName: 'Robert Brown',
    rating: 4,
    comment: 'Good product with nice features. Easy to use and reliable. Would recommend to friends.',
    sentiment: 'positive',
    sentimentScore: 0.80,
    isVerified: true
  },
  {
    userName: 'Anonymous',
    rating: 3,
    comment: 'The product is fine. It works as described but nothing exceptional. Decent for the price.',
    sentiment: 'neutral',
    sentimentScore: 0.55,
    isVerified: false
  },
  {
    userName: 'Jennifer Lee',
    rating: 5,
    comment: 'Amazing quality! Very happy with my purchase. The product arrived quickly and works perfectly. Five stars!',
    sentiment: 'positive',
    sentimentScore: 0.92,
    isVerified: true
  },
  {
    userName: 'Guest User',
    rating: 2,
    comment: 'Had high hopes but was let down. The product feels cheap and doesn\'t last long. Would not recommend.',
    sentiment: 'negative',
    sentimentScore: 0.20,
    isVerified: false
  },
  {
    userName: 'Tom Harris',
    rating: 4,
    comment: 'Pretty good product overall. Good value and quality. Minor improvements could be made but satisfied with purchase.',
    sentiment: 'positive',
    sentimentScore: 0.70,
    isVerified: true
  },
  {
    userName: 'Anonymous',
    rating: 1,
    comment: 'Terrible experience. Product was damaged on arrival and customer service refused to help. Very disappointed.',
    sentiment: 'negative',
    sentimentScore: 0.10,
    isVerified: false
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({ isActive: true }).limit(3);

    if (products.length === 0) {
      console.log('No products found. Please run seed.js first to create products.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Found ${products.length} products. Seeding reviews...`);

    await Review.deleteMany({});

    const reviewsToInsert = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const reviewsForProduct = sampleReviews.slice(i * 4, (i + 1) * 4);

      for (const reviewData of reviewsForProduct) {
        reviewsToInsert.push({
          ...reviewData,
          productId: product._id,
          userId: reviewData.isVerified ? new mongoose.Types.ObjectId() : null,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    await Review.insertMany(reviewsToInsert);
    console.log(`Inserted ${reviewsToInsert.length} reviews.`);

    for (const product of products) {
      const reviews = await Review.find({ productId: product._id, isActive: true });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      await Product.findByIdAndUpdate(product._id, {
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: reviews.length
      });
    }

    console.log('Updated product ratings and review counts.');
    console.log('Review seeding completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding reviews:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
})();

