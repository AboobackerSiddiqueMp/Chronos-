import React, { useEffect } from 'react';
import { Minimize2, Volume2 } from 'lucide-react';
import { AppMode, AmbientSound } from '../types';

interface FocusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppMode;
  isAmbientActive: boolean;
  ambientSound: AmbientSound;
  children: React.ReactNode;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isOpen,
  onClose,
  isAmbientActive,
  ambientSound,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between p-8 select-none transition-opacity duration-500">
      {/* Top Bar with Minimal Focus Status and Exit button */}
      <div className="w-full max-w-5xl flex items-center justify-between text-neutral-500 text-xs tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEEP FOCUS MODE</span>
          {isAmbientActive && (
            <span className="text-neutral-600 ml-2 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              {ambientSound}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Focus (Esc)</span>
        </button>
      </div>

      {/* Main Focus Content Center Stage */}
      <div className="w-full flex-1 flex items-center justify-center">
        {children}
      </div>

      {/* Bottom Hint */}
      <div className="text-neutral-600 text-[11px] tracking-wider uppercase font-light">
        Press [Space] to pause / resume · [Esc] to return
      </div>
    </div>
  );
};
