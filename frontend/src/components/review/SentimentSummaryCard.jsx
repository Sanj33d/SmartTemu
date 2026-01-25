import SentimentBadge from './SentimentBadge';

const SentimentSummaryCard = ({ summary, statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl border-2 border-primary/30">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="text-lg">Analyzing sentiment...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!summary && !statistics) {
    return null;
  }

  const { total, positive, negative, neutral, averageRating, averageSentimentScore } = statistics || {};

  const getPercentage = (value) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl border-2 border-primary/30">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h2 className="card-title text-2xl">AI Sentiment Analysis</h2>
        </div>

        {summary && (
          <div className="bg-base-100 rounded-lg p-4 mb-4 border border-base-300">
            <p className="text-base leading-relaxed">{summary}</p>
          </div>
        )}

        {statistics && total > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat bg-base-100 rounded-lg p-4 shadow-sm">
                <div className="stat-title text-xs">Total Reviews</div>
                <div className="stat-value text-2xl">{total}</div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4 shadow-sm">
                <div className="stat-title text-xs">Avg Rating</div>
                <div className="stat-value text-2xl">{averageRating?.toFixed(1) || '0.0'}</div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4 shadow-sm">
                <div className="stat-title text-xs">Sentiment Score</div>
                <div className="stat-value text-2xl">
                  {averageSentimentScore ? Math.round(averageSentimentScore * 100) : 0}%
                </div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4 shadow-sm">
                <div className="stat-title text-xs">Positive Rate</div>
                <div className="stat-value text-2xl text-success">{getPercentage(positive)}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment="positive" size="sm" />
                    <span className="text-sm font-medium">{positive} reviews</span>
                  </div>
                  <span className="text-sm text-base-content/70">{getPercentage(positive)}%</span>
                </div>
                <progress
                  className="progress progress-success h-2"
                  value={getPercentage(positive)}
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment="neutral" size="sm" />
                    <span className="text-sm font-medium">{neutral} reviews</span>
                  </div>
                  <span className="text-sm text-base-content/70">{getPercentage(neutral)}%</span>
                </div>
                <progress
                  className="progress progress-info h-2"
                  value={getPercentage(neutral)}
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment="negative" size="sm" />
                    <span className="text-sm font-medium">{negative} reviews</span>
                  </div>
                  <span className="text-sm text-base-content/70">{getPercentage(negative)}%</span>
                </div>
                <progress
                  className="progress progress-error h-2"
                  value={getPercentage(negative)}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        )}

        {(!statistics || total === 0) && (
          <div className="text-center py-8 text-base-content/60">
            <p>No reviews available yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentSummaryCard;

