const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetches products for comparison
 * @param {string[]} productIds - Array of product IDs to compare
 * @returns {Promise<Object>} - The comparison data
 */
const compareProducts = async (productIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: productIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to compare products');
    }

    return data;
  } catch (error) {
    console.error('Error comparing products:', error);
    throw error;
  }
};

/**
 * Fetches all products (for selection)
 * @returns {Promise<Object>} - List of products
 */
const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?limit=50`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export { compareProducts, getAllProducts };

