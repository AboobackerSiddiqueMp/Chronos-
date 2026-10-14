import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Download, Watch } from 'lucide-react';
import { LapItem } from '../types';

export const StopwatchView: React.FC = () => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>([]);

  const startTimestampRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      if (!isRunning) return;
      const now = performance.now();
      const currentElapsed = accumulatedMsRef.current + (now - startTimestampRef.current);
      setElapsedMs(currentElapsed);
      animFrameRef.current = requestAnimationFrame(updateTime);
    };

    if (isRunning) {
      startTimestampRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      accumulatedMsRef.current = elapsedMs;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    setLaps([]);
  };

  const recordLap = () => {
    const lastLapTotal = laps.length > 0 ? laps[0].overallTimeMs : 0;
    const currentLapTime = elapsedMs - lastLapTotal;

    const newLap: LapItem = {
      id: Date.now(),
      lapNumber: laps.length + 1,
      lapTimeMs: currentLapTime,
      overallTimeMs: elapsedMs,
    };

    setLaps([newLap, ...laps]);
  };

  const formatParts = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      min: minutes.toString().padStart(2, '0'),
      sec: seconds.toString().padStart(2, '0'),
      cs: centiseconds.toString().padStart(2, '0'),
    };
  };

  const { min, sec, cs } = formatParts(elapsedMs);

  // Find min/max lap times for subtle highlighting
  const lapTimes = laps.map((l) => l.lapTimeMs);
  const minLapTime = laps.length > 1 ? Math.min(...lapTimes) : null;
  const maxLapTime = laps.length > 1 ? Math.max(...lapTimes) : null;

  const exportLapsToCsv = () => {
    if (laps.length === 0) return;
    const rows = [
      ['Lap Number', 'Lap Time', 'Overall Time'],
      ...laps.map((l) => [
        l.lapNumber.toString(),
        `${formatParts(l.lapTimeMs).min}:${formatParts(l.lapTimeMs).sec}.${formatParts(l.lapTimeMs).cs}`,
        `${formatParts(l.overallTimeMs).min}:${formatParts(l.overallTimeMs).sec}.${formatParts(l.overallTimeMs).cs}`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chronos_laps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 select-none">
      {/* Subtitle / Mode Label */}
      <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs sm:text-sm uppercase tracking-[0.3em] font-light mb-12 sm:mb-16">
        <Watch className="w-4 h-4 stroke-[1.5]" />
        <span>PRECISION STOPWATCH</span>
      </div>

      {/* Main Large Numbers Display with Underscore Baselines */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-10 w-full mb-12">
        {/* MINUTES */}
        <div className="flex flex-col items-center flex-1 min-w-[90px] max-w-[260px]">
          <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
            {min}
          </span>
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            MINUTES
          </span>
        </div>

        {/* COLON */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
          <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80" />
          <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80" />
        </div>

        {/* SECONDS */}
        <div className="flex flex-col items-center flex-1 min-w-[90px] max-w-[260px]">
          <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
            {sec}
          </span>
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            SECONDS
          </span>
        </div>

        {/* DOT */}
        <div className="flex flex-col items-center justify-end pb-8 sm:pb-12 px-1 sm:px-2">
          <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80" />
        </div>

        {/* CENTISECONDS */}
        <div className="flex flex-col items-center flex-1 min-w-[90px] max-w-[260px]">
          <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
            {cs}
          </span>
          <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
          <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
            1/100 SEC
          </span>
        </div>
      </div>

      {/* Primary Action Button (White Pill) & Lap / Reset Controls */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={toggleStopwatch}
          className="cursor-pointer flex items-center justify-center gap-3 px-10 sm:px-14 py-4 rounded-full bg-white text-black font-normal text-base sm:text-lg tracking-wide hover:bg-neutral-100 active:scale-98 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-black stroke-black" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
              <span>Start</span>
            </>
          )}
        </button>

        {isRunning && (
          <button
            onClick={recordLap}
            title="Record Split Lap"
            className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-white hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <Flag className="w-5 h-5" />
          </button>
        )}

        {(elapsedMs > 0 || laps.length > 0) && (
          <button
            onClick={resetStopwatch}
            title="Reset Stopwatch"
            className="p-4 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Laps Table */}
      {laps.length > 0 && (
        <div className="w-full max-w-xl border-t border-neutral-900 pt-6">
          <div className="flex items-center justify-between mb-3 text-xs text-neutral-500 font-medium uppercase tracking-wider px-3">
            <span>Lap ({laps.length})</span>
            <div className="flex items-center gap-6">
              <span>Split Time</span>
              <span>Total Time</span>
              <button
                onClick={exportLapsToCsv}
                title="Export CSV"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {laps.map((lap) => {
              const lapParts = formatParts(lap.lapTimeMs);
              const overallParts = formatParts(lap.overallTimeMs);
              const isFastest = lap.lapTimeMs === minLapTime;
              const isSlowest = lap.lapTimeMs === maxLapTime;

              return (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm tabular-nums font-mono transition-colors ${
                    isFastest
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                      : isSlowest
                      ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                      : 'border-neutral-900 bg-neutral-950/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-sans">#{lap.lapNumber}</span>
                    {isFastest && <span className="text-[10px] text-emerald-400 font-sans uppercase">Fastest</span>}
                    {isSlowest && <span className="text-[10px] text-amber-400 font-sans uppercase">Slowest</span>}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-light">
                      +{lapParts.min}:{lapParts.sec}.{lapParts.cs}
                    </span>
                    <span className="text-neutral-400">
                      {overallParts.min}:{overallParts.sec}.{overallParts.cs}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
