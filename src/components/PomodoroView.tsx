import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings, Flame, Coffee, Sparkles } from 'lucide-react';
import { audioService } from '../services/audioService';
import { ChimeSound, PomodoroSettings } from '../types';

interface PomodoroViewProps {
  selectedChime: ChimeSound;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({ selectedChime }) => {
  type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

  const [settings, setSettings] = useState<PomodoroSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
  });

  const [mode, setMode] = useState<PomodoroMode>('work');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [cycleIndex, setCycleIndex] = useState<number>(1);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const lastTickRef = useRef<number | null>(null);

  const getModeDuration = (m: PomodoroMode): number => {
    if (m === 'work') return settings.workMinutes * 60;
    if (m === 'shortBreak') return settings.shortBreakMinutes * 60;
    return settings.longBreakMinutes * 60;
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setRemainingSeconds(getModeDuration(newMode));
  };

  // High precision countdown
  useEffect(() => {
    let animFrame: number;

    const tick = () => {
      if (!isRunning) return;

      const now = performance.now();
      if (lastTickRef.current !== null) {
        const delta = (now - lastTickRef.current) / 1000;
        if (delta >= 1.0) {
          const secs = Math.floor(delta);
          lastTickRef.current = now - ((delta - secs) * 1000);

          setRemainingSeconds((prev) => {
            if (prev <= secs) {
              // Mode Completed!
              audioService.playChime(selectedChime);

              if (mode === 'work') {
                const nextCompleted = completedSessions + 1;
                setCompletedSessions(nextCompleted);

                const nextCycle = cycleIndex >= settings.longBreakInterval ? 1 : cycleIndex + 1;
                setCycleIndex(nextCycle);

                if (cycleIndex >= settings.longBreakInterval) {
                  setMode('longBreak');
                  setRemainingSeconds(settings.longBreakMinutes * 60);
                  setIsRunning(settings.autoStartBreaks);
                } else {
                  setMode('shortBreak');
                  setRemainingSeconds(settings.shortBreakMinutes * 60);
                  setIsRunning(settings.autoStartBreaks);
                }
              } else {
                // Break ended -> return to work
                setMode('work');
                setRemainingSeconds(settings.workMinutes * 60);
                setIsRunning(settings.autoStartWork);
              }
              return 0;
            }
            return prev - secs;
          });
        }
      } else {
        lastTickRef.current = now;
      }

      animFrame = requestAnimationFrame(tick);
    };

    if (isRunning) {
      lastTickRef.current = performance.now();
      animFrame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isRunning, mode, completedSessions, cycleIndex, settings, selectedChime]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(getModeDuration(mode));
  };

  const skipInterval = () => {
    setIsRunning(false);
    if (mode === 'work') {
      if (cycleIndex >= settings.longBreakInterval) {
        setMode('longBreak');
        setRemainingSeconds(settings.longBreakMinutes * 60);
      } else {
        setMode('shortBreak');
        setRemainingSeconds(settings.shortBreakMinutes * 60);
      }
    } else {
      setMode('work');
      setRemainingSeconds(settings.workMinutes * 60);
    }
  };

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const currentTotal = getModeDuration(mode);
  const progressRatio = currentTotal > 0 ? (currentTotal - remainingSeconds) / currentTotal : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 select-none">
      {/* Subtitle / Mode Label */}
      <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs sm:text-sm uppercase tracking-[0.3em] font-light mb-8 sm:mb-10">
        {mode === 'work' ? (
          <Flame className="w-4 h-4 stroke-[1.5] text-amber-400" />
        ) : (
          <Coffee className="w-4 h-4 stroke-[1.5] text-sky-400" />
        )}
        <span>
          {mode === 'work' ? 'FOCUS SESSION' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG REST'}
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-full border border-neutral-800 bg-neutral-950/80 mb-10 shadow-md">
        <button
          onClick={() => switchMode('work')}
          className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-normal transition-all cursor-pointer ${
            mode === 'work'
              ? 'bg-neutral-800 border border-neutral-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Focus ({settings.workMinutes}m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-normal transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-neutral-800 border border-neutral-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Short Break ({settings.shortBreakMinutes}m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-normal transition-all cursor-pointer ${
            mode === 'longBreak'
              ? 'bg-neutral-800 border border-neutral-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Long Break ({settings.longBreakMinutes}m)
        </button>
      </div>

      {/* Main Large Numbers Display with Wide Typography & Baselines */}
      <div className="flex items-center justify-center gap-3 sm:gap-8 md:gap-12 w-full mb-10 max-w-4xl">
        {/* MINUTES COLUMN */}
        <div className="flex flex-col items-center flex-1 min-w-[120px] max-w-[300px]">
          <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
            {displayMinutes.toString().padStart(2, '0')}
          </span>
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            MINUTES
          </span>
        </div>

        {/* COLON SEPARATOR */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
          <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
          <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
        </div>

        {/* SECONDS COLUMN */}
        <div className="flex flex-col items-center flex-1 min-w-[120px] max-w-[300px]">
          <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
            {displaySeconds.toString().padStart(2, '0')}
          </span>
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            SECONDS
          </span>
        </div>
      </div>

      {/* Cycle Indicator & Stats */}
      <div className="flex items-center gap-6 mb-8 text-xs text-neutral-400 font-light">
        <div className="flex items-center gap-1.5">
          <span className="tracking-widest uppercase mr-1">Cycle:</span>
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < cycleIndex
                  ? 'bg-amber-400'
                  : i === cycleIndex
                  ? 'bg-white ring-2 ring-amber-400/50'
                  : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>
        <span className="text-neutral-700">·</span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{completedSessions} sessions finished</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 sm:w-80 h-1 bg-neutral-900 rounded-full mb-8 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            mode === 'work' ? 'bg-amber-400' : 'bg-sky-400'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, (1 - progressRatio) * 100))}%` }}
        />
      </div>

      {/* Primary Action Button (White Pill in Image) & Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTimer}
          className="cursor-pointer flex items-center justify-center gap-3 px-10 sm:px-14 py-4 rounded-full bg-white text-black font-normal text-base sm:text-lg tracking-wide hover:bg-neutral-100 active:scale-98 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-black stroke-black" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          title="Reset Interval"
          className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={skipInterval}
          title="Skip to Next Interval"
          className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowSettingsModal(true)}
          title="Customize Pomodoro Durations"
          className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Durations Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-medium text-white mb-4">Pomodoro Settings</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Focus Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.workMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, workMinutes: parseInt(e.target.value) || 25 })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, shortBreakMinutes: parseInt(e.target.value) || 5 })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, longBreakMinutes: parseInt(e.target.value) || 15 })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">Auto-start Breaks</span>
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                  className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setRemainingSeconds(getModeDuration(mode));
                }}
                className="px-5 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
