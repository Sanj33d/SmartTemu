import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { createReview } from '../../services/reviewService';
import SentimentBadge from './SentimentBadge';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedSentiment, setSubmittedSentiment] = useState(null);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittedSentiment(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        productId,
        rating,
        comment: comment.trim(),
      };

      if (user) {
        reviewData.userId = user.uid;
        reviewData.userName = user.displayName || user.email?.split('@')[0] || 'User';
      } else {
        reviewData.userName = guestName.trim() || null;
      }

      const response = await createReview(reviewData);

      if (response.success) {
        setSubmittedSentiment(response.data.review.sentiment);
        setRating(0);
        setComment('');
        setGuestName('');
        
        setTimeout(() => {
          if (onReviewSubmitted) {
            onReviewSubmitted();
          }
          setSubmittedSentiment(null);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleRatingClick(value)}
          className={`mask mask-star-2 transition-all ${
            value <= rating
              ? 'bg-yellow-400 scale-110'
              : 'bg-gray-300 hover:bg-yellow-200'
          }`}
          disabled={isSubmitting}
        />
      );
    });
  };

  return (
    <div className="card bg-base-100 shadow-lg border-2 border-primary/20">
      <div className="card-body">
        <h3 className="card-title text-xl mb-4">Write a Review</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Name (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={isSubmitting}
              />
              <label className="label">
                <span className="label-text-alt">Leave empty to post as Anonymous</span>
              </label>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Rating</span>
            </label>
            <div className="rating rating-lg gap-1">
              {renderStars()}
            </div>
            {rating > 0 && (
              <label className="label">
                <span className="label-text-alt">Selected: {rating} out of 5</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Your Review</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <label className="label">
              <span className="label-text-alt">
                {comment.length}/1000 characters
              </span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {submittedSentiment && (
            <div className="alert alert-success">
              <span>Review submitted successfully! </span>
              <SentimentBadge sentiment={submittedSentiment} />
            </div>
          )}

          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? 'Analyzing Sentiment...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;

