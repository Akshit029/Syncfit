import React from 'react';
// Authentication utility
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
// Reusable LoginPrompt modal
export function LoginPrompt({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="mb-6">Please log in to use this feature.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold" onClick={() => window.location.href = '/login'}>Login</button>
        <button className="ml-4 px-6 py-2 rounded-xl border border-gray-400" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
} 