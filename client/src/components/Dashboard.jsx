import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Flame, TrendingDown, Plus, BarChart3, Target, Calendar, Sparkles, Zap, Trophy, Bell, X } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [workouts, setWorkouts] = useState('');
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [milestone, setMilestone] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0,10));
  const [viewMode, setViewMode] = useState('Monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [activitySummary, setActivitySummary] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null);
  const activityRef = useRef(null);
  const weightRef = useRef(null);
  const milestoneRef = useRef(null);

  // Stats
  const [animatedStats, setAnimatedStats] = useState({ workouts: 0, calories: 0, weight: 0 });

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Activity summary (last 7 days)
        const actRes = await fetch('http://localhost:5001/api/activity/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const actData = await actRes.json();
        setActivitySummary(Array.isArray(actData) ? actData : []);
        // Weight history (last 30 days)
        const wRes = await fetch('http://localhost:5001/api/weight/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const wData = await wRes.json();
        setWeightHistory(Array.isArray(wData) ? wData : []);
        // Milestones
        const mRes = await fetch('http://localhost:5001/api/milestone/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mData = await mRes.json();
        setMilestones(Array.isArray(mData) ? mData : []);
        // Animated stats
        const totalWorkouts = actData.reduce((sum, a) => sum + (a.workouts || 0), 0);
        const todayCalories = actData.length ? actData[actData.length-1].calories : 0;
        const weightLost = wData.length ? wData[0].weight - wData[wData.length-1].weight : 0;
        setTimeout(() => {
          setAnimatedStats({
            workouts: totalWorkouts,
            calories: todayCalories,
            weight: weightLost > 0 ? weightLost : 0
          });
        }, 500);
      } catch {
        setActivitySummary([]);
        setWeightHistory([]);
        setMilestones([]);
        setAnimatedStats({ workouts: 0, calories: 0, weight: 0 });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Weight chart data (weekly/monthly)
  const weightData = weightHistory.map((entry, idx) => ({
    name: viewMode === 'Weekly' ? `Day ${idx+1}` : new Date(entry.date).toLocaleDateString(),
    weight: entry.weight,
    target: weightHistory[0]?.weight || 0
  }));

  const navItems = ['Home', 'Nutrition', 'Progress', 'Workouts', 'Settings'];

  const handleLogActivity = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5001/api/activity/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0,10),
          workouts: Number(workouts),
          calories: Number(calories)
        })
      });
      setWorkouts('');
      setCalories('');
      // Refresh summary
      const actRes = await fetch('http://localhost:5001/api/activity/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const actData = await actRes.json();
      setActivitySummary(Array.isArray(actData) ? actData : []);
      const totalWorkouts = actData.reduce((sum, a) => sum + (a.workouts || 0), 0);
      const todayCalories = actData.length ? actData[actData.length-1].calories : 0;
      setAnimatedStats(s => ({ ...s, workouts: totalWorkouts, calories: todayCalories }));
    } catch {}
    setIsLoading(false);
  };

  const handleLogWeight = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5001/api/weight/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: weightDate,
          weight: Number(weight)
        })
      });
      setWeight('');
      // Refresh weight history
      const wRes = await fetch('http://localhost:5001/api/weight/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wData = await wRes.json();
      setWeightHistory(Array.isArray(wData) ? wData : []);
      const weightLost = wData.length ? wData[0].weight - wData[wData.length-1].weight : 0;
      setAnimatedStats(s => ({ ...s, weight: weightLost > 0 ? weightLost : 0 }));
    } catch {}
    setIsLoading(false);
  };

  const handleAddMilestone = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5001/api/milestone/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: milestone,
          date: new Date().toISOString().slice(0,10)
        })
      });
      setMilestone('');
      // Refresh milestones
      const mRes = await fetch('http://localhost:5001/api/milestone/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mData = await mRes.json();
      setMilestones(Array.isArray(mData) ? mData : []);
    } catch {}
    setIsLoading(false);
  };

  const handleDeleteMilestone = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5001/api/milestone/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMilestones(milestones.filter(m => m._id !== id));
    } catch {}
  };

  // Add this function to clear all user data from backend and state
  const handleResetAllData = async () => {
    if (!window.confirm('Are you sure you want to reset ALL your data? This cannot be undone.')) return;
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5001/api/activity/history', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      await fetch('http://localhost:5001/api/weight/history', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      await fetch('http://localhost:5001/api/milestone/', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setWorkouts('');
      setCalories('');
      setWeight('');
      setMilestone('');
      setActivitySummary([]);
      setWeightHistory([]);
      setMilestones([]);
      setAnimatedStats({ workouts: 0, calories: 0, weight: 0 });
    } catch {}
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Activity summary (last 7 days)
      const actRes = await fetch('http://localhost:5001/api/activity/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const actData = await actRes.json();
      setActivitySummary(Array.isArray(actData) ? actData : []);
      // Weight history (last 30 days)
      const wRes = await fetch('http://localhost:5001/api/weight/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wData = await wRes.json();
      setWeightHistory(Array.isArray(wData) ? wData : []);
      // Milestones
      const mRes = await fetch('http://localhost:5001/api/milestone/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mData = await mRes.json();
      setMilestones(Array.isArray(mData) ? mData : []);
      // Animated stats
      const totalWorkouts = actData.reduce((sum, a) => sum + (a.workouts || 0), 0);
      const todayCalories = actData.length ? actData[actData.length-1].calories : 0;
      const weightLost = wData.length ? wData[0].weight - wData[wData.length-1].weight : 0;
      setTimeout(() => {
        setAnimatedStats({
          workouts: totalWorkouts,
          calories: todayCalories,
          weight: weightLost > 0 ? weightLost : 0
        });
      }, 500);
    } catch {
      setActivitySummary([]);
      setWeightHistory([]);
      setMilestones([]);
      setAnimatedStats({ workouts: 0, calories: 0, weight: 0 });
    }
    setLoading(false);
  };

  const allTimeWorkouts = activitySummary.reduce((sum, a) => sum + (a.workouts || 0), 0);
  const allTimeCalories = activitySummary.reduce((sum, a) => sum + (a.calories || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Progress Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 sm:gap-0">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Your Progress
              </h2>
              <p className="text-gray-400 text-lg">Track your fitness journey and celebrate your achievements! 🚀</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 w-full sm:w-auto">
                <Activity className="w-5 h-5 group-hover:animate-pulse" />
                <span onClick={() => { setOpenSection('activity'); setTimeout(() => activityRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-medium">Log Workout</span>
              </button>
              <button
                onClick={handleResetAllData}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-2xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset All Data'}
              </button>
            </div>
          </div>

          {/* Enhanced Progress Cards with animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-blue-200 text-sm font-medium">All Time</div>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Workouts</p>
                  <p className="text-4xl font-bold text-white">{allTimeWorkouts}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-3xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-red-200 text-sm font-medium">All Time</div>
                </div>
                <div>
                  <p className="text-red-100 text-sm mb-1">Calories</p>
                  <p className="text-4xl font-bold text-white">{allTimeCalories}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-3xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-green-200 text-sm font-medium">Total</div>
                </div>
                <div>
                  <p className="text-green-100 text-sm mb-1">Weight Lost</p>
                  <p className="text-4xl font-bold text-white">{animatedStats.weight} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              className="group bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600 hover:to-blue-700 backdrop-blur-sm border border-blue-500/30 p-6 rounded-2xl flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              onClick={() => { setOpenSection('activity'); setTimeout(() => activityRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              <div className="w-12 h-12 bg-blue-500/30 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300">
                <Activity className="w-6 h-6 text-blue-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Log Workout</div>
                <div className="text-sm text-gray-400 group-hover:text-blue-200">Track your activity</div>
              </div>
            </button>
            <button
              className="group bg-gradient-to-r from-purple-600/20 to-purple-700/20 hover:from-purple-600 hover:to-purple-700 backdrop-blur-sm border border-purple-500/30 p-6 rounded-2xl flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              onClick={() => { setOpenSection('weight'); setTimeout(() => weightRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              <div className="w-12 h-12 bg-purple-500/30 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300">
                <BarChart3 className="w-6 h-6 text-purple-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Log Weight</div>
                <div className="text-sm text-gray-400 group-hover:text-purple-200">Update your progress</div>
              </div>
            </button>
            <button
              className="group bg-gradient-to-r from-green-600/20 to-green-700/20 hover:from-green-600 hover:to-green-700 backdrop-blur-sm border border-green-500/30 p-6 rounded-2xl flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              onClick={() => { setOpenSection('milestone'); setTimeout(() => milestoneRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              <div className="w-12 h-12 bg-green-500/30 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300">
                <Target className="w-6 h-6 text-green-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Add Milestone</div>
                <div className="text-sm text-gray-400 group-hover:text-green-200">Set new goals</div>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Weight Progress Chart */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-700/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3 sm:gap-2">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Weight Progress
              </h3>
              <p className="text-gray-400">Track your weight loss journey over time</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('Weekly')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full sm:w-auto ${
                  viewMode === 'Weekly' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('Monthly')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full sm:w-auto ${
                  viewMode === 'Monthly' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button className="bg-gray-700/50 hover:bg-gray-600/50 px-6 py-3 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-300 w-full sm:w-auto" onClick={handleRefresh}>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Refresh</span>
                </div>
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  domain={['dataMin - 2', 'dataMax + 1']}
                  dx={-10}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorTarget)"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorWeight)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#3B82F6', stroke: '#1E40AF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Milestones Section */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-700/50 shadow-2xl">
          <h3 className="text-2xl font-bold text-white flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            Milestones & Achievements
          </h3>
          <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
            {milestones.length === 0 ? (
              <div className="text-gray-400 text-center">No milestones yet.</div>
            ) : (
              milestones.map((m) => (
                <div key={m._id} className="flex items-center space-x-4 mb-6 last:mb-0 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-semibold text-lg">{m.description}</p>
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-gray-400">{new Date(m.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <button
                      className="text-red-400 hover:text-red-600 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Milestone"
                      onClick={() => handleDeleteMilestone(m._id)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="text-2xl mt-2">🎉</div>
                    <div className="text-xs text-gray-400 mt-1">Milestone</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Log Activity */}
          <div ref={activityRef} className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <h3 className="text-2xl font-bold text-white flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Log Activity
            </h3>
            {openSection === 'activity' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">Workouts Completed</label>
                  <input
                    type="number"
                    value={workouts}
                    onChange={(e) => setWorkouts(e.target.value)}
                    placeholder="Enter number of workouts"
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">Calories Burned</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Enter calories burned"
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleLogActivity}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span className="font-medium">{isLoading ? 'Logging...' : 'Log Activity'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Log Weight */}
          <div ref={weightRef} className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <h3 className="text-2xl font-bold text-white flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Log Weight
            </h3>
            {openSection === 'weight' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">Date</label>
                  <input
                    type="date"
                    value={weightDate}
                    onChange={(e) => setWeightDate(e.target.value)}
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter your weight"
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleLogWeight}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span className="font-medium">{isLoading ? 'Logging...' : 'Log Weight'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Add Milestone Section */}
        <div ref={milestoneRef} className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-3xl p-8 mt-8 border border-gray-700/50 shadow-2xl">
          <h3 className="text-2xl font-bold text-white flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-4 h-4 text-white" />
            </div>
            Add Milestone
          </h3>
          {openSection === 'milestone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Milestone Description</label>
                <input
                  type="text"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  placeholder="Enter milestone description"
                  className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddMilestone}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span className="font-medium">{isLoading ? 'Adding...' : 'Add Milestone'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;