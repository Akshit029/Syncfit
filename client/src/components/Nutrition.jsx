import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Target, Calendar, BarChart3, Settings, User, Menu, X } from 'lucide-react';
import { useRef } from 'react';

const Nutrition = () => {
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nutritionHistory, setNutritionHistory] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().slice(0,10));
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mealsData, setMealsData] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [macros, setMacros] = useState({ carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' }, protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' }, fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' } });
  const [currentCalories, setCurrentCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [activeTab, setActiveTab] = useState('tracker');

  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const navItems = ['Home', 'Dashboard', 'Progress', 'Workouts', 'Settings'];

  const calorieProgress = (currentCalories / calorieGoal) * 100;
  const remainingCalories = calorieGoal - currentCalories;

  // Move fetchNutrition outside useEffect so it can be called after add/delete
  const fetchNutrition = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5001/api/nutrition/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNutritionHistory(Array.isArray(data) ? data : []);
      // Find today's log
      const todayEntry = data.find(d => d.date && d.date.slice(0,10) === today);
      setTodayLog(todayEntry || null);
      if (todayEntry) {
        setCurrentCalories(todayEntry.calories || 0);
        setMacros({
          carbs: { consumed: todayEntry.carbs || 0, goal: 250, color: 'from-orange-500 to-red-500' },
          protein: { consumed: todayEntry.protein || 0, goal: 150, color: 'from-blue-500 to-purple-500' },
          fat: { consumed: todayEntry.fats || 0, goal: 67, color: 'from-green-500 to-teal-500' }
        });
        // Group meals by type
        const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
        (todayEntry.meals || []).forEach(m => {
          if (grouped[m.mealType]) grouped[m.mealType].push(m);
        });
        setMealsData(grouped);
      } else {
        setCurrentCalories(0);
        setMacros({ carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' }, protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' }, fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' } });
        setMealsData({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
      }
    } catch {
      setNutritionHistory([]);
      setTodayLog(null);
      setCurrentCalories(0);
      setMacros({ carbs: { consumed: 0, goal: 250, color: 'from-orange-500 to-red-500' }, protein: { consumed: 0, goal: 150, color: 'from-blue-500 to-purple-500' }, fat: { consumed: 0, goal: 67, color: 'from-green-500 to-teal-500' } });
      setMealsData({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Read calorie goal from localStorage
    const storedGoalCalories = localStorage.getItem('syncfit_goal_calories');
    if (storedGoalCalories) setCalorieGoal(Number(storedGoalCalories));
    fetchNutrition();
  }, [today]);

  // Add food to today's log
  const handleAddFood = async (food) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    // Add to correct meal type
    const newMeals = [...(todayLog?.meals || []), { ...food, mealType: selectedMeal }];
    // Recalculate totals
    const newCalories = newMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const newProtein = newMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const newCarbs = newMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const newFats = newMeals.reduce((sum, m) => sum + (m.fats || 0), 0);
    try {
      await fetch('http://localhost:5001/api/nutrition/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: today,
          calories: newCalories,
          protein: newProtein,
          carbs: newCarbs,
          fats: newFats,
          meals: newMeals
        })
      });
      await fetchNutrition(); // Always refresh from backend
    } catch {}
    setLoading(false);
  };

  // Delete a meal from today's log
  const handleDeleteMeal = async (mealIdx, mealType) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const newMeals = (todayLog?.meals || []).filter((m, i) => !(i === mealIdx && m.mealType === mealType));
    // Recalculate totals
    const newCalories = newMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const newProtein = newMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const newCarbs = newMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const newFats = newMeals.reduce((sum, m) => sum + (m.fats || 0), 0);
    try {
      await fetch('http://localhost:5001/api/nutrition/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: today,
          calories: newCalories,
          protein: newProtein,
          carbs: newCarbs,
          fats: newFats,
          meals: newMeals
        })
      });
      await fetchNutrition(); // Always refresh from backend
    } catch {}
    setLoading(false);
  };

  const demoFoods = [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3 },
    { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fats: 2 },
    { name: 'Apple', calories: 95, protein: 0, carbs: 25, fats: 0 },
    { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fats: 0 },
    { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fats: 14 },
    { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fats: 3 },
    { name: 'Egg', calories: 78, protein: 6, carbs: 1, fats: 5 },
    { name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0 }
  ];

  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });
  const [addingFood, setAddingFood] = useState(false);

  const handleFoodFormChange = (e) => {
    const { name, value } = e.target;
    setFoodForm(f => ({ ...f, [name]: value }));
  };

  const handleFoodDemoClick = (food) => {
    setFoodForm({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats
    });
  };

  const handleFoodFormSubmit = async (e) => {
    e.preventDefault();
    setAddingFood(true);
    await handleAddFood({
      name: foodForm.name,
      calories: Number(foodForm.calories),
      protein: Number(foodForm.protein),
      carbs: Number(foodForm.carbs),
      fats: Number(foodForm.fats)
    });
    setFoodForm({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    setAddingFood(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Nutrition Tracker
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Track your meals, macros, and meet your goals
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              activeTab === 'tracker' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Food</span>
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              activeTab === 'summary' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Summary</span>
          </button>
          <button 
            onClick={() => setActiveTab('mealplan')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              activeTab === 'mealplan' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Generate Diet</span>
          </button>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'tracker' && (
          <>
            {/* Daily Calorie Target */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h3 className="text-xl font-semibold mb-2 md:mb-0">Daily Calorie Target</h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{remainingCalories}</p>
                  <p className="text-sm text-slate-400">calories remaining</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{calorieGoal}</span>
                  <Target className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-slate-400">calories per day</span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>{currentCalories} / {calorieGoal} kcal</span>
                  <span>{Math.round(calorieProgress)}%</span>
                </div>
              </div>
            </div>

            {/* Add Food Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Plus className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold">Add Food to Your Plan</h3>
              </div>

              <form onSubmit={handleFoodFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Meal Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select Meal
                  </label>
                  <select
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {meals.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Food Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Food Name</label>
                  <input
                    type="text"
                    name="name"
                    value={foodForm.name}
                    onChange={handleFoodFormChange}
                    placeholder="e.g. Chicken Breast"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                {/* Calories */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    value={foodForm.calories}
                    onChange={handleFoodFormChange}
                    placeholder="e.g. 165"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                {/* Protein */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={foodForm.protein}
                    onChange={handleFoodFormChange}
                    placeholder="e.g. 31"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                {/* Carbs */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={foodForm.carbs}
                    onChange={handleFoodFormChange}
                    placeholder="e.g. 0"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                {/* Fats */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Fats (g)</label>
                  <input
                    type="number"
                    name="fats"
                    value={foodForm.fats}
                    onChange={handleFoodFormChange}
                    placeholder="e.g. 3"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                {/* Submit Button */}
                <div className="md:col-span-2 flex items-center justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-60"
                    disabled={addingFood}
                  >
                    {addingFood ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    <span>{addingFood ? 'Adding...' : 'Add Food'}</span>
                  </button>
                </div>
              </form>

              {/* Demo Product List */}
              <div className="mt-6">
                <h4 className="text-slate-300 font-medium mb-2">Demo Foods (Quick Add)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {demoFoods.map((food) => (
                    <button
                      key={food.name}
                      type="button"
                      className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 text-sm transition-all duration-200 border border-slate-600/50 hover:border-slate-500 flex flex-col items-start"
                      onClick={() => handleFoodDemoClick(food)}
                    >
                      <span className="font-semibold text-white">{food.name}</span>
                      <span className="text-xs text-slate-400">{food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Foods/Quick Add */}
            {/* <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-semibold mb-4 text-slate-300">Recent Foods</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Oatmeal', 'Banana', 'Greek Yogurt', 'Almonds'].map((food) => (
                  <button
                    key={food}
                    className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 text-sm transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div> */}
          </>
        )}

        {activeTab === 'summary' && (
          <>
            {/* Macro Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(macros).map(([macro, data]) => (
                <div key={macro} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-semibold mb-4 capitalize">{macro}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold">{data.consumed}g</span>
                    <span className="text-slate-400">/ {data.goal}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${data.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((data.consumed / data.goal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {Math.round((data.consumed / data.goal) * 100)}% of goal
                  </p>
                </div>
              ))}
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl mb-8">
              <h3 className="text-xl font-semibold mb-6">Weekly Progress</h3>
              <div className="flex items-end justify-between h-48 space-x-2">
                {nutritionHistory.map((entry, index) => (
                  <div key={entry.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-slate-700 rounded-t-lg relative overflow-hidden" style={{ height: '160px' }}>
                      <div 
                        className="bg-gradient-to-t from-blue-600 to-purple-600 w-full absolute bottom-0 transition-all duration-700 ease-out rounded-t-lg"
                        style={{ height: `${(entry.calories / calorieGoal) * 100}%` }}
                      />
                      <div className="absolute top-2 left-0 right-0 text-center">
                        <span className="text-xs text-white font-medium">{entry.calories}</span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400 mt-2">{entry.date.slice(5, 7)}/{entry.date.slice(8, 10)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Meals Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-semibold mb-6">Today's Meals</h3>
              <div className="space-y-4">
                {Object.entries(mealsData).map(([mealType, foods]) => (
                  <div key={mealType} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2 capitalize">{mealType}</h4>
                    <div className="space-y-2">
                      {foods.map((food, index) => {
                        // Find the correct index in todayLog.meals
                        const flatIndex = (todayLog?.meals || []).findIndex(
                          (m, i) => m.mealType === mealType && m.name === food.name && m.calories === food.calories && m.protein === food.protein && m.carbs === food.carbs && m.fats === food.fats && (mealsData[mealType].filter(f => f.name === food.name && f.calories === food.calories && f.protein === food.protein && f.carbs === food.carbs && f.fats === food.fats).indexOf(food) === mealsData[mealType].slice(0, index + 1).filter(f => f.name === food.name && f.calories === food.calories && f.protein === food.protein && f.carbs === food.carbs && f.fats === food.fats).length - 1)
                        );
                        return (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{food.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">{food.calories} cal</span>
                              <button
                                className="ml-2 text-red-400 hover:text-red-600 font-bold text-xs px-2 py-1 rounded transition-colors duration-150 border border-red-400 hover:border-red-600"
                                onClick={() => handleDeleteMeal(flatIndex, mealType)}
                                title="Remove"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'mealplan' && (
          <>
            {/* Generate Diet Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h3 className="text-xl font-semibold mb-4 md:mb-0">Generate Personalized Diet Plan</h3>
              </div>
            </div>

            {/* Diet Generation Form */}
            <DietForm />
          </>
        )}
      </main>
    </div>
  );
};

export default Nutrition;

function DietForm() {
  const [form, setForm] = React.useState({
    age: '',
    gender: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bodyFat: '',
    activity: '',
    goal: '',
    goalTimeline: '',
    calories: '',
    preferences: '',
    allergies: '',
    dislikes: '',
    religious: '',
    cuisines: '',
    appliances: '',
    medical: '',
    medications: '',
    schedule: '',
    mealsPerDay: '3',
    budget: '',
    budgetUnit: 'per week',
    cooking: '',
    water: '',
    stress: '',
    sleep: '',
    days: '7',
  });
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState('');
  const [error, setError] = React.useState('');

  const resultRef = React.useRef(null);
  const handleCopy = () => {
    if (resultRef.current) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    // Compose detailed prompt for Gemini
    const prompt = `Generate a personalized ${form.days}-day diet plan for the following user profile.\n\n` +
      `Age: ${form.age}\n` +
      `Gender: ${form.gender}\n` +
      `Height: ${form.height} ${form.heightUnit}\n` +
      `Weight: ${form.weight} ${form.weightUnit}\n` +
      `Body Fat %: ${form.bodyFat}\n` +
      `Activity Level: ${form.activity}\n` +
      `Goal: ${form.goal}\n` +
      `Goal Timeline: ${form.goalTimeline}\n` +
      `Target Calories per day: ${form.calories}\n` +
      `Dietary Preferences: ${form.preferences}\n` +
      `Allergies/Intolerances: ${form.allergies}\n` +
      `Food Dislikes: ${form.dislikes}\n` +
      `Religious/Cultural Restrictions: ${form.religious}\n` +
      `Preferred Cuisines: ${form.cuisines}\n` +
      `Cooking Appliances: ${form.appliances}\n` +
      `Medical Conditions: ${form.medical}\n` +
      `Medications/Supplements: ${form.medications}\n` +
      `Typical Daily Schedule: ${form.schedule}\n` +
      `Meals per day: ${form.mealsPerDay}\n` +
      `Budget: ${form.budget} ${form.budgetUnit}\n` +
      `Cooking Skill/Time: ${form.cooking}\n` +
      `Water Intake: ${form.water}\n` +
      `Stress Level: ${form.stress}\n` +
      `Sleep Quality: ${form.sleep}\n` +
      `\nPlease provide a detailed meal plan for each day, with meal breakdowns, and ensure all restrictions and preferences are followed. Format the output clearly for the user.`;
    try {
      const res = await fetch('http://localhost:5001/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await res.json();
      setResult(data.answer || 'No response from AI.');
    } catch (err) {
      setError('Failed to generate diet plan.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-xl max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} min="1" max="120" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Height</label>
            <div className="flex gap-2">
              <input type="number" name="height" value={form.height} onChange={handleChange} min="50" max="250" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              <select name="heightUnit" value={form.heightUnit} onChange={handleChange} className="bg-slate-700 border border-slate-600 rounded-xl px-2 py-2 text-white">
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Weight</label>
            <div className="flex gap-2">
              <input type="number" name="weight" value={form.weight} onChange={handleChange} min="20" max="300" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" />
              <select name="weightUnit" value={form.weightUnit} onChange={handleChange} className="bg-slate-700 border border-slate-600 rounded-xl px-2 py-2 text-white">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Body Fat % (if known)</label>
            <input type="number" name="bodyFat" value={form.bodyFat} onChange={handleChange} min="1" max="70" className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. 18" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Goal Timeline</label>
            <input type="text" name="goalTimeline" value={form.goalTimeline} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. 3 months, 6 weeks" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
          <select name="activity" value={form.activity} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
            <option value="">Select</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Lightly active (light exercise/sports 1-3 days/week)</option>
            <option value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</option>
            <option value="active">Very active (hard exercise/sports 6-7 days/week)</option>
            <option value="athlete">Extra active (very hard exercise & physical job or 2x training)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Primary Goal</label>
          <select name="goal" value={form.goal} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
            <option value="">Select</option>
            <option value="weight loss">Weight Loss</option>
            <option value="muscle gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="recomposition">Body Recomposition</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Calories per day (optional)</label>
            <input type="number" name="calories" value={form.calories} onChange={handleChange} min="1000" max="5000" className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. 2000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Meals per day</label>
            <select name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Dietary Preferences</label>
          <input type="text" name="preferences" value={form.preferences} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. vegetarian, vegan, keto, paleo, etc." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Allergies/Intolerances</label>
            <input type="text" name="allergies" value={form.allergies} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. nuts, dairy, gluten" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Food Dislikes</label>
            <input type="text" name="dislikes" value={form.dislikes} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. mushrooms, onions" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Religious/Cultural Restrictions</label>
            <input type="text" name="religious" value={form.religious} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. halal, kosher, vegetarian on Fridays" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Cuisines</label>
            <input type="text" name="cuisines" value={form.cuisines} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. Indian, Italian, Chinese" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cooking Appliances Available</label>
          <input type="text" name="appliances" value={form.appliances} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. microwave, oven, stove, blender" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Medical Conditions</label>
            <input type="text" name="medical" value={form.medical} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. diabetes, hypertension, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Medications/Supplements</label>
            <input type="text" name="medications" value={form.medications} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. metformin, vitamin D" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Typical Daily Schedule (wake/sleep/meal times)</label>
          <textarea name="schedule" value={form.schedule} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. wake 7am, breakfast 8am, lunch 1pm, dinner 8pm, sleep 11pm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Budget</label>
            <input type="text" name="budget" value={form.budget} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. 2000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Budget Unit</label>
            <select name="budgetUnit" value={form.budgetUnit} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
              <option value="per week">per week</option>
              <option value="per month">per month</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cooking Skill/Time (optional)</label>
          <input type="text" name="cooking" value={form.cooking} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. beginner, advanced, quick meals, etc." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Water Intake (liters/day)</label>
            <input type="text" name="water" value={form.water} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="e.g. 2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stress Level</label>
            <select name="stress" value={form.stress} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
              <option value="">Select</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Quality</label>
          <select name="sleep" value={form.sleep} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
            <option value="">Select</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Number of days</label>
          <select name="days" value={form.days} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </div>
        <div className="flex items-center justify-end mt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Diet'}</span>
          </button>
        </div>
      </form>
      {error && <div className="text-red-400 mt-4">{error}</div>}
      {result && (
        <div className="mt-8 bg-slate-900/70 rounded-xl p-6 border border-slate-700 text-white max-h-[500px] overflow-y-auto relative">
          <button onClick={handleCopy} className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Copy</button>
          <h4 className="text-xl font-bold mb-4 text-green-400">Your AI-Generated Diet Plan:</h4>
          <div ref={resultRef}>
            {(() => {
              // Split by day (🗓️ or Day X)
              const daySections = result.split(/\n?🗓️? ?Day ?\d+:?/i).filter(Boolean);
              if (daySections.length > 1) {
                return daySections.map((section, idx) => {
                  const dayLabel = idx === 0 ? null : `🗓️ Day ${idx}`;
                  // Split by meal headings
                  const meals = section.split(/(🍳 Breakfast|🥗 Lunch|��️ Dinner|Snack)/i).filter(Boolean);
                  return (
                    <div key={idx} className="mb-6 p-4 bg-slate-800 rounded-xl shadow">
                      {dayLabel && <div className="text-lg font-bold text-blue-300 mb-2">{dayLabel}</div>}
                      <div className="space-y-2">
                        {meals.map((meal, i) => {
                          if (/^(🍳 Breakfast|🥗 Lunch|🍽️ Dinner|Snack)/i.test(meal.trim())) {
                            // Heading
                            return <div key={i} className="font-semibold text-yellow-300 mt-2 text-base">{meal.trim().replace(/\*/g, '')}</div>;
                          }
                          // Bullet points for lines starting with * or -
                          return (
                            <ul key={i} className="ml-6 list-disc text-base">
                              {meal.split(/\n/).map((line, j) => {
                                const clean = line.replace(/^\s*[-*]\s*/, '').replace(/\*/g, '').trim();
                                if (!clean) return null;
                                return <li key={j}>{clean}</li>;
                              })}
                            </ul>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              } else {
                // Fallback: just clean up asterisks and show as text
                return <div className="whitespace-pre-line text-base leading-relaxed">{result.replace(/\*/g, '')}</div>;
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}