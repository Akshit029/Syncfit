import React, { useState } from 'react';
import { isLoggedIn, LoginPrompt } from '../utils/auth';

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent('SyncFit Support Request');
    const body = encodeURIComponent(`
Name: ${form.name}
Email: ${form.email}

Message:
${form.message}
    `);
    
    // Use the user's email as the from address
    const mailtoLink = `mailto:chadgalakshit1@gmail.com?from=${encodeURIComponent(form.email)}&subject=${subject}&body=${body}`;
    
    // Open default email client in same window
    window.location.href = mailtoLink;
    
    // Reset form after a short delay
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white px-4 py-16">
        <div className="max-w-2xl w-full bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Support</h1>
          <p className="text-lg mb-6 text-center text-gray-300">
            Need help or have questions? We're here for you!
          </p>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-400 mb-2">Email: <a href="mailto:chadgalakshit1@gmail.com" className="text-blue-400 underline">chadgalakshit1@gmail.com</a></p>
            <p className="text-gray-400">Fill out the form below and click submit to open your email client with a pre-filled message.</p>
          </div>
          <form onSubmit={isLoggedIn() ? handleSubmit : (e) => { e.preventDefault(); setShowLoginPrompt(true); }} className="space-y-6 mt-8">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
              Send Email
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Clicking "Send Email" will open your default email client with a pre-filled message to our support team.
          </div>
        </div>
      </div>
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default Support; 