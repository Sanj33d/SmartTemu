const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

require('dotenv').config();
const connectDB = require('./config/database');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require('./routes/productRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

app.use('/api/products', productRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);

const uri = `${process.env.MONGODB_URI}`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
  });

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// module.exports = app;



// app.use(express.urlencoded({ extended: true }));

// connectDB();

// const productRoutes = require('./routes/productRoutes');
// app.use('/api/products', productRoutes);

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         success: false,
//         message: 'Something went wrong!',
//         error: process.env.NODE_ENV === 'development' ? err.message: {}
//     });
// });


// Health check
// app.get('/api/health', (req, res) => {
//     res.json({ status: 'OK' });
//   });

// app.use((req, res, next) => {
//     res.status(404).json({
//         success: false,
//         message: 'Route not found'
//     });
// });


