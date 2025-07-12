import React from 'react';
import { isLoggedIn, LoginPrompt } from '../utils/auth';

const features = [
  { icon: <span className="text-3xl">🏃‍♂️</span>, title: 'Activity Tracking', desc: 'Log your daily steps, workouts, and activities with ease.' },
  { icon: <span className="text-3xl">🔥</span>, title: 'Calorie Calculator', desc: 'Calculate your daily calorie needs and track your intake.' },
  { icon: <span className="text-3xl">🍏</span>, title: 'Nutrition Logging', desc: 'Add meals, track macros, and monitor your nutrition.' },
  { icon: <span className="text-3xl">🏋️</span>, title: 'Workout Plans', desc: 'Access personalized workout plans and routines.' },
  { icon: <span className="text-3xl">🎯</span>, title: 'Goal Setting', desc: 'Set and track your fitness and nutrition goals.' },
  { icon: <span className="text-3xl">👤</span>, title: 'Profile & Progress', desc: 'View your profile, progress, and achievements.' },
];

const Features = () => {
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white px-4 py-16">
      <div className="max-w-3xl w-full bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-gray-700/50">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-start space-x-4 bg-gray-800/60 rounded-xl p-4 border border-gray-700/40 shadow">
              <div>{f.icon}</div>
              <div>
                <h2 className="text-xl font-semibold mb-1">{f.title}</h2>
                <p className="text-gray-300 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
};

export default Features; 