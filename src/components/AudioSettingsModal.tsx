import React from 'react';
import { X, Volume2, Music, CloudRain, Wind, Coffee, Trees } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AmbientSound, ChimeSound } from '../types';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChime: ChimeSound;
  onSelectChime: (chime: ChimeSound) => void;
  chimeVolume: number;
  onChangeChimeVolume: (vol: number) => void;
  ambientSound: AmbientSound;
  onSelectAmbient: (ambient: AmbientSound) => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
  isAmbientActive: boolean;
  onToggleAmbient: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedChime,
  onSelectChime,
  chimeVolume,
  onChangeChimeVolume,
  ambientSound,
  onSelectAmbient,
  ambientVolume,
  onChangeAmbientVolume,
  isAmbientActive,
  onToggleAmbient,
}) => {
  if (!isOpen) return null;

  const chimes: { id: ChimeSound; name: string; desc: string }[] = [
    { id: 'bell', name: 'Meditation Bell', desc: 'Resonant harmonic Tibetan crystal bell' },
    { id: 'gong', name: 'Zen Bowl', desc: 'Warm deep soothing bronze chime' },
    { id: 'marimba', name: 'Acoustic Marimba', desc: 'Crisp bright melodic wood resonance' },
    { id: 'beep', name: 'Modern Electronic', desc: 'Crisp minimal high-frequency pulse' },
  ];

  const ambients: { id: AmbientSound; name: string; icon: React.ReactNode }[] = [
    { id: 'off', name: 'Mute', icon: <Volume2 className="w-4 h-4 opacity-40" /> },
    { id: 'rain', name: 'Gentle Rain', icon: <CloudRain className="w-4 h-4 text-sky-400" /> },
    { id: 'whitenoise', name: 'Pink Noise', icon: <Wind className="w-4 h-4 text-emerald-400" /> },
    { id: 'cafe', name: 'Cafe & Vinyl', icon: <Coffee className="w-4 h-4 text-amber-400" /> },
    { id: 'forest', name: 'Night Forest', icon: <Trees className="w-4 h-4 text-teal-400" /> },
  ];

  const handleTestChime = (c: ChimeSound) => {
    audioService.setChimeVolume(chimeVolume);
    audioService.playChime(c);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Music className="w-5 h-5 text-neutral-300" />
          <h2 className="text-lg font-medium text-white tracking-wide">Sound & Ambient Studio</h2>
        </div>

        {/* Section 1: Completion Alert Chimes */}
        <div className="mb-6 pb-6 border-b border-neutral-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Completion Chimes
            </span>
            <span className="text-xs text-neutral-500 font-mono">{Math.round(chimeVolume * 100)}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {chimes.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onSelectChime(c.id);
                  handleTestChime(c.id);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedChime === c.id
                    ? 'border-neutral-500 bg-neutral-900 text-white'
                    : 'border-neutral-900 bg-neutral-950/60 text-neutral-400 hover:border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{c.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestChime(c.id);
                    }}
                    className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700"
                  >
                    Play
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-1">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-neutral-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={chimeVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeChimeVolume(val);
                audioService.setChimeVolume(val);
              }}
              className="flex-1 accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Ambient Background Audio Generator */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block">
                Focus Ambient Soundscapes
              </span>
              <span className="text-[11px] text-neutral-500">Procedural audio synthesized directly in-browser</span>
            </div>
            <button
              onClick={onToggleAmbient}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isAmbientActive
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {isAmbientActive ? 'Active (Click to Stop)' : 'Turn On'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {ambients.map((amb) => (
              <button
                key={amb.id}
                onClick={() => {
                  onSelectAmbient(amb.id);
                  if (amb.id === 'off') {
                    audioService.stopAmbient();
                  } else {
                    audioService.startAmbient(amb.id);
                  }
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-normal transition-all cursor-pointer ${
                  ambientSound === amb.id && isAmbientActive
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-sm'
                    : 'border-neutral-900 bg-neutral-950/60 text-neutral-400 hover:border-neutral-800 hover:text-white'
                }`}
              >
                {amb.icon}
                <span>{amb.name}</span>
              </button>
            ))}
          </div>

          {/* Ambient Volume Slider */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-neutral-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeAmbientVolume(val);
                audioService.setAmbientVolume(val);
              }}
              className="flex-1 accent-emerald-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs text-neutral-500 font-mono w-8 text-right">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
