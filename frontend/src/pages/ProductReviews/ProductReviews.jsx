import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewCard from '../../components/review/ReviewCard';
import SentimentSummaryCard from '../../components/review/SentimentSummaryCard';
import {
  getProductReviews,
  getSentimentSummary,
} from '../../services/reviewService';

const ProductReviews = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchReviews = async (sentiment = 'all', page = 1) => {
    try {
      setIsLoading(true);
      const response = await getProductReviews(productId, {
        page,
        limit: 10,
        sentiment: sentiment === 'all' ? undefined : sentiment,
      });

      if (response.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentimentSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const response = await getSentimentSummary(productId);

      if (response.success) {
        setSentimentSummary(response.data.summary);
        setStatistics(response.data.statistics);
      }
    } catch (err) {
      console.error('Failed to load sentiment summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(selectedSentiment, currentPage);
      fetchSentimentSummary();
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      setCurrentPage(1);
      fetchReviews(selectedSentiment, 1);
    }
  }, [selectedSentiment]);

  const handleReviewSubmitted = () => {
    fetchReviews(selectedSentiment, currentPage);
    fetchSentimentSummary();
  };

  const handleSentimentFilter = (sentiment) => {
    setSelectedSentiment(sentiment);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(selectedSentiment, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!productId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Invalid product ID</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Product Reviews</h1>
        <p className="text-base-content/70">
          Product ID: <span className="font-mono text-sm">{productId}</span>
        </p>
      </div>

      <div className="space-y-6">
        <SentimentSummaryCard
          summary={sentimentSummary}
          statistics={statistics}
          isLoading={isLoadingSummary}
        />

        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">
                Reviews
                {pagination && (
                  <span className="text-lg font-normal text-base-content/70 ml-2">
                    ({pagination.total})
                  </span>
                )}
              </h2>

              <div className="flex gap-2">
                <button
                  className={`btn btn-sm ${
                    selectedSentiment === 'all'
                      ? 'btn-primary'
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleSentimentFilter('all')}
                >
                  All
                </button>
                <button
                  className={`btn btn-sm ${
                    selectedSentiment === 'positive'
                      ? 'btn-success'
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleSentimentFilter('positive')}
                >
                  Positive
                </button>
                <button
                  className={`btn btn-sm ${
                    selectedSentiment === 'neutral'
                      ? 'btn-info'
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleSentimentFilter('neutral')}
                >
                  Neutral
                </button>
                <button
                  className={`btn btn-sm ${
                    selectedSentiment === 'negative'
                      ? 'btn-error'
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleSentimentFilter('negative')}
                >
                  Negative
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                <p className="text-lg">No reviews found.</p>
                <p className="text-sm mt-2">
                  {selectedSentiment !== 'all'
                    ? `No ${selectedSentiment} reviews available.`
                    : 'Be the first to review this product!'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="join">
                      <button
                        className="join-item btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        «
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.pages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, index, array) => (
                          <div key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <button className="join-item btn btn-disabled">
                                ...
                              </button>
                            )}
                            <button
                              className={`join-item btn ${
                                currentPage === page ? 'btn-active' : ''
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                      <button
                        className="join-item btn"
                        disabled={currentPage === pagination.pages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

