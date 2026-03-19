/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Play, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  LayoutGrid,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from './hooks/useAppState';
import { cn, calculate1RM } from './lib/utils';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { RestTimer } from './components/RestTimer';

type Tab = 'exercises' | 'workouts' | 'planner' | 'stats' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('workouts');
  const { state, addExercise, deleteExercise, addWorkout, updateWorkout, deleteWorkout, updateSchedule, addLog, addBodyweight } = useAppState();
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [showTimer, setShowTimer] = useState(false);

  const startWorkout = (workoutId: string) => {
    const workout = state.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    setActiveWorkoutId(workoutId);
    setCurrentLog({
      workoutId,
      date: new Date().toISOString(),
      exercises: workout.exercises.map(we => ({
        exerciseId: we.exerciseId,
        sets: Array(we.sets).fill(null).map(() => ({ reps: we.reps, weight: 0, completed: false }))
      }))
    });
    setIsLoggingWorkout(true);
  };

  const finishWorkout = () => {
    addLog(currentLog);
    setIsLoggingWorkout(false);
    setActiveWorkoutId(null);
    setCurrentLog(null);
    setActiveTab('history');
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const newLog = { ...currentLog };
    newLog.exercises[exerciseIndex].sets[setIndex][field] = value;
    setCurrentLog(newLog);
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const newLog = { ...currentLog };
    const set = newLog.exercises[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;
    setCurrentLog(newLog);
    if (set.completed) {
      setShowTimer(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-zinc-100 font-sans pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      {/* Header */}
      {!isLoggingWorkout && (
        <header className="px-6 pt-10 pb-6 flex justify-between items-end sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border-slate/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none uppercase italic">Gymge</h1>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Iron Slate Edition</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Live</span>
          </div>
        </header>
      )}

      <main className="px-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {isLoggingWorkout ? (
            <motion.div
              key="logging"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 pt-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsLoggingWorkout(false)}
                  className="w-12 h-12 flex items-center justify-center bg-card rounded-2xl border border-border-slate text-zinc-400 hover:text-white transition-all active:scale-90"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    {state.workouts.find(w => w.id === activeWorkoutId)?.name}
                  </h2>
                  <p className="text-[10px] text-brand uppercase tracking-[0.2em] font-bold">Session Active</p>
                </div>
                <button 
                  onClick={finishWorkout}
                  className="px-6 py-3 bg-brand text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 active:scale-95 transition-all"
                >
                  Finish
                </button>
              </div>

              <div className="space-y-12 pb-10">
                {currentLog.exercises.map((exLog: any, exIdx: number) => {
                  const exercise = state.exercises.find(e => e.id === exLog.exerciseId);
                  return (
                    <div key={exLog.exerciseId} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{exercise?.name}</h3>
                      </div>
                      <div className="space-y-4">
                        {exLog.sets.map((set: any, setIdx: number) => (
                          <div 
                            key={setIdx} 
                            className={cn(
                              "grid grid-cols-4 gap-4 items-center p-5 rounded-[2rem] transition-all duration-500",
                              set.completed 
                                ? "bg-brand/5 border border-brand/30 opacity-40 scale-[0.98]" 
                                : "bg-card border border-border-slate shadow-xl"
                            )}
                          >
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Set {setIdx + 1}</div>
                            <div className="relative">
                              <input
                                type="number"
                                value={set.weight || ''}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  updateSet(exIdx, setIdx, 'weight', isNaN(val) ? 0 : val);
                                }}
                                className="w-full bg-surface border-none rounded-xl p-3 text-center text-sm font-bold focus:ring-2 focus:ring-brand/30 text-white"
                              />
                              <span className="absolute -bottom-5 left-0 right-0 text-[8px] text-center text-muted font-black uppercase tracking-widest">kg</span>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                value={set.reps || ''}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                  updateSet(exIdx, setIdx, 'reps', isNaN(val) ? 0 : val);
                                }}
                                className="w-full bg-surface border-none rounded-xl p-3 text-center text-sm font-bold focus:ring-2 focus:ring-brand/30 text-white"
                              />
                              <span className="absolute -bottom-5 left-0 right-0 text-[8px] text-center text-muted font-black uppercase tracking-widest">reps</span>
                            </div>
                            <button
                              onClick={() => toggleSetComplete(exIdx, setIdx)}
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-all duration-500 shadow-lg",
                                set.completed 
                                  ? "bg-brand text-black scale-110 shadow-brand/40" 
                                  : "bg-surface text-zinc-700 hover:text-zinc-400 border border-border-slate"
                              )}
                            >
                              <CheckCircle2 size={24} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="pt-8"
            >
              {activeTab === 'exercises' && (
                <ExercisesView state={state} addExercise={addExercise} deleteExercise={deleteExercise} />
              )}

              {activeTab === 'workouts' && (
                <WorkoutsView state={state} addWorkout={addWorkout} updateWorkout={updateWorkout} deleteWorkout={deleteWorkout} startWorkout={startWorkout} />
              )}

              {activeTab === 'planner' && (
                <PlannerView state={state} updateSchedule={updateSchedule} />
              )}

              {activeTab === 'stats' && (
                <StatsView state={state} addBodyweight={addBodyweight} />
              )}

              {activeTab === 'history' && (
                <HistoryView state={state} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      {!isLoggingWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-3xl border-t border-border-slate px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton active={activeTab === 'exercises'} onClick={() => setActiveTab('exercises')} icon={<Dumbbell size={20} />} label="Exercises" />
            <NavButton active={activeTab === 'workouts'} onClick={() => setActiveTab('workouts')} icon={<Play size={20} />} label="Workouts" />
            <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<Calendar size={20} />} label="Planner" />
            <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp size={20} />} label="Stats" />
            <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={20} />} label="History" />
          </div>
        </nav>
      )}

      {showTimer && <RestTimer initialSeconds={60} onClose={() => setShowTimer(false)} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 transition-all duration-500 relative group",
        active ? "text-brand" : "text-zinc-600 hover:text-zinc-400"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
        active ? "bg-brand/10 border border-brand/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-2 w-1 h-1 bg-brand rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
        />
      )}
    </button>
  );
}

