import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onClose: () => void;
}

export function RestTimer({ initialSeconds, onClose }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      // Optional: Add a sound or vibration here
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Rest Timer</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="text-6xl font-mono font-bold text-emerald-400 mb-8 tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={() => setSeconds(initialSeconds)}
            className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-colors"
        >
          Skip Rest
        </button>
      </div>
    </div>
  );
}
