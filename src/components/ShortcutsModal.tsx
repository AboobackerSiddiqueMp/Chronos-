import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start or Pause Active Timer / Stopwatch' },
    { key: 'R', desc: 'Reset Timer / Interval to Default' },
    { key: 'F', desc: 'Toggle Fullscreen Focus Mode' },
    { key: 'M', desc: 'Toggle Compact Mini Widget View' },
    { key: 'A', desc: 'Toggle Ambient Focus Soundscape' },
    { key: '1', desc: 'Switch to Timer View' },
    { key: '2', desc: 'Switch to Clock View' },
    { key: '3', desc: 'Switch to Pomodoro View' },
    { key: '4', desc: 'Switch to Stopwatch View' },
    { key: 'Esc', desc: 'Exit Focus Mode / Close Modals' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Command className="w-5 h-5 text-neutral-300" />
          <h2 className="text-lg font-medium text-white tracking-wide">Keyboard Shortcuts</h2>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-900 bg-neutral-950/70"
            >
              <span className="text-xs text-neutral-400">{s.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono bg-neutral-900 border border-neutral-750 text-neutral-200 rounded-md shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
