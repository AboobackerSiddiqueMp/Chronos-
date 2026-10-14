import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { audioService } from '../services/audioService';
import { faviconService } from '../services/faviconService';
import { pipService } from '../services/pipService';
import { ChimeSound } from '../types';

interface TimerViewProps {
  onTimerComplete?: () => void;
  selectedChime: ChimeSound;
  onTimeUpdate?: (timeText: string, isRunning: boolean, progress: number) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  onTimerComplete,
  selectedChime,
  onTimeUpdate,
}) => {
  // Input state when setting duration
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // Runtime countdown state
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Editing state for direct numerical focus
  const [activeEditingUnit, setActiveEditingUnit] = useState<'h' | 'm' | 's' | null>(null);

  const lastTickTimeRef = useRef<number | null>(null);

  const setDuration = (h: number, m: number, s: number) => {
    const clampedH = Math.max(0, Math.min(99, h));
    const clampedM = Math.max(0, Math.min(59, m));
    const clampedS = Math.max(0, Math.min(59, s));
    setHours(clampedH);
    setMinutes(clampedM);
    setSeconds(clampedS);
    const total = clampedH * 3600 + clampedM * 60 + clampedS;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setIsCompleted(false);
  };

  // Synchronize Tab title, Favicon, and PiP on tick
  useEffect(() => {
    const displayH = Math.floor(remainingSeconds / 3600);
    const displayM = Math.floor((remainingSeconds % 3600) / 60);
    const displayS = remainingSeconds % 60;
    const formatted = displayH > 0
      ? `${displayH.toString().padStart(2, '0')}:${displayM.toString().padStart(2, '0')}:${displayS.toString().padStart(2, '0')}`
      : `${displayM.toString().padStart(2, '0')}:${displayS.toString().padStart(2, '0')}`;

    const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

    if (isRunning) {
      document.title = `(${formatted}) Chronos Timer`;
    } else if (remainingSeconds > 0) {
      document.title = `[Paused ${formatted}] Chronos`;
    } else {
      document.title = `Chronos - Minimalist Timer & Focus Suite`;
    }

    if (isRunning || remainingSeconds > 0) {
      faviconService.update(remainingSeconds, totalSeconds, isRunning);
    } else {
      faviconService.reset();
    }

    pipService.updateState(formatted, 'TIMER', isRunning, progressRatio);

    if (onTimeUpdate) {
      onTimeUpdate(formatted, isRunning, progressRatio);
    }
  }, [remainingSeconds, totalSeconds, isRunning, onTimeUpdate]);

  // High precision timestamp delta countdown
  useEffect(() => {
    let animFrameId: number;

    const tick = () => {
      if (!isRunning) return;

      const now = performance.now();
      if (lastTickTimeRef.current !== null) {
        const delta = (now - lastTickTimeRef.current) / 1000;
        if (delta >= 1.0) {
          const secondsToDeduct = Math.floor(delta);
          lastTickTimeRef.current = now - ((delta - secondsToDeduct) * 1000);

          setRemainingSeconds((prev) => {
            if (prev <= secondsToDeduct) {
              setIsRunning(false);
              setIsCompleted(true);
              audioService.playChime(selectedChime);
              if (onTimerComplete) onTimerComplete();
              return 0;
            }
            return prev - secondsToDeduct;
          });
        }
      } else {
        lastTickTimeRef.current = now;
      }

      animFrameId = requestAnimationFrame(tick);
    };

    if (isRunning) {
      lastTickTimeRef.current = performance.now();
      animFrameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrameId);
  }, [isRunning, selectedChime, onTimerComplete]);

  const handleToggleTimer = () => {
    if (isCompleted) {
      setIsCompleted(false);
      setRemainingSeconds(totalSeconds);
      setIsRunning(true);
      return;
    }

    const currentTotal = hours * 3600 + minutes * 60 + seconds;
    if (!isRunning && remainingSeconds === 0 && currentTotal > 0) {
      setTotalSeconds(currentTotal);
      setRemainingSeconds(currentTotal);
      setIsRunning(true);
      return;
    }

    if (remainingSeconds > 0) {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    const initial = hours * 3600 + minutes * 60 + seconds;
    setRemainingSeconds(initial);
  };

  const applyPreset = (h: number, m: number, s: number) => {
    setIsRunning(false);
    setDuration(h, m, s);
  };

  const addTime = (additionalSeconds: number) => {
    setRemainingSeconds((prev) => prev + additionalSeconds);
    setTotalSeconds((prev) => prev + additionalSeconds);
    if (isCompleted) setIsCompleted(false);
  };

  const displayHours = isRunning || remainingSeconds > 0
    ? Math.floor(remainingSeconds / 3600)
    : hours;
  const displayMinutes = isRunning || remainingSeconds > 0
    ? Math.floor((remainingSeconds % 3600) / 60)
    : minutes;
  const displaySeconds = isRunning || remainingSeconds > 0
    ? remainingSeconds % 60
    : seconds;

  const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  const handleWheel = (unit: 'h' | 'm' | 's', e: React.WheelEvent) => {
    if (isRunning) return;
    const delta = e.deltaY < 0 ? 1 : -1;
    if (unit === 'h') setDuration(hours + delta, minutes, seconds);
    if (unit === 'm') setDuration(hours, minutes + delta, seconds);
    if (unit === 's') setDuration(hours, minutes, seconds + delta);
  };

  const isHoursPlaceholder = displayHours === 0 && !isRunning;
  const isMinutesPlaceholder = displayMinutes === 0 && !isRunning;
  const isSecondsPlaceholder = displaySeconds === 0 && !isRunning;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 py-4 select-none">
      {/* Subtitle / Mode Label exactly matching screenshot */}
      <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs sm:text-sm uppercase tracking-[0.3em] font-light mb-12 sm:mb-16">
        <Clock className="w-4 h-4 stroke-[1.5]" />
        <span>{isRunning ? 'TIMER RUNNING' : isCompleted ? 'DURATION COMPLETE' : 'SET DURATION'}</span>
      </div>

      {/* Main Expansive Numbers Display with Wide Typography & Baselines */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8 lg:gap-12 w-full mb-12 max-w-5xl">
        {/* HOURS COLUMN */}
        <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
          <div
            onWheel={(e) => handleWheel('h', e)}
            onClick={() => !isRunning && setActiveEditingUnit('h')}
            className={`w-full text-center py-1 transition-transform cursor-pointer ${
              activeEditingUnit === 'h' ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            {activeEditingUnit === 'h' && !isRunning ? (
              <input
                type="number"
                min="0"
                max="99"
                autoFocus
                value={hours === 0 ? '' : hours}
                placeholder="0"
                onChange={(e) => setDuration(parseInt(e.target.value) || 0, minutes, seconds)}
                onBlur={() => setActiveEditingUnit(null)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveEditingUnit(null)}
                className="w-full text-center timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide bg-transparent text-white placeholder-[#383838] outline-none"
              />
            ) : (
              <span
                className={`timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide block leading-none transition-colors duration-200 ${
                  isHoursPlaceholder ? 'text-[#383838]' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                }`}
              >
                {displayHours}
              </span>
            )}
          </div>
          {/* Hairline underline baseline matching image */}
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4 transition-colors hover:bg-neutral-600" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            HOURS
          </span>
        </div>

        {/* COLON SEPARATOR 1 - Two clean circular dots matching image */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
          <span
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full transition-colors ${
              isRunning ? 'bg-white' : 'bg-[#383838]'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full transition-colors ${
              isRunning ? 'bg-white' : 'bg-[#383838]'
            }`}
          />
        </div>

        {/* MINUTES COLUMN */}
        <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
          <div
            onWheel={(e) => handleWheel('m', e)}
            onClick={() => !isRunning && setActiveEditingUnit('m')}
            className={`w-full text-center py-1 transition-transform cursor-pointer ${
              activeEditingUnit === 'm' ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            {activeEditingUnit === 'm' && !isRunning ? (
              <input
                type="number"
                min="0"
                max="59"
                autoFocus
                value={minutes === 0 ? '' : minutes}
                placeholder="0"
                onChange={(e) => setDuration(hours, parseInt(e.target.value) || 0, seconds)}
                onBlur={() => setActiveEditingUnit(null)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveEditingUnit(null)}
                className="w-full text-center timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide bg-transparent text-white placeholder-[#383838] outline-none"
              />
            ) : (
              <span
                className={`timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide block leading-none transition-colors duration-200 ${
                  isMinutesPlaceholder ? 'text-[#383838]' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                }`}
              >
                {displayMinutes}
              </span>
            )}
          </div>
          {/* Hairline underline baseline matching image */}
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4 transition-colors hover:bg-neutral-600" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            MINUTES
          </span>
        </div>

        {/* COLON SEPARATOR 2 - Two clean circular dots matching image */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
          <span
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full transition-colors ${
              isRunning ? 'bg-white' : 'bg-[#383838]'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full transition-colors ${
              isRunning ? 'bg-white' : 'bg-[#383838]'
            }`}
          />
        </div>

        {/* SECONDS COLUMN */}
        <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
          <div
            onWheel={(e) => handleWheel('s', e)}
            onClick={() => !isRunning && setActiveEditingUnit('s')}
            className={`w-full text-center py-1 transition-transform cursor-pointer ${
              activeEditingUnit === 's' ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            {activeEditingUnit === 's' && !isRunning ? (
              <input
                type="number"
                min="0"
                max="59"
                autoFocus
                value={seconds === 0 ? '' : seconds}
                placeholder="0"
                onChange={(e) => setDuration(hours, minutes, parseInt(e.target.value) || 0)}
                onBlur={() => setActiveEditingUnit(null)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveEditingUnit(null)}
                className="w-full text-center timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide bg-transparent text-white placeholder-[#383838] outline-none"
              />
            ) : (
              <span
                className={`timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide block leading-none transition-colors duration-200 ${
                  isSecondsPlaceholder ? 'text-[#383838]' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                }`}
              >
                {displaySeconds}
              </span>
            )}
          </div>
          {/* Hairline underline baseline matching image */}
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4 transition-colors hover:bg-neutral-600" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            SECONDS
          </span>
        </div>
      </div>

      {/* Completion Notification Banner */}
      {isCompleted && (
        <div className="mb-6 px-6 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Timer reached zero!</span>
        </div>
      )}

      {/* Quick Preset Buttons - Matches image layout (15m, 25m, 45m, 1h, 2h) */}
      <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3.5 mb-10 sm:mb-14">
        {[
          { label: '15m', h: 0, m: 15, s: 0 },
          { label: '25m', h: 0, m: 25, s: 0 },
          { label: '45m', h: 0, m: 45, s: 0 },
          { label: '1h', h: 1, m: 0, s: 0 },
          { label: '2h', h: 2, m: 0, s: 0 },
        ].map((preset) => {
          const isActivePreset = hours === preset.h && minutes === preset.m && seconds === preset.s;
          return (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.h, preset.m, preset.s)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-normal transition-all cursor-pointer border ${
                isActivePreset
                  ? 'border-neutral-500 bg-neutral-800 text-white shadow-sm'
                  : 'border-neutral-900 bg-neutral-950/80 text-neutral-500 hover:border-neutral-700 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Sleek Minimal Progress Bar */}
      {totalSeconds > 0 && (
        <div className="w-64 sm:w-80 h-1 bg-neutral-900 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-neutral-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, (1 - progressRatio) * 100))}%` }}
          />
        </div>
      )}

      {/* Primary Action Button (White Pill in Image) & Secondary Controls */}
      <div className="flex items-center gap-4">
        {/* Main CTA Pill */}
        <button
          onClick={handleToggleTimer}
          className="cursor-pointer group flex items-center justify-center gap-3 px-14 sm:px-20 py-4 sm:py-4.5 rounded-full bg-white text-black font-normal text-base sm:text-lg tracking-wide hover:bg-neutral-100 active:scale-98 transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.16)]"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-black stroke-black" />
              <span>Pause Timer</span>
            </>
          ) : isCompleted ? (
            <>
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>Restart</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
              <span>Start Timer</span>
            </>
          )}
        </button>

        {/* Secondary Reset Button */}
        {(isRunning || remainingSeconds !== (hours * 3600 + minutes * 60 + seconds) || isCompleted) && (
          <button
            onClick={handleReset}
            title="Reset to Initial Duration"
            className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Quick Add Time Buttons */}
        {isRunning && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => addTime(60)}
              title="Add 1 Minute"
              className="px-3.5 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 1m
            </button>
            <button
              onClick={() => addTime(300)}
              title="Add 5 Minutes"
              className="px-3.5 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 5m
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
