import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntroLandingProps {
  onComplete: () => void;
  durationSeconds?: number;
}

export const IntroLanding: React.FC<IntroLandingProps> = ({
  onComplete,
  durationSeconds = 10,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(durationSeconds);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 900); // Wait for fade-out CSS transition
  };

  const progress = (durationSeconds - secondsLeft) / durationSeconds;
  const strokeDashoffset = 283 - 283 * progress;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none transition-opacity duration-900 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-neutral-900/30 blur-[120px] pointer-events-none" />

      {/* Central Geometric Animation */}
      <div className="relative flex flex-col items-center justify-center mb-8">
        {/* Animated Concentric Clock Rings */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Outer Pulsing Orbit */}
          <div className="absolute inset-0 rounded-full border border-neutral-800/80 animate-[spin_20s_linear_infinite]" />

          {/* Middle Dashed Orbit */}
          <div className="absolute inset-4 rounded-full border border-dashed border-neutral-700/50 animate-[spin_35s_linear_infinite_reverse]" />

          {/* Circular Countdown Arc */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45"
              className="stroke-neutral-900 fill-none"
              strokeWidth="2.5"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45"
              className="stroke-white fill-none transition-all duration-1000 ease-linear"
              strokeWidth="2.5"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central Counter Digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tight tabular-nums">
              {secondsLeft}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500 font-medium mt-1">
              SECONDS
            </span>
          </div>
        </div>
      </div>

      {/* Minimal Brand Identity */}
      <div className="text-center z-10 mb-8 max-w-md">
        <h1 className="text-xl sm:text-2xl font-light text-white tracking-[0.35em] uppercase mb-2">
          CHRONOS
        </h1>
        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase font-light">
          Precision Timepiece & Deep Focus
        </p>
      </div>

      {/* Skip Button */}
      <div className="z-10 flex flex-col items-center gap-3">
        <button
          onClick={handleFinish}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-800 bg-neutral-950/80 hover:border-neutral-600 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs font-normal tracking-wide transition-all cursor-pointer shadow-lg group"
        >
          <span>Enter Chronos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <span className="text-[11px] text-neutral-600 tracking-wider">
          Automatically fading in in {secondsLeft}s...
        </span>
      </div>
    </div>
  );
};
