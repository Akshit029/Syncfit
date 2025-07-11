import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useRef } from 'react';

const equipmentOptions = [
  'Dumbbells', 'Barbell', 'Bench', 'Pull-up Bar', 'Resistance Bands', 'Kettlebell', 'Treadmill', 'Stationary Bike', 'Rowing Machine', 'None/Home Bodyweight'
];
const splitOptions = [
  { value: 'push-pull-legs', label: 'Push/Pull/Legs' },
  { value: 'upper-lower', label: 'Upper/Lower Body' },
  { value: 'full-body', label: 'Full Body' },
  { value: 'bro-split', label: 'Bro Split (Chest/Back/Arms/Legs/Shoulders)' },
  { value: 'custom', label: 'Custom' }
];
const trainingStyles = [
  'Strength', 'Hypertrophy (Muscle Gain)', 'Endurance', 'HIIT', 'CrossFit', 'Powerlifting', 'Olympic Lifting', 'General Fitness', 'Other'
];
const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function getCurrentUserEmail() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

function WorkoutPlanForm() {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bodyFat: '',
    fitness: '',
    activity: '',
    goal: '',
    goalTimeline: '',
    experience: '',
    split: '',
    customSplit: '',
    days: [],
    sessionDuration: '',
    trainingStyle: '',
    facility: '',
    equipment: [],
    injuries: '',
    mobility: '',
    cardio: '',
    sports: '',
    preferences: '',
    motivation: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const resultRef = useRef(null);
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'equipment') {
      setForm(f => ({
        ...f,
        equipment: checked ? [...f.equipment, value] : f.equipment.filter(eq => eq !== value)
      }));
    } else if (type === 'checkbox' && name === 'days') {
      setForm(f => ({
        ...f,
        days: checked ? [...f.days, value] : f.days.filter(d => d !== value)
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    const splitText = form.split === 'custom' ? form.customSplit : splitOptions.find(opt => opt.value === form.split)?.label || '';
    const prompt = `Generate a personalized workout plan for the following user profile.\n\n` +
      `Age: ${form.age}\n` +
      `Gender: ${form.gender}\n` +
      `Height: ${form.height} ${form.heightUnit}\n` +
      `Weight: ${form.weight} ${form.weightUnit}\n` +
      `Body Fat %: ${form.bodyFat}\n` +
      `Fitness Level: ${form.fitness}\n` +
      `Current Activity Level: ${form.activity}\n` +
      `Goal: ${form.goal}\n` +
      `Goal Timeline: ${form.goalTimeline}\n` +
      `Experience: ${form.experience}\n` +
      `Preferred Workout Split: ${splitText}\n` +
      `Preferred Training Days: ${form.days.join(', ')}\n` +
      `Session Duration: ${form.sessionDuration} minutes\n` +
      `Preferred Training Style: ${form.trainingStyle}\n` +
      `Access to Facilities: ${form.facility}\n` +
      `Available Equipment: ${form.equipment.join(', ')}\n` +
      `Injuries/Limitations: ${form.injuries}\n` +
      `Mobility/Flexibility Needs: ${form.mobility}\n` +
      `Cardio Preference: ${form.cardio}\n` +
      `Sports/Other Activities: ${form.sports}\n` +
      `Workout Preferences: ${form.preferences}\n` +
      `Motivation Level: ${form.motivation}\n` +
      `\nPlease provide a detailed workout plan for each day, with exercise breakdowns, sets, reps, rest, and ensure all restrictions and preferences are followed. Format the output clearly for the user.`;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/gemini/ask`, {
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

  const handleCopy = () => {
    if (resultRef.current) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleSendPdf = async () => {
    setPdfStatus('');
    setPdfLoading(true);
    const email = getCurrentUserEmail();
    if (!email) {
      setPdfStatus('Could not get your email. Please log in again.');
      setPdfLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pdf/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: result, type: 'workout' })
      });
      const data = await res.json();
      if (data.success) {
        setPdfStatus('PDF sent to your email!');
      } else {
        setPdfStatus('Failed to send PDF.');
      }
    } catch {
      setPdfStatus('Failed to send PDF.');
    }
    setPdfLoading(false);
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl max-w-lg mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-2 justify-center"><Sparkles className="w-7 h-7" /> Generate Workout Plan</h2>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Height</label>
            <div className="flex gap-2">
              <input type="number" name="height" value={form.height} onChange={handleChange} min="50" max="250" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" />
              <select name="heightUnit" value={form.heightUnit} onChange={handleChange} className="bg-slate-700 border border-slate-600 rounded-xl px-2 py-2 text-white">
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Weight</label>
            <div className="flex gap-2">
              <input type="number" name="weight" value={form.weight} onChange={handleChange} min="20" max="300" required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" />
              <select name="weightUnit" value={form.weightUnit} onChange={handleChange} className="bg-slate-700 border border-slate-600 rounded-xl px-2 py-2 text-white">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Body Fat % (if known)</label>
            <input type="number" name="bodyFat" value={form.bodyFat} onChange={handleChange} min="1" max="70" className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. 18" />
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Current Activity Level</label>
            <select name="activity" value={form.activity} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
              <option value="">Select</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (light exercise/sports 1-3 days/week)</option>
              <option value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</option>
              <option value="active">Very active (hard exercise/sports 6-7 days/week)</option>
              <option value="athlete">Extra active (very hard exercise & physical job or 2x training)</option>
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Goal Timeline</label>
            <input type="text" name="goalTimeline" value={form.goalTimeline} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. 3 months, 6 weeks" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Experience (years, sports, etc.)</label>
            <input type="text" name="experience" value={form.experience} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. 2 years lifting, played soccer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Workout Split</label>
          <select name="split" value={form.split} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
            <option value="">Select</option>
            {splitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {form.split === 'custom' && (
            <input type="text" name="customSplit" value={form.customSplit} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white mt-2" placeholder="Describe your custom split" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Training Days</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center gap-1 text-slate-200">
                <input type="checkbox" name="days" value={day} checked={form.days.includes(day)} onChange={handleChange} /> {day}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Session Duration (minutes)</label>
            <input type="number" name="sessionDuration" value={form.sessionDuration} onChange={handleChange} min="20" max="180" className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. 60" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Training Style</label>
            <select name="trainingStyle" value={form.trainingStyle} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
              <option value="">Select</option>
              {trainingStyles.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Access to Facilities</label>
            <select name="facility" value={form.facility} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
              <option value="">Select</option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="outdoors">Outdoors</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Available Equipment</label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(eq => (
                <label key={eq} className="flex items-center gap-1 text-slate-200">
                  <input type="checkbox" name="equipment" value={eq} checked={form.equipment.includes(eq)} onChange={handleChange} /> {eq}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Injuries/Limitations</label>
            <input type="text" name="injuries" value={form.injuries} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. knee pain, back issues, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mobility/Flexibility Needs</label>
            <input type="text" name="mobility" value={form.mobility} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. tight hamstrings, yoga needed" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Cardio Preference</label>
            <input type="text" name="cardio" value={form.cardio} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. running, cycling, HIIT, none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sports/Other Activities</label>
            <input type="text" name="sports" value={form.sports} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. football, swimming" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Workout Preferences (optional)</label>
          <input type="text" name="preferences" value={form.preferences} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white" placeholder="e.g. HIIT, yoga, running, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Motivation Level</label>
          <select name="motivation" value={form.motivation} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white">
            <option value="">Select</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
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
        <div className="mt-8 bg-slate-900/70 rounded-xl p-6 border border-slate-700 text-white max-h-[500px] overflow-y-auto relative">
          <button onClick={handleCopy} className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Copy</button>
          <h4 className="text-xl font-bold mb-4 text-blue-400">Your AI-Generated Workout Plan:</h4>
          <div ref={resultRef}>
            {(() => {
              // Split by day (🗓️ or Day X)
              const daySections = result.split(/\n?🗓️? ?Day ?\d+:?/i).filter(Boolean);
              if (daySections.length > 1) {
                return daySections.map((section, idx) => {
                  const dayLabel = idx === 0 ? null : `🗓️ Day ${idx}`;
                  // Split by workout headings (🏋️, 🦵, etc.)
                  const workouts = section.split(/(🏋️|🦵|🧲|🔥|🧘|🛌|Workout Type:|Workout|Focus|Split|Session|Routine)/i).filter(Boolean);
                  return (
                    <div key={idx} className="mb-6 p-4 bg-slate-800 rounded-xl shadow">
                      {dayLabel && <div className="text-lg font-bold text-purple-300 mb-2">{dayLabel}</div>}
                      <div className="space-y-2">
                        {workouts.map((work, i) => {
                          if (/^(🏋️|🦵|🧲|🔥|🧘|🛌|Workout Type:|Workout|Focus|Split|Session|Routine)/i.test(work.trim())) {
                            // Heading
                            return <div key={i} className="font-semibold text-yellow-300 mt-2 text-base">{work.trim().replace(/\*/g, '')}</div>;
                          }
                          // Bullet points for lines starting with * or -
                          return (
                            <ul key={i} className="ml-6 list-disc text-base">
                              {work.split(/\n/).map((line, j) => {
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
          <div className="mt-4 flex items-center gap-4">
            <button onClick={handleSendPdf} disabled={pdfLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-60">
              {pdfLoading ? 'Sending...' : 'Send as PDF to Email'}
            </button>
            {pdfStatus && <span className="text-sm text-blue-300">{pdfStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Workout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <WorkoutPlanForm />
      </div>
    </div>
  );
} 