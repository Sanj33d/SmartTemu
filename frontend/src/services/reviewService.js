const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create review');
    }

    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

const getProductReviews = async (productId, options = {}) => {
  try {
    const { page = 1, limit = 10, sentiment } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (sentiment) {
      params.append('sentiment', sentiment);
    }

    const response = await fetch(
      `${API_BASE_URL}/reviews/product/${productId}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reviews');
    }

    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

const getSentimentSummary = async (productId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews/product/${productId}/sentiment`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch sentiment summary');
    }

    return data;
  } catch (error) {
    console.error('Error fetching sentiment summary:', error);
    throw error;
  }
};

const getReviewSentiment = async (reviewId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews/${reviewId}/sentiment`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch review sentiment');
    }

    return data;
  } catch (error) {
    console.error('Error fetching review sentiment:', error);
    throw error;
  }
};

export {
  createReview,
  getProductReviews,
  getSentimentSummary,
  getReviewSentiment,
};

