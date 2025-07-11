import React from 'react';
import FeedbackList from './FeedbackList';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeedbacksPage() {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate('/#feedbacks');
    // Optionally, scroll to feedbacks section after navigation
    setTimeout(() => {
      const el = document.getElementById('feedbacks');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 my-16 relative">
        <button
          className="absolute top-0.5 right-0.5 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200"
          onClick={handleClose}
          title="Back to Home"
        >
          <X className="w-6 h-6" />
        </button>
        <FeedbackList showUserActions={true} />
      </div>
    </div>
  );
} 