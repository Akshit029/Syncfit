import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn, LoginPrompt } from '../utils/auth';
// FeedbackList import and related logic removed

const Feedback = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 0 });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStarClick = (rating) => {
    setForm({ ...form, rating });
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError('Please provide a rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '', rating: 0 });
        setTimeout(() => {
          setSubmitted(false);
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const maxRating = 5;
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= (hoveredRating || form.rating);
      const starClass = `text-2xl cursor-pointer transition-all duration-200 ${
        isFilled ? 'text-yellow-400' : 'text-gray-400'
      } hover:text-yellow-300 hover:scale-110`;
      stars.push(
        <span
          key={i}
          className={starClass}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white px-4 py-16">
        <div className="max-w-2xl w-full bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Feedback</h1>
          <p className="text-lg mb-6 text-center text-gray-300">
            We value your feedback! Let us know how we can improve SyncFit.
          </p>
          {submitted ? (
            <div className="text-center">
              <div className="text-green-400 text-lg font-semibold py-8">Thank you for your feedback!</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Rating</label>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {renderStars()}
                  </div>
                  <span className="text-gray-400 ml-2">
                    {form.rating > 0 ? `${form.rating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
              </div>
              {error && (
                <div className="text-red-400 text-center text-sm">{error}</div>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default Feedback; 