import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell, User } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/bmi', label: 'BMI Calculator' },
  { to: '/settings', label: 'Settings' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const navigate = useNavigate();

  // Get user from localStorage
  const user = (() => {
    try {
      const stored = localStorage.getItem('token');
      if (!stored) return null;
      // Decode JWT to get user name (simple base64 decode, not verifying signature)
      const payload = JSON.parse(atob(stored.split('.')[1]));
      return payload && payload.name ? payload : null;
    } catch {
      return null;
    }
  })();
  const userInitial = user && user.name ? user.name[0].toUpperCase() : '';

  const handleLinkClick = (to) => {
    setActiveLink(to);
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <nav className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-4 sm:px-6 py-4 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with Icon */}
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight cursor-pointer">
            SyncFit
          </h1>
        </div>

        {/* Centered Nav - Desktop */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center space-x-1 bg-gray-900/50 rounded-2xl p-1 backdrop-blur-sm border border-gray-800/50">
            {navLinks.map((item) => (
              <button
                key={item.to}
                onClick={() => handleLinkClick(item.to)}
                className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-xl ${
                  activeLink === item.to
                    ? 'text-white'
                    : 'text-white hover:text-white hover:bg-gray-800/50'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '800px',
                  // outline: 'calc(var(--debug, 0) * 1px) dashed rgba(255,0,0,0.5)' // Uncomment for debugging
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          {user ? (
            <div className="relative group">
              <button
                className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                onClick={() => handleLinkClick('/profile')}
                title="Profile"
              >
                {userInitial || <User className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <>
              <button
                className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                onClick={() => handleLinkClick('/login')}
              >
                Login
              </button>
              <button
                className="relative px-6 py-2.5 bg-transparent border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                onClick={() => handleLinkClick('/signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2.5 rounded-xl text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <Menu
              className={`w-6 h-6 absolute transition-all duration-300 ${
                menuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`}
            />
            <X
              className={`w-6 h-6 absolute transition-all duration-300 ${
                menuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-4 bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 p-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <button
                key={item.to}
                onClick={() => handleLinkClick(item.to)}
                className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-xl text-left ${
                  activeLink === item.to
                    ? 'text-white'
                    : 'text-white hover:text-white hover:bg-gray-800/50'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '800px',
                  // outline: 'calc(var(--debug, 0) * 1px) dashed rgba(255,0,0,0.5)' // Uncomment for debugging
                }}
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-800/50">
              {user ? (
                <>
                  <button
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
                    onClick={() => handleLinkClick('/profile')}
                  >
                    {userInitial || <User className="w-6 h-6 inline" />} Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
                    onClick={() => handleLinkClick('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="w-full px-4 py-3 bg-transparent border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => handleLinkClick('/signup')}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;