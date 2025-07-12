import React from 'react';
import { isLoggedIn, LoginPrompt } from '../utils/auth';

const About = () => {
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);
  // For all interactive actions, update onClick/onSubmit:
  // Example:
  // <button onClick={isLoggedIn() ? handleDemo : () => setShowLoginPrompt(true)} ...>
  // ...
  // For all <Link> to feature pages, update to:
  // <Link to={isLoggedIn() ? "/dashboard" : "#"} onClick={!isLoggedIn() ? () => setShowLoginPrompt(true) : undefined} ...>
  // ...
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white px-4 py-16">
        <div className="max-w-2xl w-full bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">About SyncFit</h1>
          <p className="text-lg mb-6 text-center text-gray-300">
            SyncFit is your all-in-one fitness and nutrition companion. Track your workouts, monitor your nutrition, and achieve your health goals with a seamless, modern experience.
          </p>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
            <p className="text-gray-400">
              To empower individuals to take control of their health and wellness journey by providing intuitive tools, actionable insights, and a supportive community.
            </p>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
            <p className="text-gray-400">
              To make healthy living accessible, enjoyable, and sustainable for everyone, everywhere.
            </p>
          </div>
        </div>
      </div>
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default About; 