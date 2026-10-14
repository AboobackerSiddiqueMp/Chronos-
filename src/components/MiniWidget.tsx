import React from 'react';
import { Play, Pause, RotateCcw, Maximize2, X, PictureInPicture } from 'lucide-react';
import { AppMode } from '../types';

interface MiniWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
  onTriggerNativePip: () => void;
  currentMode: AppMode;
  displayTime: string;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const MiniWidget: React.FC<MiniWidgetProps> = ({
  isOpen,
  onClose,
  onExpand,
  onTriggerNativePip,
  currentMode,
  displayTime,
  isRunning,
  onTogglePlay,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Mini floating widget"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-950/90 border border-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl select-none transition-all duration-300"
    >
      {/* Live Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
          }`}
        />
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
          {currentMode}
        </span>
      </div>

      <span className="text-neutral-700">·</span>

      {/* Compact Time Display */}
      <span className="font-mono text-sm sm:text-base font-light tracking-tight text-white tabular-nums">
        {displayTime}
      </span>

      <span className="text-neutral-700">·</span>

      {/* Play / Pause Toggle Button */}
      <button
        onClick={onTogglePlay}
        title={isRunning ? 'Pause' : 'Play'}
        className="p-1 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
      >
        {isRunning ? (
          <Pause className="w-3 h-3 fill-black stroke-black" />
        ) : (
          <Play className="w-3 h-3 fill-black stroke-black translate-x-0.2" />
        )}
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        title="Reset"
        className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      {/* Native Picture-in-Picture Float Button */}
      <button
        onClick={onTriggerNativePip}
        title="Pop Out Always-on-Top Floating Window (Stays on screen across apps)"
        className="p-1 rounded-full text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 transition-colors cursor-pointer"
      >
        <PictureInPicture className="w-3 h-3" />
      </button>

      {/* Expand to Full View Button */}
      <button
        onClick={onExpand}
        title="Expand to Fullscreen / Page View"
        className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
      >
        <Maximize2 className="w-3 h-3" />
      </button>

      {/* Close Mini Widget */}
      <button
        onClick={onClose}
        title="Close Mini Bar"
        className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </aside>
  );
};
