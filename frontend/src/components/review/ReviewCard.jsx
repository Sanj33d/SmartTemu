import SentimentBadge from './SentimentBadge';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <input
        key={index}
        type="radio"
        name={`rating-${review._id}`}
        className="mask mask-star-2 bg-yellow-400"
        checked={index < rating}
        readOnly
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">
                  {review.userName || 'Anonymous'}
                </span>
                {review.userId ? (
                  <span className="badge badge-success badge-sm">Verified</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Guest</span>
                )}
              </div>
              <div className="rating rating-sm mt-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm text-base-content/70">
                  {review.rating}/5
                </span>
              </div>
            </div>
          </div>
          <SentimentBadge sentiment={review.sentiment} score={review.sentimentScore} />
        </div>

        <p className="text-base-content/80 mt-2">{review.comment}</p>

        <div className="card-actions justify-end mt-3">
          <span className="text-xs text-base-content/50">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

