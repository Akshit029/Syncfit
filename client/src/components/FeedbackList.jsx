import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

// Helper to get current user from JWT
function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

const FeedbackList = forwardRef(({ showUserActions = false, filterByUser = null, limit = null, showViewMore = false }, ref) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = getCurrentUser();

  useImperativeHandle(ref, () => ({
    refresh: fetchFeedbacks
  }));

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true); // Ensure loading is set on every refresh
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        setError(data.message || 'Failed to fetch feedbacks');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete your feedback?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFeedbacks((prev) => prev.filter(fb => fb._id !== feedbackId));
      } else {
        setError(data.message || 'Failed to delete feedback');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starClass = `text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-400'}`;
      stars.push(<span key={i} className={starClass}>★</span>);
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter feedbacks if filterByUser is set
  let displayedFeedbacks = filterByUser
    ? feedbacks.filter(fb => fb.email === filterByUser)
    : feedbacks;
  const hasMore = limit && displayedFeedbacks.length > limit;
  if (limit) displayedFeedbacks = displayedFeedbacks.slice(0, limit);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
      <h1 className="text-4xl font-bold mb-4 text-center text-black">
        All Feedbacks
      </h1>
      <p className="text-lg mb-8 text-center text-white">
        See what our users are saying about SyncFit
      </p>

      {error && (
        <div className="text-red-400 text-center text-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-xl text-blue-400 py-12">Loading feedbacks...</div>
      ) : displayedFeedbacks.length === 0 ? (
        <div className="text-center text-gray-400 text-lg py-12">
          {filterByUser ? 'You have not submitted any feedback yet.' : 'No feedbacks yet. Be the first to share your thoughts!'}
        </div>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedFeedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{feedback.name}</h3>
                  <p className="text-sm text-gray-200">{feedback.email}</p>
                  <div className="flex flex-wrap gap-1 max-w-[120px] overflow-x-auto mt-1">
                    {renderStars(feedback.rating)}
                  </div>
                </div>
              </div>
              
              <p className="text-white mb-4 leading-relaxed">
                {feedback.message}
              </p>
              {/* Show delete/edit only if this is user's own feedback and showUserActions is true */}
              {showUserActions && currentUser && (feedback.email === currentUser.email) && (
                <div className="flex gap-3 mb-2">
                  {/* <button className="px-3 py-1 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-all">Edit</button> */}
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                    onClick={() => handleDelete(feedback._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-200 font-semibold">
                <span>Rating: {feedback.rating}/5</span>
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
        {hasMore && showViewMore && (
          <div className="mt-8 text-center">
            <a href="/feedbacks" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">View More Feedbacks</a>
          </div>
        )}
        </>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={fetchFeedbacks}
          disabled={loading}
          className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin align-middle mr-2" />
          ) : null}
          {loading ? 'Refreshing...' : 'Refresh Feedbacks'}
        </button>
      </div>
    </div>
  );
});

export default FeedbackList; 