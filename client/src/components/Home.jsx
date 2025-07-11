import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Zap, Activity, Heart, TrendingUp, Play, Check, ChevronDown, Star, Award, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedbackList from './FeedbackList';

// --- WorkoutPlanForm Component ---
function WorkoutPlanForm({ onClose }) {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    fitness: '',
    goal: '',
    days: '3',
    equipment: '',
    injuries: '',
    preferences: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    const prompt = `Generate a personalized ${form.days}-day workout plan for the following user profile.\n\n` +
      `Age: ${form.age}\n` +
      `Gender: ${form.gender}\n` +
      `Fitness Level: ${form.fitness}\n` +
      `Goal: ${form.goal}\n` +
      `Experience: ${form.experience}\n` +
      `Available Equipment: ${form.equipment}\n` +
      `Injuries/Limitations: ${form.injuries}\n` +
      `Workout Preferences: ${form.preferences}\n` +
      `\nPlease provide a detailed workout plan for each day, with exercise breakdowns, sets, reps, and rest, and ensure all restrictions and preferences are followed. Format the output clearly for the user.`;
    try {
      const res = await fetch('http://localhost:5001/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await res.json();
      setResult(data.answer || 'No response from AI.');
    } catch (err) {
      setError('Failed to generate workout plan.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl max-w-lg mx-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"><X className="w-5 h-5" /></button>
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2"><Sparkles className="w-6 h-6" /> Generate Workout Plan</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} min="10" max="100" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Fitness Level</label>
          <select name="fitness" value={form.fitness} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
            <option value="">Select</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Primary Goal</label>
          <select name="goal" value={form.goal} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
            <option value="">Select</option>
            <option value="weight loss">Weight Loss</option>
            <option value="muscle gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="general fitness">General Fitness</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Experience (optional)</label>
          <input type="text" name="experience" value={form.experience} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. years of training, sports, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Workout Days per Week</label>
          <select name="days" value={form.days} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Available Equipment</label>
          <input type="text" name="equipment" value={form.equipment} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. dumbbells, resistance bands, gym, none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Injuries/Limitations (optional)</label>
          <input type="text" name="injuries" value={form.injuries} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. knee pain, back issues, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Workout Preferences (optional)</label>
          <input type="text" name="preferences" value={form.preferences} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. HIIT, yoga, running, etc." />
        </div>
        <div className="flex items-center justify-end mt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Workout'}</span>
          </button>
        </div>
      </form>
      {error && <div className="text-red-400 mt-4">{error}</div>}
      {result && (
        <div className="mt-8 bg-slate-900/70 rounded-xl p-6 border border-slate-700 text-white whitespace-pre-line">
          <h4 className="text-lg font-semibold mb-2 text-blue-400">Your AI-Generated Workout Plan:</h4>
          <div>{result}</div>
        </div>
      )}
    </div>
  );
}

const GENERAL_TIPS = [
  'Stay hydrated: Drink at least 8 cups of water daily.',
  'Aim for at least 30 minutes of moderate exercise most days.',
  'Balance your meals with protein, carbs, and healthy fats.',
  'Get 7-9 hours of sleep each night for optimal recovery.',
  'Track your progress to stay motivated and accountable.',
  'Include both strength and cardio in your weekly routine.',
  'Eat plenty of fruits and vegetables for vitamins and minerals.',
  'Warm up before workouts and cool down after.',
  'Listen to your body and rest when needed.',
  'Set realistic, achievable fitness goals.'
];

const PREPARED_QA = [
  {
    q: 'How do I lose weight?',
    a: 'To lose weight, focus on a calorie deficit through a combination of healthy eating and regular exercise. Aim for gradual, sustainable changes.'
  },
  {
    q: 'How can I build muscle?',
    a: 'To build muscle, combine strength training exercises with adequate protein intake and allow time for recovery.'
  },
  {
    q: 'What are the best foods for energy?',
    a: 'Whole grains, fruits, vegetables, lean proteins, and healthy fats provide sustained energy for workouts and daily activities.'
  },
  {
    q: 'How much water should I drink daily?',
    a: 'Aim for at least 8 cups (about 2 liters) of water per day, more if you are active or sweating heavily.'
  },
  {
    q: 'How often should I work out?',
    a: 'Aim for at least 150 minutes of moderate exercise per week, including both cardio and strength training.'
  },
  {
    q: 'What is the best time to exercise?',
    a: 'The best time to exercise is the time that fits your schedule and you can stick to consistently. Both morning and evening workouts have benefits.'
  },
  {
    q: 'How important is sleep for fitness?',
    a: 'Sleep is crucial for muscle recovery, hormone balance, and overall health. Aim for 7-9 hours per night.'
  },
  {
    q: 'Should I do cardio or weights first?',
    a: 'It depends on your goals. For fat loss, do cardio after weights. For endurance, do cardio first. For muscle gain, prioritize weights.'
  }
];

const Home = () => {
  const [steps, setSteps] = useState(0);
  const [stepsInput, setStepsInput] = useState('');
  const [dailyGoal] = useState(10000);
  const [selectedGoal, setSelectedGoal] = useState('Weight loss');
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [showStepsInput, setShowStepsInput] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(true);
  const goalBtnRef = useRef();
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Nutrition summary state
  const [nutritionMacros, setNutritionMacros] = useState({
    carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' },
    protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' },
    fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' }
  });
  const [nutritionCurrentCalories, setNutritionCurrentCalories] = useState(0);
  const [nutritionGoal, setNutritionGoal] = useState(2000);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * GENERAL_TIPS.length));

  // Workout Plan Modal State
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  useEffect(() => {
    const fetchNutrition = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5001/api/nutrition/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Find today's log
        const today = new Date().toISOString().slice(0,10);
        const todayEntry = data.find(d => d.date && d.date.slice(0,10) === today);
        if (todayEntry) {
          setNutritionCurrentCalories(todayEntry.calories || 0);
          setNutritionMacros({
            carbs: { consumed: todayEntry.carbs || 0, goal: 250, color: 'from-orange-500 to-red-500' },
            protein: { consumed: todayEntry.protein || 0, goal: 150, color: 'from-blue-500 to-purple-500' },
            fat: { consumed: todayEntry.fats || 0, goal: 67, color: 'from-green-500 to-teal-500' }
          });
        } else {
          setNutritionCurrentCalories(0);
          setNutritionMacros({
            carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' },
            protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' },
            fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' }
          });
        }
      } catch {
        setNutritionCurrentCalories(0);
        setNutritionMacros({
          carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' },
          protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' },
          fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' }
        });
      }
      // Get goal from localStorage
      const storedGoalCalories = localStorage.getItem('syncfit_goal_calories');
      if (storedGoalCalories) setNutritionGoal(Number(storedGoalCalories));
    };
    fetchNutrition();
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    // Read goal and calories from localStorage
    const storedGoal = localStorage.getItem('syncfit_goal');
    if (storedGoal) setSelectedGoal(storedGoal);
    // Removed setCalorieGoal usage since it is not defined
  }, []);

  useEffect(() => {
    if (showGoalDropdown && goalBtnRef.current) {
      const rect = goalBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showGoalDropdown]);

  // Fetch today's steps from backend
  useEffect(() => {
    const fetchSteps = async () => {
      setStepsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/steps/today', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setSteps(data && typeof data.steps === 'number' ? data.steps : 0);
      } catch {
        setSteps(0);
      }
      setStepsLoading(false);
    };
    fetchSteps();
  }, []);

  // Rotate tip every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % GENERAL_TIPS.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showChat]);

  const handleAskAI = () => setShowChat(true);
  const handleCloseChat = () => {
    setShowChat(false);
    setChatHistory([]); // Clear chat history on close
  };

  // Add handler for prepared question click
  const handlePreparedQuestion = qa => {
    setChatHistory(h => [
      ...h,
      { sender: 'user', text: qa.q },
      { sender: 'ai', text: qa.a }
    ]);
    setShowChat(true);
  };

  const goals = [
    { id: 'weight-loss', name: 'Weight Loss', icon: '🔥', color: 'from-red-500 via-orange-500 to-red-600', accent: 'red' },
    { id: 'muscle-gain', name: 'Muscle Gain', icon: '💪', color: 'from-blue-500 via-purple-500 to-blue-600', accent: 'blue' },
    { id: 'endurance', name: 'Endurance', icon: '⚡', color: 'from-green-500 via-emerald-500 to-green-600', accent: 'green' },
    { id: 'strength', name: 'Strength', icon: '🏋️', color: 'from-purple-500 via-pink-500 to-purple-600', accent: 'purple' },
    { id: 'flexibility', name: 'Flexibility', icon: '🧘', color: 'from-teal-500 via-cyan-500 to-teal-600', accent: 'teal' },
    { id: 'general', name: 'General Fitness', icon: '🎯', color: 'from-indigo-500 via-blue-500 to-indigo-600', accent: 'indigo' }
  ];

  const handleStepsSubmit = async () => {
    const newSteps = parseInt(stepsInput) || 0;
    setStepsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/steps/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ steps: newSteps })
      });
      const data = await res.json();
      setSteps(data && typeof data.steps === 'number' ? data.steps : newSteps);
    } catch {
      setSteps(newSteps);
    }
    setStepsInput('');
    setShowStepsInput(false);
    setStepsLoading(false);
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal.name);
    setShowGoalDropdown(false);
  };

  const handleStepsReset = async () => {
    setStepsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/steps/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ steps: 0 })
      });
      const data = await res.json();
      setSteps(data && typeof data.steps === 'number' ? data.steps : 0);
    } catch {
      setSteps(0);
    }
    setStepsLoading(false);
  };

  const selectedGoalData = goals.find(g => g.name === selectedGoal) || goals[0];

  return (
    <div>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),transparent)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent)] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(119,198,255,0.1),transparent)] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Glassmorphism Header */}
      <div className="relative z-10">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10"></div>
          
          <div className={`relative px-6 py-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-7xl mx-auto text-center">
              
              
              {/* Main Title with Gradient Animation */}
              <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                SYNCFIT
              </h1>
              
              <p className="text-2xl text-gray-300 mb-12 font-light">Transform your potential into power</p>
              
              {/* Enhanced Goal Selection */}
              <div className="relative inline-block mb-12">
                <button
                  ref={goalBtnRef}
                  onClick={() => setShowGoalDropdown(!showGoalDropdown)}
                  className={`group relative bg-gradient-to-r ${selectedGoalData.color} hover:scale-105 hover:shadow-2xl transform transition-all duration-500 px-10 py-6 rounded-3xl flex items-center space-x-4 shadow-2xl backdrop-blur-xl border border-white/10`}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>{selectedGoalData.icon}</span>
                  <span className="text-xl font-bold relative z-10">Your Goal: {selectedGoal}</span>
                  <ChevronDown className={`w-6 h-6 transition-transform duration-300 relative z-10 ${showGoalDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showGoalDropdown && createPortal(
                  <div
                    className="bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-[1000] max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-300 text-white"
                    style={{
                      position: 'absolute',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      minWidth: 250,
                    }}
                  >
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal)}
                        className="w-full px-8 py-6 text-left hover:bg-white/5 flex items-center space-x-4 first:rounded-t-2xl last:rounded-b-2xl transition-all duration-300 group text-white"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{goal.icon}</span>
                        <span className="font-semibold flex-1">{goal.name}</span>
                        {goal.name === selectedGoal && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  to="/workout"
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-2xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Play className="w-6 h-6 relative z-10" />
                  <span className="font-bold text-lg relative z-10">Generate Workout</span>
                </Link>
                <Link
                  to="/nutrition"
                  className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-10 py-5 rounded-2xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Heart className="w-6 h-6 relative z-10" />
                  <span className="font-bold text-lg relative z-10">Track Nutrition</span>
                </Link>
                <button className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-10 py-5 rounded-2xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="w-6 h-6 relative z-10" />
                  <span className="font-bold text-lg relative z-10">View Progress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Ultra-Modern Steps Counter */}
          <div className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-4">
                  <div className="relative p-4 bg-blue-500/20 rounded-2xl">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Daily Steps</h3>
                    <span className="text-sm text-gray-400 flex items-center space-x-2">
                      <span>Today • {new Date().toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleStepsReset}
                  className="group bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-xl font-semibold transition-all border border-red-500/30 hover:border-red-500/50"
                >
                  <span className="group-hover:animate-pulse">Reset</span>
                </button>
              </div>

              <div className="flex items-center justify-center mb-10">
                <div className="relative w-60 h-60">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#stepGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${stepsLoading ? 0 : Math.min(100, (steps / dailyGoal) * 100) * 2.51} 251`}
                      className="transition-all duration-1000 filter drop-shadow-lg"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {stepsLoading ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                          {Math.round(Math.min(100, (steps / dailyGoal) * 100))}%
                        </div>
                        <div className="text-gray-400 text-sm font-medium mt-2">completed</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center mb-10">
                <div className="text-4xl font-black text-white mb-3">
                  {stepsLoading ? <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : steps.toLocaleString()}
                </div>
                <div className="text-gray-400 text-lg">of {dailyGoal.toLocaleString()} steps</div>
                <div className="mt-4 flex justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Calories</div>
                    <div className="text-xl font-bold text-orange-400">{Math.round(steps * 0.04)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Distance</div>
                    <div className="text-xl font-bold text-green-400">{(steps * 0.0008).toFixed(1)}km</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Steps Input */}
              {showStepsInput ? (
                <div className="space-y-6">
                  <input
                    type="number"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    placeholder="Enter your steps"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-xl"
                    autoFocus
                  />
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleStepsSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Update Steps
                    </button>
                    <button 
                      onClick={() => setShowStepsInput(false)}
                      className="px-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl transition-all border border-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowStepsInput(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-2xl font-bold text-lg"
                >
                  <Edit className="w-6 h-6" />
                  <span>Update Steps</span>
                </button>
              )}
            </div>
          </div>

          {/* Ultra-Modern Nutrition Overview */}
          <div className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-4">
                  <div className="relative p-4 bg-green-500/20 rounded-2xl">
                    <Heart className="w-8 h-8 text-green-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Nutrition</h3>
                    <span className="text-sm text-gray-400">Daily intake tracking</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
          </h3>
          <Link
            to="/nutrition"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200"
          >
            + Add Log
          </Link>
        </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold">Calories</span>
                  <span className="text-xl font-black">{nutritionCurrentCalories} / {nutritionGoal}</span>
                </div>
                <div className="relative w-full bg-white/10 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all duration-1000 shadow-lg relative"
                    style={{ width: `${Math.min((nutritionCurrentCalories / nutritionGoal) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-400">
                    {nutritionGoal - nutritionCurrentCalories} calories remaining
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-8 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span>Macronutrients</span>
                </h4>
                <div className="space-y-8">
                  {Object.entries(nutritionMacros).map(([key, macro]) => (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 font-semibold capitalize">{key}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{macro.consumed}g / {macro.goal}g</span>
                          <div className="w-3 h-3 bg-gradient-to-r from-current to-current rounded-full" style={{color: macro.color.split(' ')[1]}}></div>
                        </div>
                      </div>
                      <div className="relative w-full bg-white/10 rounded-full h-4">
                        <div 
                          className={`bg-gradient-to-r ${macro.color} h-4 rounded-full transition-all duration-1000 relative overflow-hidden`}
                          style={{ width: `${Math.min((macro.consumed / macro.goal) * 100, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Insights */}
        <div className={`relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-2xl rounded-3xl p-10 mb-16 border border-white/10 shadow-2xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0 bg-white/[0.02] rounded-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative p-4 bg-yellow-500/20 rounded-2xl">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center space-x-2">
                      <span>AI Insights</span>
                      <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </h3>
                    <span className="text-sm text-gray-400">General fitness & nutrition tips</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-xl text-gray-100 leading-relaxed">{GENERAL_TIPS[tipIndex]}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Rotating expert tips</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>AI Simulated</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 sm:mt-0 sm:ml-8 w-full sm:w-auto space-y-4 flex-shrink-0">
                <button onClick={handleAskAI} className="group relative bg-white/10 hover:bg-white/20 text-white w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all border border-white/20">
                  <Sparkles className="w-6 h-6" />
                  <span className="font-bold">Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* AI Chat Modal */}
        {showChat && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl w-full max-w-md relative">
              <button onClick={handleCloseChat} className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2"><Sparkles className="w-6 h-6" /> Ask AI</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {PREPARED_QA.map((qa, i) => (
                  <button
                    key={i}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                    onClick={() => handlePreparedQuestion(qa)}
                  >
                    {qa.q}
                  </button>
                ))}
              </div>
              <div className="h-64 overflow-y-auto bg-white/5 rounded-xl p-4 mb-4 flex flex-col gap-2">
                {chatHistory.length === 0 && <div className="text-gray-400">Ask me anything about fitness or nutrition!</div>}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-xl max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-900'}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {/* Removed chat input and send button */}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Ultra-Modern Footer */}
      <div className="group relative max-w-4xl mx-auto my-16 bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <FeedbackList limit={6} showViewMore={true} />
      </div>
      <footer className="relative z-10 bg-white/5 backdrop-blur-2xl border-t border-white/10 px-6 py-16 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[{label: 'About', to: '/about'}, {label: 'Features', to: '/features'}, {label: 'Support', to: '/support'}, {label: 'Feedback', to: '/feedback'}].map((item, index) => (
              <div key={item.label} className="flex flex-col items-center">
                <Link
                  to={item.to}
                  className={`w-full bg-white/5 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-white py-6 rounded-2xl font-bold transition-all transform hover:scale-105 border border-white/10 hover:border-transparent shadow-lg text-center`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-lg">
              &copy; 2025 <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">SyncFit</span>. 
              All rights reserved. Built with <Heart className="inline w-4 h-4 text-red-400 animate-pulse" /> for fitness enthusiasts.
            </p>
          </div>
        </div>
      </footer>

      {/* Workout Plan Modal */}
      {showWorkoutForm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <WorkoutPlanForm onClose={() => setShowWorkoutForm(false)} />
        </div>,
        document.body
      )}
      </div>
  );
};

export default Home;