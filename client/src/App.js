import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Dashboard from './components/Dashboard.jsx';
import Nutrition from './components/Nutrition.jsx';
import BMICalculator from './components/BMICalculator.jsx';
import Settings from './components/Settings.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import About from './components/About.jsx';
import Features from './components/Features.jsx';
import Support from './components/Support.jsx';
import Feedback from './components/Feedback.jsx';
import FeedbackList from './components/FeedbackList.jsx';
import FeedbacksPage from './components/FeedbacksPage.jsx';
import Workout from './components/Workout.jsx';

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

const AppRoutes = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/signup'].includes(location.pathname);
  // Set background class based on route
  let bgClass = '';
  if (location.pathname === '/settings') {
    bgClass = 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
  } else if (location.pathname === '/profile') {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  } else if (location.pathname === '/bmi') {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  } else if (location.pathname === '/dashboard') {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  } else if (location.pathname === '/nutrition') {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  } else if (location.pathname === '/') {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  } else {
    bgClass = 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900';
  }
  const loggedIn = isLoggedIn();
  return (
    <div className={`min-h-screen ${bgClass}`}>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/support" element={<Support />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feedbacks" element={<FeedbacksPage />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={loggedIn ? <Dashboard /> : <LoginRedirect />} />
        <Route path="/nutrition" element={loggedIn ? <Nutrition /> : <LoginRedirect />} />
        <Route path="/bmi" element={loggedIn ? <BMICalculator /> : <LoginRedirect />} />
        <Route path="/settings" element={loggedIn ? <Settings /> : <LoginRedirect />} />
        <Route path="/profile" element={loggedIn ? <Profile /> : <LoginRedirect />} />
        <Route path="/workout" element={loggedIn ? <Workout /> : <LoginRedirect />} />
      </Routes>
    </div>
  );
};

function LoginRedirect() {
  window.location.replace('/login');
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
