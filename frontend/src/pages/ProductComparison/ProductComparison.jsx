import { useState, useEffect } from 'react';
import { compareProducts, getAllProducts } from '../../services/comparisonService';

const ProductComparison = () => {
  const [productIds, setProductIds] = useState(['', '', '']);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Fetch available products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.success) {
          setAvailableProducts(response.data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleProductIdChange = (index, value) => {
    const newIds = [...productIds];
    newIds[index] = value;
    setProductIds(newIds);
    setError('');
  };

  const addProductField = () => {
    if (productIds.length < 5) {
      setProductIds([...productIds, '']);
    }
  };

  const removeProductField = (index) => {
    if (productIds.length > 2) {
      const newIds = productIds.filter((_, i) => i !== index);
      setProductIds(newIds);
    }
  };

  const handleCompare = async () => {
    const validIds = productIds.filter(id => id.trim() !== '');
    
    if (validIds.length < 2) {
      setError('Please provide at least 2 product IDs');
      return;
    }

    if (validIds.length > 5) {
      setError('Maximum 5 products can be compared');
      return;
    }

    setIsLoading(true);
    setError('');
    setComparisonData(null);

    try {
      const response = await compareProducts(validIds);
      if (response.success) {
        setComparisonData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to compare products');
    } finally {
      setIsLoading(false);
    }
  };

  const selectProduct = (index, productId) => {
    const newIds = [...productIds];
    newIds[index] = productId;
    setProductIds(newIds);
    setOpenDropdownIndex(null);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">★</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Product Comparison</h1>
        <p className="text-center text-gray-600">Compare up to 5 products side by side</p>
      </div>

      {/* Input Section */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">Enter Product IDs</h2>
          
          <div className="space-y-4">
            {productIds.map((id, index) => (
              <div key={index} className="flex gap-2 items-center">
                <label className="form-control flex-1">
                  <div className="label">
                    <span className="label-text">Product {index + 1}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter product ID"
                    className="input input-bordered w-full"
                    value={id}
                    onChange={(e) => handleProductIdChange(index, e.target.value)}
                  />
                </label>
                {availableProducts.length > 0 && (
                  <div className="dropdown dropdown-end">
                    <button
                      className="btn btn-outline btn-sm mt-6"
                      onClick={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                    >
                      Browse
                    </button>
                    {openDropdownIndex === index && (
                      <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg border max-h-60 overflow-y-auto">
                        {availableProducts.slice(0, 20).map((product) => (
                          <li key={product._id}>
                            <button
                              onClick={() => selectProduct(index, product._id)}
                              className="text-left"
                            >
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-gray-500">
                                  ${product.price} • {product.category}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {productIds.length > 2 && (
                  <button
                    className="btn btn-error btn-sm mt-6"
                    onClick={() => removeProductField(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            {productIds.length < 5 && (
              <button className="btn btn-outline" onClick={addProductField}>
                + Add Product
              </button>
            )}
            <button
              className="btn btn-primary flex-1"
              onClick={handleCompare}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Comparing...
                </>
              ) : (
                'Compare Products'
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Comparison Results</h2>

            {/* Summary */}
            {comparisonData.summary && (
              <div className="stats stats-vertical lg:stats-horizontal shadow mb-6 w-full">
                <div className="stat">
                  <div className="stat-title">Total Products</div>
                  <div className="stat-value text-primary">{comparisonData.summary.totalProducts}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Price Range</div>
                  <div className="stat-value text-secondary">
                    ${comparisonData.summary.priceRange.min} - ${comparisonData.summary.priceRange.max}
                  </div>
                  <div className="stat-desc">Avg: ${comparisonData.summary.priceRange.average}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Rating Range</div>
                  <div className="stat-value text-accent">
                    {comparisonData.summary.ratingRange.min.toFixed(1)} - {comparisonData.summary.ratingRange.max.toFixed(1)}
                  </div>
                  <div className="stat-desc">Avg: {comparisonData.summary.ratingRange.average.toFixed(1)}</div>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    {comparisonData.products.map((product, index) => (
                      <th key={product._id} className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                          <div className="font-bold">{product.name}</div>
                          <div className="flex gap-1 flex-wrap justify-center">
                            {product.isBestPrice && (
                              <div className="badge badge-success">Best Price</div>
                            )}
                            {product.isBestRating && (
                              <div className="badge badge-warning">Best Rating</div>
                            )}
                            {product.isBestValue && (
                              <div className="badge badge-primary">Best Value</div>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Price</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        <div className={`text-lg font-bold ${product.isBestPrice ? 'text-green-600' : ''}`}>
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Rating</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        <div className="flex justify-center">
                          {renderStars(product.rating)}
                        </div>
                        {product.isBestRating && (
                          <div className="badge badge-warning badge-sm mt-1">Best</div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Reviews</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        {product.reviewsCount}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Brand</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        {product.brand}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Category</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        <div className="badge badge-outline">{product.category}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Stock</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        {product.inStock ? (
                          <div className="badge badge-success">In Stock ({product.stock})</div>
                        ) : (
                          <div className="badge badge-error">Out of Stock</div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Description</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        <p className="text-sm text-gray-600 max-w-xs mx-auto">
                          {product.description}
                        </p>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold">Tags</td>
                    {comparisonData.products.map((product) => (
                      <td key={product._id} className="text-center">
                        <div className="flex gap-1 flex-wrap justify-center">
                          {product.tags && product.tags.length > 0 ? (
                            product.tags.slice(0, 3).map((tag, idx) => (
                              <div key={idx} className="badge badge-ghost badge-sm">
                                {tag}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No tags</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!comparisonData && !isLoading && !error && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <p className="text-gray-500">Enter product IDs above to start comparing</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;

