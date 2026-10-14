import React from 'react';
import { Timer, Clock, Flame, Watch, Maximize2, Minimize2, Volume2, VolumeX, Palette, HelpCircle } from 'lucide-react';
import { AppMode, AppTheme, AmbientSound } from '../types';

interface NavigationProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onToggleFocus: () => void;
  onToggleMini: () => void;
  onOpenAudioSettings: () => void;
  onOpenShortcuts: () => void;
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  isAmbientActive: boolean;
  ambientSound: AmbientSound;
  onToggleAmbient: () => void;
  themeClasses: {
    navBg: string;
    navBorder: string;
    activeTabBg: string;
    activeTabBorder: string;
    activeTabText: string;
    inactiveTabText: string;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onSelectMode,
  onToggleFocus,
  onToggleMini,
  onOpenAudioSettings,
  onOpenShortcuts,
  currentTheme,
  onChangeTheme,
  isAmbientActive,
  onToggleAmbient,
  themeClasses,
}) => {
  const modes: { id: AppMode; label: string; icon: React.ReactNode }[] = [
    { id: 'timer', label: 'Timer', icon: <Timer className="w-4 h-4 mr-2" /> },
    { id: 'clock', label: 'Clock', icon: <Clock className="w-4 h-4 mr-2" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Flame className="w-4 h-4 mr-2" /> },
    { id: 'stopwatch', label: 'Stopwatch', icon: <Watch className="w-4 h-4 mr-2" /> },
  ];

  const cycleTheme = () => {
    const order: AppTheme[] = ['oled', 'midnight', 'paper', 'emerald'];
    const nextIdx = (order.indexOf(currentTheme) + 1) % order.length;
    onChangeTheme(order[nextIdx]);
  };

  return (
    <header className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6 pb-4 px-4 select-none z-20">
      {/* Primary Mode Tabs Segmented Bar - Matches image layout */}
      <nav
        aria-label="Main Navigation"
        className={`flex items-center p-1 rounded-full ${themeClasses.navBorder} ${themeClasses.navBg} backdrop-blur-md transition-all duration-300 shadow-lg`}
      >
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-center px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-normal tracking-wide transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${themeClasses.activeTabBg} ${themeClasses.activeTabBorder} ${themeClasses.activeTabText} shadow-inner`
                  : `${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Auxiliary Controls: Focus & Mini (as seen in screenshot) + Audio & Theme */}
      <div className="flex items-center gap-2">
        {/* Focus Mode Pill */}
        <button
          onClick={onToggleFocus}
          title="Fullscreen Focus Mode (F)"
          className={`flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-normal tracking-wide cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`}
        >
          <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
          <span>Focus</span>
        </button>

        {/* Mini Mode Pill */}
        <button
          onClick={onToggleMini}
          title="Mini Widget View (M)"
          className={`flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-normal tracking-wide cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`}
        >
          <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
          <span>Mini</span>
        </button>

        {/* Quick Ambient Audio Toggle */}
        <button
          onClick={onToggleAmbient}
          title={isAmbientActive ? 'Ambient Sound Playing (Click to Mute)' : 'Play Ambient Soundscape'}
          className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${
            isAmbientActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : `${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`
          }`}
        >
          {isAmbientActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Audio Sound & Chime Settings */}
        <button
          onClick={onOpenAudioSettings}
          title="Audio & Chime Settings"
          className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`}
        >
          <span className="text-xs font-mono">🔊</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={cycleTheme}
          title={`Current Theme: ${currentTheme.toUpperCase()} (Click to toggle)`}
          className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${themeClasses.navBorder} ${themeClasses.navBg} ${themeClasses.inactiveTabText} hover:text-white hover:bg-white/5`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
