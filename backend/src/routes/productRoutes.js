const express = require('express');
const router = express.Router();

const {searchProducts, compareProducts} = require('../controllers/productController');

router.get('/search', searchProducts);
router.get('/compare', compareProducts);
router.post('/compare', compareProducts);

module.exports = router;