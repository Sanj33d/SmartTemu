const SentimentBadge = ({ sentiment, score = null, size = 'md' }) => {
  const getSentimentConfig = () => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          label: 'Positive',
          className: 'badge-success',
          icon: '✓',
        };
      case 'negative':
        return {
          label: 'Negative',
          className: 'badge-error',
          icon: '✗',
        };
      case 'neutral':
        return {
          label: 'Neutral',
          className: 'badge-info',
          icon: '○',
        };
      default:
        return {
          label: 'Unknown',
          className: 'badge-ghost',
          icon: '?',
        };
    }
  };

  const config = getSentimentConfig();
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

  return (
    <div className={`badge ${config.className} ${sizeClass} gap-1`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {score !== null && (
        <span className="text-xs opacity-75">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  );
};

export default SentimentBadge;

