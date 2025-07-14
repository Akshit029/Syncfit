import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit3, LogOut, Home, BarChart3, Apple, TrendingUp, Dumbbell, Settings, Bell, Shield, Camera, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SyncFitProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityHistory, setActivityHistory] = useState([]);
  const [nutritionHistory, setNutritionHistory] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [settings, setSettings] = useState({ privacy: false, notifications: true });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [workoutsThisMonth, setWorkoutsThisMonth] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = React.useRef();
  const [showRemove, setShowRemove] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUserData(data);
      } catch {
        setUserData(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Fetch activity, nutrition, milestones, and settings
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem('token');
      try {
        // Activity
        const actRes = await fetch(`${process.env.REACT_APP_API_URL}/api/activity/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const actData = await actRes.json();
        setActivityHistory(Array.isArray(actData) ? actData : []);
        // Nutrition
        const nutRes = await fetch(`${process.env.REACT_APP_API_URL}/api/nutrition/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const nutData = await nutRes.json();
        setNutritionHistory(Array.isArray(nutData) ? nutData : []);
        // Milestones
        const msRes = await fetch(`${process.env.REACT_APP_API_URL}/api/milestone/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const msData = await msRes.json();
        setMilestones(Array.isArray(msData) ? msData : []);
        // Settings
        setSettingsLoading(true);
        const setRes = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const setData = await setRes.json();
        setSettings({
          privacy: setData.privacy ?? false,
          notifications: setData.notifications ?? true
        });
        setSettingsLoading(false);
        setSettingsError('');
      } catch (err) {
        setSettingsError('Failed to fetch some profile data.');
        setSettingsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Compute Workouts This Month and Calories Burned
  useEffect(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const workouts = activityHistory.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, a) => sum + (a.workouts || 0), 0);
    const calories = activityHistory.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, a) => sum + (a.calories || 0), 0);
    setWorkoutsThisMonth(workouts);
    setCaloriesBurned(calories);
  }, [activityHistory]);

  // Build Recent Activity Feed
  useEffect(() => {
    const events = [];
    activityHistory.slice(-10).reverse().forEach(a => {
      if (a.workouts) events.push({ type: 'workout', label: 'Workout Logged', value: `${a.workouts} workout${a.workouts > 1 ? 's' : ''}`, date: a.date });
      if (a.calories) events.push({ type: 'calories', label: 'Calories Burned', value: `${a.calories} cal`, date: a.date });
    });
    nutritionHistory.slice(-10).reverse().forEach(n => {
      if (n.meals && n.meals.length > 0) events.push({ type: 'meal', label: 'Meal Plan Updated', value: `${n.meals.length} meal${n.meals.length > 1 ? 's' : ''}`, date: n.date });
    });
    milestones.slice(-10).reverse().forEach(m => {
      events.push({ type: 'milestone', label: 'Progress Photo Added', value: m.description || '', date: m.date });
    });
    // Sort by date descending
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentActivity(events.slice(0, 5));
  }, [activityHistory, nutritionHistory, milestones]);

  // Quick Settings Handlers
  const handleToggle = async (field) => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const token = localStorage.getItem('token');
      const newSettings = { ...settings, [field]: !settings[field] };
      setSettings(newSettings);
      await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      setSettingsLoading(false);
    } catch {
      setSettingsError('Failed to update settings.');
      setSettingsLoading(false);
    }
  };

  const hasGalleryPermission = () => {
    return localStorage.getItem('galleryPermission') === 'granted';
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const handleCameraClick = () => {
    if (!hasGalleryPermission()) {
      setShowPermissionModal(true);
      return;
    }
    // Ask for permission and open file picker
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handlePermissionAgree = () => {
    localStorage.setItem('galleryPermission', 'granted');
    setShowPermissionModal(false);
    // Open file picker after agreeing
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handlePermissionDecline = () => {
    setShowPermissionModal(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.profileImage) {
        setUserData((u) => ({ ...u, profileImage: data.profileImage }));
        setUploadStatus('Profile image updated!');
      } else {
        setUploadStatus(data.message || 'Failed to upload image');
      }
    } catch {
      setUploadStatus('Network error');
    }
    setUploading(false);
    setTimeout(() => setUploadStatus(null), 2000);
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    setUploadStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile-image`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserData((u) => ({ ...u, profileImage: '' }));
        setUploadStatus('Profile image removed');
      } else {
        setUploadStatus(data.message || 'Failed to remove image');
      }
    } catch {
      setUploadStatus('Network error');
    }
    setUploading(false);
    setTimeout(() => setUploadStatus(null), 2000);
  };

  return (
    <div>
      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-white mb-4">Allow Gallery Access</h2>
            <p className="text-gray-300 mb-6">SyncFit needs your permission to access your gallery to upload a profile image. This will only be asked once.</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                onClick={handlePermissionAgree}
              >
                Allow
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                onClick={handlePermissionDecline}
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="flex overflow-x-auto px-4 py-2 space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="text-center">
                <div
                  className="relative inline-block mb-4 group"
                  onMouseEnter={() => setShowRemove(true)}
                  onMouseLeave={() => setShowRemove(false)}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg">
                    {/* Show profile image if available */}
                    {userData?.profileImage ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL}${userData.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      'T'
                    )}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg"
                    onClick={handleCameraClick}
                    disabled={uploading}
                  >
                    <Camera size={16} />
                  </button>
                  {/* Remove button on hover if image exists */}
                  {userData?.profileImage && showRemove && (
                    <button
                      className="absolute top-0 right-0 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                      onClick={handleRemoveImage}
                      disabled={uploading}
                      title="Remove profile image"
                      style={{ zIndex: 10 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  {uploadStatus && (
                    <div className="mt-2 text-xs text-white text-center">{uploadStatus}</div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">User Profile</h2>
                
                <div className="space-y-4 text-left">
                  {loading ? (
                    <div className="text-center text-slate-400">Loading...</div>
                  ) : (
                    <>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="text-blue-400" size={18} />
                          <span className="text-gray-400 text-sm font-medium">USERNAME</span>
                        </div>
                        <p className="text-white font-semibold">{userData?.name || '...'}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Mail className="text-blue-400" size={18} />
                          <span className="text-gray-400 text-sm font-medium">EMAIL</span>
                        </div>
                        <p className="text-white font-semibold break-all truncate">{userData?.email || '...'}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="text-blue-400" size={18} />
                          <span className="text-gray-400 text-sm font-medium">MEMBER SINCE</span>
                        </div>
                        <p className="text-white font-semibold">{userData?.createdAt ? new Date(userData.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : '...'}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    onClick={() => navigate('/settings')}
                  >
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                  
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Workouts This Month</p>
                    <p className="text-2xl font-bold text-white">{workoutsThisMonth}</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Dumbbell className="text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Calories Burned</p>
                    <p className="text-2xl font-bold text-white">{caloriesBurned}</p>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((event, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      {event.type === 'workout' && <Dumbbell className="text-blue-400" size={16} />}
                      {event.type === 'calories' && <TrendingUp className="text-green-400" size={16} />}
                      {event.type === 'meal' && <Apple className="text-green-400" size={16} />}
                      {event.type === 'milestone' && <Shield className="text-purple-400" size={16} />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.label}</p>
                      <p className="text-gray-400 text-sm">{new Date(event.date).toLocaleString('default', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SyncFitProfile;