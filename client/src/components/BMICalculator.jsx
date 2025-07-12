import React, { useState } from 'react';
import { Calculator, Scale, Flame, User, Activity, Target, TrendingUp, Apple, Dumbbell, Settings, Bell, Home, BarChart3 } from 'lucide-react';

const BMICalculators = () => {
  const [activeTab, setActiveTab] = useState('bmi');
  const [activeNav, setActiveNav] = useState('calculators');
  
  // BMI Calculator State
  const [bmiData, setBmiData] = useState({
    height: '',
    weight: '',
    unit: 'metric' // metric or imperial
  });
  const [bmiResult, setBmiResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Calories Calculator State
  const [caloriesData, setCaloriesData] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity: 'sedentary',
    unit: 'metric'
  });
  const [caloriesResult, setCaloriesResult] = useState(null);
  const [caloriesSaveStatus, setCaloriesSaveStatus] = useState(null);
  // Add to Calories Calculator state
  const [calorieGoalType, setCalorieGoalType] = useState('maintain'); // 'loss', 'maintain', 'gain'

  const allGoals = [
    { key: 'Weight Loss', color: 'bg-red-600', valueKey: 'weightLoss' },
    { key: 'Muscle Gain', color: 'bg-blue-600', valueKey: 'weightGain' },
    { key: 'Endurance', color: 'bg-green-600', valueKey: 'maintenance' },
    { key: 'Strength', color: 'bg-purple-600', valueKey: 'maintenance' },
    { key: 'Flexibility', color: 'bg-teal-600', valueKey: 'maintenance' },
    { key: 'General Fitness', color: 'bg-indigo-600', valueKey: 'maintenance' },
  ];
  const [selectedOutputGoal, setSelectedOutputGoal] = useState(null);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (Little/no exercise)', multiplier: 1.2 },
    { value: 'light', label: 'Light (Light exercise 1-3 days/week)', multiplier: 1.375 },
    { value: 'moderate', label: 'Moderate (Moderate exercise 3-5 days/week)', multiplier: 1.55 },
    { value: 'active', label: 'Active (Hard exercise 6-7 days/week)', multiplier: 1.725 },
    { value: 'very_active', label: 'Very Active (Very hard exercise, physical job)', multiplier: 1.9 }
  ];

  const calculateBMI = async () => {
    let heightInM = parseFloat(bmiData.height);
    let weightInKg = parseFloat(bmiData.weight);
    
    if (!heightInM || !weightInKg) return;
    
    if (bmiData.unit === 'imperial') {
      heightInM = heightInM * 0.3048; // feet to meters
      weightInKg = weightInKg * 0.453592; // pounds to kg
    } else {
      heightInM = heightInM / 100; // cm to meters
    }
    
    const bmi = weightInKg / (heightInM * heightInM);
    
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-400';
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'text-green-400';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-400';
    } else {
      category = 'Obese';
      color = 'text-red-400';
    }
    
    setBmiResult({
      bmi: bmi.toFixed(1),
      category,
      color
    });
    // Save to backend
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bmi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          value: Number(bmi.toFixed(1)),
          height: parseFloat(bmiData.height),
          weight: parseFloat(bmiData.weight),
          unit: bmiData.unit
        })
      });
      if (res.ok) {
        setSaveStatus('BMI saved!');
      } else {
        const data = await res.json();
        setSaveStatus(data.message || 'Failed to save BMI');
      }
    } catch (err) {
      setSaveStatus('Network error');
    }
  };

  const calculateCalories = async () => {
    const age = parseInt(caloriesData.age);
    let height = parseFloat(caloriesData.height);
    let weight = parseFloat(caloriesData.weight);
    if (!age || !height || !weight) return;
    // Convert to metric if imperial
    if (caloriesData.unit === 'imperial') {
      height = height * 30.48; // feet to cm
      weight = weight * 0.453592; // pounds to kg
    }
    // Harris-Benedict Equation
    let bmr;
    if (caloriesData.gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    const activityMultiplier = activityLevels.find(level => level.value === caloriesData.activity)?.multiplier || 1.2;
    const tdee = bmr * activityMultiplier;
    const result = {
      bmr: Math.round(bmr),
      maintenance: Math.round(tdee),
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 500)
    };
    setCaloriesResult(result);
    // Save to backend
    setCaloriesSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/calories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...result,
          age,
          gender: caloriesData.gender,
          height: parseFloat(caloriesData.height),
          weight: parseFloat(caloriesData.weight),
          activity: caloriesData.activity,
          unit: caloriesData.unit
        })
      });
      if (res.ok) {
        setCaloriesSaveStatus('Calories data saved!');
      } else {
        const data = await res.json();
        setCaloriesSaveStatus(data.message || 'Failed to save calories data');
      }
    } catch (err) {
      setCaloriesSaveStatus('Network error');
    }
    if (result) {
      let goal = 'Maintain Weight';
      let goalCalories = result.maintenance;
      if (calorieGoalType === 'loss') {
        goal = 'Weight Loss';
        goalCalories = result.weightLoss;
      } else if (calorieGoalType === 'gain') {
        goal = 'Weight Gain';
        goalCalories = result.weightGain;
      }
      localStorage.setItem('syncfit_goal', goal);
      localStorage.setItem('syncfit_goal_calories', goalCalories);
    }
  };

  const isLoggedIn = () => !!localStorage.getItem('token');

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Health Calculators</h1>
          <p className="text-gray-400">Calculate your BMI and daily calorie needs</p>
        </div>

        {/* Calculator Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-1 border border-gray-700/50">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('bmi')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'bmi'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Scale size={18} />
                <span className="font-medium">BMI Calculator</span>
              </button>
              <button
                onClick={() => setActiveTab('calories')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'calories'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Flame size={18} />
                <span className="font-medium">Calories Calculator</span>
              </button>
            </div>
          </div>
        </div>

        {/* BMI Calculator */}
        {activeTab === 'bmi' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Scale className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">BMI Calculator</h2>
              </div>

              <div className="space-y-4">
                {/* Unit Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Units</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBmiData({...bmiData, unit: 'metric'})}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        bmiData.unit === 'metric'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Metric
                    </button>
                    <button
                      onClick={() => setBmiData({...bmiData, unit: 'imperial'})}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        bmiData.unit === 'imperial'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Height ({bmiData.unit === 'metric' ? 'cm' : 'feet'})
                  </label>
                  <input
                    type="number"
                    value={bmiData.height}
                    onChange={(e) => setBmiData({...bmiData, height: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={bmiData.unit === 'metric' ? 'e.g., 175' : 'e.g., 5.9'}
                  />
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Weight ({bmiData.unit === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    value={bmiData.weight}
                    onChange={(e) => setBmiData({...bmiData, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={bmiData.unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                  />
                </div>

                {/* Calculate Button */}
                <button
                  onClick={isLoggedIn() ? calculateBMI : () => setShowLoginPrompt(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Calculator size={16} />
                  <span>Calculate BMI</span>
                </button>
                {saveStatus && (
                  <div className="mt-2 text-center text-sm text-white">{saveStatus}</div>
                )}
              </div>
            </div>

            {/* BMI Result */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <Target className="text-green-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">BMI Result</h2>
              </div>

              {bmiResult ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-2">{bmiResult.bmi}</div>
                    <div className={`text-xl font-semibold ${bmiResult.color}`}>{bmiResult.category}</div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">BMI Categories</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Underweight</span>
                          <span className="text-blue-400">&lt; 18.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Normal weight</span>
                          <span className="text-green-400">18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Overweight</span>
                          <span className="text-yellow-400">25.0 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Obese</span>
                          <span className="text-red-400">≥ 30.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Calculator className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-400">Enter your height and weight to calculate BMI</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calories Calculator */}
        {activeTab === 'calories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-orange-600/20 rounded-lg">
                  <Flame className="text-orange-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Calories Calculator</h2>
              </div>

              <div className="space-y-4">
                {/* Unit Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Units</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCaloriesData({...caloriesData, unit: 'metric'})}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        caloriesData.unit === 'metric'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Metric
                    </button>
                    <button
                      onClick={() => setCaloriesData({...caloriesData, unit: 'imperial'})}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        caloriesData.unit === 'imperial'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Age</label>
                    <input
                      type="number"
                      value={caloriesData.age}
                      onChange={(e) => setCaloriesData({...caloriesData, age: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Gender</label>
                    <select
                      value={caloriesData.gender}
                      onChange={(e) => setCaloriesData({...caloriesData, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Height ({caloriesData.unit === 'metric' ? 'cm' : 'feet'})
                  </label>
                  <input
                    type="number"
                    value={caloriesData.height}
                    onChange={(e) => setCaloriesData({...caloriesData, height: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={caloriesData.unit === 'metric' ? 'e.g., 175' : 'e.g., 5.9'}
                  />
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Weight ({caloriesData.unit === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    value={caloriesData.weight}
                    onChange={(e) => setCaloriesData({...caloriesData, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={caloriesData.unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Activity Level</label>
                  <select
                    value={caloriesData.activity}
                    onChange={(e) => setCaloriesData({...caloriesData, activity: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {activityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={isLoggedIn() ? calculateCalories : () => setShowLoginPrompt(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Flame size={16} />
                  <span>Calculate Calories</span>
                </button>
                {caloriesSaveStatus && (
                  <div className="mt-2 text-center text-sm text-white">{caloriesSaveStatus}</div>
                )}
              </div>
            </div>

            {/* Calories Result */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Calorie Results</h2>
              </div>

              {caloriesResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{caloriesResult.bmr}</div>
                      <div className="text-sm text-gray-300">BMR</div>
                      <div className="text-xs text-gray-400 mt-1">Base Metabolic Rate</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{caloriesResult.maintenance}</div>
                      <div className="text-sm text-gray-300">Maintenance</div>
                      <div className="text-xs text-gray-400 mt-1">Calories to maintain weight</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">Weight Goals</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span className="text-gray-300">Weight Loss</span>
                          </div>
                          <span className="text-red-400 font-semibold">{caloriesResult.weightLoss} cal/day</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-gray-300">Maintain Weight</span>
                          </div>
                          <span className="text-green-400 font-semibold">{caloriesResult.maintenance} cal/day</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-300">Weight Gain</span>
                          </div>
                          <span className="text-blue-400 font-semibold">{caloriesResult.weightGain} cal/day</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">Note</h3>
                      <p className="text-gray-400 text-sm">
                        These calculations are estimates based on the Harris-Benedict equation. 
                        Individual results may vary based on factors like muscle mass, metabolism, and health conditions.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Flame className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-400">Enter your details to calculate daily calorie needs</p>
                </div>
              )}
              {caloriesResult && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3 text-center">Choose Your Goal</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {allGoals.map(goal => (
                      <button
                        key={goal.key}
                        className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg border border-white/10 ${goal.color} ${selectedOutputGoal === goal.key ? 'ring-4 ring-white/30 scale-105' : 'opacity-90 hover:opacity-100 hover:scale-105'}`}
                        onClick={() => {
                          setSelectedOutputGoal(goal.key);
                          let cal = caloriesResult[goal.valueKey] || caloriesResult.maintenance;
                          localStorage.setItem('syncfit_goal', goal.key);
                          localStorage.setItem('syncfit_goal_calories', cal);
                        }}
                      >
                        {goal.key} {selectedOutputGoal === goal.key && <span className="ml-2">✓</span>}
                      </button>
                    ))}
                  </div>
                  {selectedOutputGoal && (
                    <div className="mt-3 text-center text-green-400 font-medium">Goal set to: {selectedOutputGoal}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <Activity className="text-yellow-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Health Tips</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">BMI Guidelines</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• BMI is a screening tool, not a diagnostic tool</p>
                <p>• It doesn't account for muscle mass or body composition</p>
                <p>• Consult healthcare providers for personalized advice</p>
                <p>• Focus on healthy habits rather than just numbers</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Calorie Guidelines</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Weight loss: 1-2 pounds per week is considered safe</p>
                <p>• Quality of calories matters as much as quantity</p>
                <p>• Stay hydrated and get adequate sleep</p>
                <p>• Combine diet with regular physical activity</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Prompt Modal */}
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
};

function LoginPrompt({ open, onClose }) {
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

export default BMICalculators;