// --- VIEWS ---

function ExercisesView({ state, addExercise, deleteExercise }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [newEx, setNewEx] = useState({ name: '', category: 'Chest' });
  const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  const handleAdd = () => {
    if (!newEx.name) return;
    addExercise(newEx);
    setIsAdding(false);
    setNewEx({ name: '', category: 'Chest' });
  };

  if (selectedExerciseId) {
    const exercise = state.exercises.find((e: any) => e.id === selectedExerciseId);
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedExerciseId(null)}
          className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest hover:opacity-70 transition-all"
        >
          <ChevronLeft size={16} />
          Back to Library
        </button>
        <ExerciseDetailView exercise={exercise} state={state} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Library</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Manage movements</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 flex items-center justify-center bg-brand text-black rounded-2xl shadow-xl shadow-brand/20 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border-slate rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
        >
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Exercise Name</label>
            <input
              type="text"
              placeholder="e.g. Incline Bench"
              value={newEx.name}
              onChange={(e) => setNewEx({ ...newEx, name: e.target.value })}
              className="w-full bg-surface border border-border-slate rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-brand/30 text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Category</label>
            <select
              value={newEx.category}
              onChange={(e) => setNewEx({ ...newEx, category: e.target.value })}
              className="w-full bg-surface border border-border-slate rounded-2xl p-5 text-sm font-bold text-brand focus:ring-2 focus:ring-brand/30"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-5 text-muted text-[10px] font-black uppercase tracking-widest">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-5 bg-brand text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20">Add Exercise</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {state.exercises.map((ex: any) => (
          <div 
            key={ex.id} 
            onClick={() => setSelectedExerciseId(ex.id)}
            className="bg-card border border-border-slate rounded-[2rem] p-6 flex justify-between items-center group hover:border-brand/30 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-zinc-700 border border-border-slate group-hover:text-brand transition-all duration-500">
                <Dumbbell size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase tracking-tight text-lg">{ex.name}</h4>
                <span className="text-[9px] bg-brand/5 px-3 py-1 rounded-full text-brand uppercase font-black tracking-widest border border-brand/20 mt-2 inline-block">{ex.category}</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteExercise(ex.id);
              }}
              className="w-12 h-12 flex items-center justify-center text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutsView({ state, addWorkout, updateWorkout, deleteWorkout, startWorkout }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWorkout, setNewWorkout] = useState({ name: '', exercises: [] as any[] });
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  const handleSaveWorkout = () => {
    if (!newWorkout.name) return;
    if (editingId) {
      updateWorkout(editingId, newWorkout);
    } else {
      addWorkout(newWorkout);
    }
    setIsAdding(false);
    setEditingId(null);
    setNewWorkout({ name: '', exercises: [] });
  };

  const startEditing = (workout: any) => {
    setEditingId(workout.id);
    setNewWorkout({ name: workout.name, exercises: [...workout.exercises] });
    setIsAdding(true);
  };

  const addExerciseToWorkout = (exerciseId: string) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { exerciseId, sets: 3, reps: 10 }]
    }));
  };

  const removeExerciseFromWorkout = (idx: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx)
    }));
  };

  const filteredExercises = categoryFilter === 'All' 
    ? state.exercises 
    : state.exercises.filter((e: any) => e.category === categoryFilter);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Workouts</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Your routines</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewWorkout({ name: '', exercises: [] });
            setIsAdding(true);
          }}
          className="w-14 h-14 flex items-center justify-center bg-brand text-black rounded-2xl shadow-xl shadow-brand/20 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border-slate rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
        >
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Routine Name</label>
            <input
              type="text"
              placeholder="e.g. Push Day A"
              value={newWorkout.name}
              onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
              className="w-full bg-surface border border-border-slate rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-brand/30 text-white"
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Selected Movements</p>
            <div className="space-y-3">
              {newWorkout.exercises.map((we, idx) => (
                <div key={idx} className="flex items-center justify-between bg-surface p-5 rounded-2xl border border-border-slate">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{state.exercises.find((e: any) => e.id === we.exerciseId)?.name}</span>
                    <button 
                      onClick={() => removeExerciseFromWorkout(idx)}
                      className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1 text-left"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={we.sets || ''} 
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          const ex = [...newWorkout.exercises];
                          ex[idx].sets = isNaN(val) ? 0 : val;
                          setNewWorkout({ ...newWorkout, exercises: ex });
                        }}
                        className="w-12 bg-card border border-border-slate rounded-lg p-2 text-center text-xs font-bold text-brand"
                      />
                      <span className="text-[8px] text-muted font-black uppercase mt-2 tracking-widest">Sets</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={we.reps || ''} 
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          const ex = [...newWorkout.exercises];
                          ex[idx].reps = isNaN(val) ? 0 : val;
                          setNewWorkout({ ...newWorkout, exercises: ex });
                        }}
                        className="w-12 bg-card border border-border-slate rounded-lg p-2 text-center text-xs font-bold text-brand"
                      />
                      <span className="text-[8px] text-muted font-black uppercase mt-2 tracking-widest">Reps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Add to Routine</p>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface border border-border-slate rounded-xl p-2 text-[8px] font-black uppercase tracking-widest text-brand"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredExercises.map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => addExerciseToWorkout(e.id)}
                  className="px-5 py-3 bg-surface border border-border-slate rounded-2xl text-[10px] font-black text-zinc-500 hover:bg-brand/10 hover:text-brand hover:border-brand/30 transition-all uppercase tracking-widest"
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="flex-1 py-5 text-muted text-[10px] font-black uppercase tracking-widest">Cancel</button>
            <button onClick={handleSaveWorkout} className="flex-1 py-5 bg-brand text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20">
              {editingId ? 'Update Routine' : 'Save Routine'}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {state.workouts.map((workout: any) => (
            <div key={workout.id} className="bg-card border border-border-slate rounded-[2.5rem] p-8 group hover:border-brand/30 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">{workout.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/5 px-3 py-1 rounded-full border border-brand/20">
                      {workout.exercises.length} Exercises
                    </span>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                      {workout.exercises.reduce((acc: number, curr: any) => acc + curr.sets, 0)} Total Sets
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEditing(workout)}
                    className="w-12 h-12 flex items-center justify-center text-zinc-800 hover:text-brand hover:bg-brand/10 rounded-2xl transition-all active:scale-90"
                  >
                    <Pencil size={20} />
                  </button>
                  <button 
                    onClick={() => deleteWorkout(workout.id)}
                    className="w-12 h-12 flex items-center justify-center text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {workout.exercises.slice(0, 3).map((we: any, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-surface border border-border-slate rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {state.exercises.find((e: any) => e.id === we.exerciseId)?.name}
                  </span>
                ))}
                {workout.exercises.length > 3 && (
                  <span className="px-4 py-2 bg-surface border border-border-slate rounded-xl text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    +{workout.exercises.length - 3} more
                  </span>
                )}
              </div>

              <button 
                onClick={() => startWorkout(workout.id)}
                className="w-full py-5 bg-brand hover:bg-emerald-400 text-black font-black rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-xl shadow-brand/20 uppercase tracking-widest text-[10px]"
              >
                <Play size={18} fill="currentColor" />
                Start Session
              </button>
            </div>
          ))}
          {state.workouts.length === 0 && (
            <div className="text-center py-24 bg-card/50 rounded-[2.5rem] border border-dashed border-border-slate">
              <p className="text-zinc-600 text-sm font-bold italic uppercase tracking-widest">No routines defined</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-6 text-brand text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
              >
                Create First Routine
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlannerView({ state, updateSchedule }: any) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Planner</h2>
        <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Weekly schedule</p>
      </div>

      <div className="bg-card border border-border-slate rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div key={day} className="flex items-center justify-between gap-6 bg-surface p-5 rounded-2xl border border-border-slate group hover:border-brand/30 transition-all">
              <div className="w-24">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{day}</span>
              </div>
              <select 
                value={state.schedule[idx] || ''}
                onChange={(e) => updateSchedule(idx.toString(), e.target.value || null)}
                className="flex-1 bg-card border border-border-slate rounded-xl text-[10px] font-black uppercase tracking-widest p-3 text-brand focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Rest Day</option>
                {state.workouts.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsView({ state, addBodyweight }: any) {
  const [weightInput, setWeightInput] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const handleAddWeight = () => {
    if (!weightInput) return;
    addBodyweight(parseFloat(weightInput));
    setWeightInput('');
  };

  const bodyweightData = [...state.bodyweight]
    .sort((a: any, b: any) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return state.bodyweight.indexOf(a) - state.bodyweight.indexOf(b);
    })
    .map((log: any) => ({
      date: format(new Date(log.date), 'MMM d'),
      weight: log.weight,
      fullDate: log.date
    }));

  const currentWeight = bodyweightData.length > 0 ? bodyweightData[bodyweightData.length - 1].weight : null;
  const previousWeight = bodyweightData.length > 1 ? bodyweightData[bodyweightData.length - 2].weight : null;
  const weightDiff = currentWeight && previousWeight ? (currentWeight - previousWeight).toFixed(1) : null;
  const lastWeightDate = bodyweightData.length > 0 ? bodyweightData[bodyweightData.length - 1].fullDate : null;

  if (selectedExerciseId) {
    const exercise = state.exercises.find((e: any) => e.id === selectedExerciseId);
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedExerciseId(null)}
          className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest hover:opacity-70 transition-all"
        >
          <ChevronLeft size={16} />
          Back to Stats
        </button>
        <ExerciseDetailView exercise={exercise} state={state} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Stats</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Performance Engine</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card border border-border-slate rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-brand/10 transition-all duration-700" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">Current Bodyweight</p>
              {currentWeight ? (
                <>
                  <div className="text-5xl font-black text-white italic leading-none tracking-tighter">
                    {currentWeight}<span className="text-lg not-italic ml-1 text-brand">kg</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                      parseFloat(weightDiff || '0') > 0 ? "bg-red-500/10 text-red-500" : "bg-brand/10 text-brand"
                    )}>
                      {parseFloat(weightDiff || '0') > 0 ? '+' : ''}{weightDiff || '0.0'}kg
                    </div>
                    <span className="text-[8px] text-muted font-bold uppercase tracking-widest">
                      Last update: {lastWeightDate ? format(new Date(lastWeightDate), 'MMM d') : 'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-2xl font-black text-zinc-800 italic uppercase tracking-widest">No Data</div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 bg-surface p-2 rounded-2xl border border-border-slate shadow-inner">
                <input
                  type="number"
                  placeholder="0.0"
                  value={weightInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-16 bg-transparent border-none text-sm font-black text-center text-brand focus:ring-0"
                />
                <button onClick={handleAddWeight} className="w-10 h-10 bg-brand text-black rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 active:scale-90 transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-48 w-full mt-8 relative z-10">
            {bodyweightData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodyweightData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={15}
                    fontFamily="inherit"
                    fontWeight="900"
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']} 
                    dx={-15}
                    fontFamily="inherit"
                    fontWeight="900"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      border: '1px solid #10b981', 
                      borderRadius: '24px', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: '#10b981', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                    labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={5} 
                    dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#0A0A0A' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-4">
                <TrendingUp size={48} className="opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Insufficient data points</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Exercise Progress</h3>
          </div>
          <p className="text-[8px] font-black text-muted uppercase tracking-widest">Tap for details</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {state.exercises.map((ex: any) => {
            const logs = state.logs
              .filter((log: any) => log.exercises.some((e: any) => e.exerciseId === ex.id))
              .sort((a: any, b: any) => {
                const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                return state.logs.indexOf(a) - state.logs.indexOf(b);
              });
            
            const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
            const prevLog = logs.length > 1 ? logs[logs.length - 2] : null;
            
            const lastEx = lastLog?.exercises.find((e: any) => e.exerciseId === ex.id);
            const prevEx = prevLog?.exercises.find((e: any) => e.exerciseId === ex.id);

            const last1RM = lastEx && lastEx.sets.length > 0 ? Math.max(...lastEx.sets.map((s: any) => calculate1RM(s.weight, s.reps))) : 0;
            const prev1RM = prevEx && prevEx.sets.length > 0 ? Math.max(...prevEx.sets.map((s: any) => calculate1RM(s.weight, s.reps))) : 0;
            const diff = last1RM > 0 && prev1RM > 0 ? Math.round(last1RM - prev1RM) : null;

            return (
              <div 
                key={ex.id}
                onClick={() => setSelectedExerciseId(ex.id)}
                className="bg-card border border-border-slate rounded-[2.5rem] p-6 flex justify-between items-center group hover:border-brand/30 transition-all cursor-pointer shadow-lg hover:shadow-brand/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-zinc-700 group-hover:text-brand transition-all border border-border-slate shadow-inner group-hover:scale-110 duration-500">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-tight text-base group-hover:text-brand transition-colors">{ex.name}</h4>
                    <p className="text-[8px] text-muted font-black uppercase tracking-widest mt-1">{ex.category} • {logs.length} sessions</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                  {last1RM > 0 && (
                    <div className="text-right">
                      <div className="text-3xl font-black text-white italic leading-none tracking-tighter group-hover:scale-110 transition-transform origin-right">
                        {Math.round(last1RM)}<span className="text-[10px] not-italic ml-0.5 text-brand">kg</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        {diff !== null && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                            diff >= 0 ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-500"
                          )}>
                            {diff >= 0 ? '+' : ''}{diff}
                          </span>
                        )}
                        <span className="text-[7px] text-muted font-black uppercase tracking-widest">Est. 1RM</span>
                      </div>
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-zinc-800 group-hover:text-brand group-hover:bg-brand/10 transition-all border border-border-slate">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ExerciseDetailView({ exercise, state }: { exercise: any, state: any }) {
  const exerciseLogs = state.logs
    .filter((log: any) => log.exercises.some((e: any) => e.exerciseId === exercise.id))
    .sort((a: any, b: any) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return state.logs.indexOf(a) - state.logs.indexOf(b);
    })
    .map((log: any) => {
      const ex = log.exercises.find((e: any) => e.exerciseId === exercise.id);
      const bestSet1RM = ex.sets.length > 0 ? Math.max(...ex.sets.map((s: any) => calculate1RM(s.weight, s.reps))) : 0;
      return {
        date: format(new Date(log.date), 'MMM d'),
        oneRM: Math.round(bestSet1RM),
        fullDate: log.date
      };
    });

  const current1RM = exerciseLogs.length > 0 ? exerciseLogs[exerciseLogs.length - 1].oneRM : null;
  const best1RM = exerciseLogs.length > 0 ? Math.max(...exerciseLogs.map(l => l.oneRM)) : null;
  const previous1RM = exerciseLogs.length > 1 ? exerciseLogs[exerciseLogs.length - 2].oneRM : null;
  const onermDiff = current1RM !== null && previous1RM !== null ? (current1RM - previous1RM) : null;
  const lastSessionDate = exerciseLogs.length > 0 ? exerciseLogs[exerciseLogs.length - 1].fullDate : null;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{exercise.name}</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">{exercise.category} • Performance Curve</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Dumbbell size={24} />
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card border border-border-slate rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-brand/10 transition-all duration-700" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">Estimated 1RM</p>
              {current1RM !== null ? (
                <>
                  <div className="text-5xl font-black text-white italic leading-none tracking-tighter">
                    {current1RM}<span className="text-lg not-italic ml-1 text-brand">kg</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                      (onermDiff || 0) >= 0 ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-500"
                    )}>
                      {(onermDiff || 0) >= 0 ? '+' : ''}{onermDiff || 0}kg
                    </div>
                    <span className="text-[8px] text-muted font-bold uppercase tracking-widest">
                      Last session: {lastSessionDate ? format(new Date(lastSessionDate), 'MMM d') : 'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-2xl font-black text-zinc-800 italic uppercase tracking-widest">No Data</div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-surface/50 border border-border-slate rounded-2xl p-3 text-center min-w-[100px]">
                <p className="text-[7px] font-black text-muted uppercase tracking-widest mb-1">All-Time Best</p>
                <p className="text-lg font-black text-white italic leading-none">{best1RM || 0}kg</p>
              </div>
              <div className="bg-surface/50 border border-border-slate rounded-2xl p-3 text-center min-w-[100px]">
                <p className="text-[7px] font-black text-muted uppercase tracking-widest mb-1">Sessions</p>
                <p className="text-lg font-black text-white italic leading-none">{exerciseLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="h-48 w-full mt-8 relative z-10">
            {exerciseLogs.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={15}
                    fontFamily="inherit"
                    fontWeight="900"
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']} 
                    dx={-15}
                    fontFamily="inherit"
                    fontWeight="900"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      border: '1px solid #10b981', 
                      borderRadius: '24px', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: '#10b981', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                    labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oneRM" 
                    stroke="#10b981" 
                    strokeWidth={5} 
                    dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#0A0A0A' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-4">
                <TrendingUp size={48} className="opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Insufficient data points</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Session History</h3>
        </div>
        <div className="space-y-4">
          {exerciseLogs.slice().reverse().map((log: any, idx: number) => (
            <div key={idx} className="bg-card border border-border-slate rounded-[2.5rem] p-6 flex justify-between items-center shadow-lg group hover:border-brand/20 transition-all">
              <div>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">{format(new Date(log.fullDate), 'MMMM d, yyyy')}</p>
                <h4 className="font-bold text-white uppercase tracking-tight mt-1 text-lg">Est. 1RM: {log.oneRM}kg</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-brand border border-border-slate shadow-inner group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
            </div>
          ))}
          {exerciseLogs.length === 0 && (
            <div className="text-center py-12 bg-card/50 rounded-[2.5rem] border border-dashed border-border-slate">
              <p className="text-muted text-[10px] font-black uppercase tracking-widest">No sessions recorded yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function HistoryView({ state }: any) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">History</h2>
        <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Past sessions</p>
      </div>

      <div className="space-y-6">
        {state.logs.slice().reverse().map((log: any) => {
          const workout = state.workouts.find((w: any) => w.id === log.workoutId);
          return (
            <div key={log.id} className="bg-card border border-border-slate rounded-[2.5rem] p-8 group hover:border-brand/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-brand border border-border-slate group-hover:scale-110 transition-all duration-500 shadow-lg shadow-brand/5">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                      {workout?.name || 'Custom Session'}
                    </h4>
                    <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">
                      {format(new Date(log.date), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-zinc-800 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
              
              <div className="space-y-4 border-t border-border-slate pt-6">
                {log.exercises.map((exLog: any, idx: number) => {
                  const exercise = state.exercises.find((e: any) => e.id === exLog.exerciseId);
                  const bestSet = exLog.sets.reduce((prev: any, curr: any) => {
                    const curr1RM = calculate1RM(curr.weight, curr.reps);
                    const prev1RM = calculate1RM(prev.weight, prev.reps);
                    return curr1RM > prev1RM ? curr : prev;
                  }, exLog.sets[0]);
                  const best1RM = Math.round(calculate1RM(bestSet.weight, bestSet.reps));
                  
                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{exercise?.name}</span>
                      <span className="text-[10px] font-black text-brand uppercase tracking-widest">
                        {exLog.sets.length} Sets • Best: {bestSet.weight}kg ({best1RM}kg 1RM)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {state.logs.length === 0 && (
          <div className="text-center py-24 bg-card/50 rounded-[2.5rem] border border-dashed border-border-slate">
            <p className="text-zinc-600 text-sm font-bold italic uppercase tracking-widest">No history recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
