/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { TimerView } from './components/TimerView';
import { ClockView } from './components/ClockView';
import { PomodoroView } from './components/PomodoroView';
import { StopwatchView } from './components/StopwatchView';
import { BottomToolbar } from './components/BottomToolbar';
import { TasksModal } from './components/TasksModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { FocusOverlay } from './components/FocusOverlay';
import { MiniWidget } from './components/MiniWidget';
import { IntroLanding } from './components/IntroLanding';
import { audioService } from './services/audioService';
import { pipService } from './services/pipService';
import { AppMode, AppTheme, AmbientSound, ChimeSound, TaskItem } from './types';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('timer');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('oled');

  // Intro Landing Animation State (10-second opening animation)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Overlays & Modals
  const [isFocusOpen, setIsFocusOpen] = useState<boolean>(false);
  const [isMiniOpen, setIsMiniOpen] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isTasksOpen, setIsTasksOpen] = useState<boolean>(false);

  // Audio State
  const [selectedChime, setSelectedChime] = useState<ChimeSound>('bell');
  const [chimeVolume, setChimeVolume] = useState<number>(0.8);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('rain');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);

  // Live Timer telemetry for Mini Widget & Native PiP
  const [liveTimeText, setLiveTimeText] = useState<string>('00:00');
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(false);

  // Focus Tasks State with LocalStorage persistence
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: '1', text: 'Deep work focus block', completed: false, createdAt: Date.now() },
      { id: '2', text: 'Review sprint architecture', completed: true, createdAt: Date.now() - 1000 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('chronos_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const handleAddTask = (text: string) => {
    setTasks([
      { id: Date.now().toString(), text, completed: false, createdAt: Date.now() },
      ...tasks,
    ]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleClearCompletedTasks = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  // Ambient sound toggle
  const handleToggleAmbient = () => {
    if (isAmbientActive) {
      audioService.stopAmbient();
      setIsAmbientActive(false);
    } else {
      audioService.setAmbientVolume(ambientVolume);
      audioService.startAmbient(ambientSound === 'off' ? 'rain' : ambientSound);
      setIsAmbientActive(true);
    }
  };

  const handleSelectAmbient = (type: AmbientSound) => {
    setAmbientSound(type);
    if (type === 'off') {
      audioService.stopAmbient();
      setIsAmbientActive(false);
    } else {
      audioService.startAmbient(type);
      setIsAmbientActive(true);
    }
  };

  // Native Picture-in-Picture Trigger
  const handleTriggerNativePip = useCallback(async () => {
    await pipService.toggleNativePip((action) => {
      if (action === 'play') {
        const startBtn = document.querySelector('button.group') as HTMLButtonElement | null;
        if (startBtn) startBtn.click();
      }
    });
  }, []);

  const handleToggleMini = () => {
    setIsMiniOpen((prev) => !prev);
    handleTriggerNativePip();
  };

  const handleTimeUpdate = useCallback(
    (timeText: string, running: boolean) => {
      setLiveTimeText(timeText);
      setIsLiveRunning(running);
    },
    []
  );

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFocusOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMini();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleToggleAmbient();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTasksOpen((prev) => !prev);
      } else if (e.key === '1') {
        setCurrentMode('timer');
      } else if (e.key === '2') {
        setCurrentMode('clock');
      } else if (e.key === '3') {
        setCurrentMode('pomodoro');
      } else if (e.key === '4') {
        setCurrentMode('stopwatch');
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsFocusOpen(false);
        setIsAudioModalOpen(false);
        setIsShortcutsOpen(false);
        setIsTasksOpen(false);
        setIsMiniOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ambientSound, ambientVolume, isAmbientActive]);

  // Theme styling rules
  const themeClasses = {
    oled: {
      bg: 'bg-black text-white',
      navBg: 'bg-neutral-950/70',
      navBorder: 'border border-neutral-800/80',
      activeTabBg: 'bg-neutral-900',
      activeTabBorder: 'border border-neutral-600',
      activeTabText: 'text-white',
      inactiveTabText: 'text-neutral-400',
    },
    midnight: {
      bg: 'bg-[#070d18] text-slate-100',
      navBg: 'bg-[#0f172a]/70',
      navBorder: 'border border-slate-800/80',
      activeTabBg: 'bg-slate-800',
      activeTabBorder: 'border border-sky-500/50',
      activeTabText: 'text-sky-100',
      inactiveTabText: 'text-slate-400',
    },
    paper: {
      bg: 'bg-[#faf8f5] text-stone-900',
      navBg: 'bg-[#f4f0ea]/80',
      navBorder: 'border border-stone-300',
      activeTabBg: 'bg-white',
      activeTabBorder: 'border border-stone-400',
      activeTabText: 'text-stone-900',
      inactiveTabText: 'text-stone-500',
    },
    emerald: {
      bg: 'bg-[#04110b] text-emerald-100',
      navBg: 'bg-[#092217]/70',
      navBorder: 'border border-emerald-900/60',
      activeTabBg: 'bg-emerald-900/80',
      activeTabBorder: 'border border-emerald-500/60',
      activeTabText: 'text-emerald-100',
      inactiveTabText: 'text-emerald-400',
    },
  }[currentTheme];

  const renderActiveView = () => {
    switch (currentMode) {
      case 'timer':
        return (
          <TimerView
            selectedChime={selectedChime}
            onTimeUpdate={handleTimeUpdate}
          />
        );
      case 'clock':
        return <ClockView />;
      case 'pomodoro':
        return <PomodoroView selectedChime={selectedChime} />;
      case 'stopwatch':
        return <StopwatchView />;
      default:
        return (
          <TimerView
            selectedChime={selectedChime}
            onTimeUpdate={handleTimeUpdate}
          />
        );
    }
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-500 relative overflow-x-hidden ${themeClasses.bg}`}
    >
      {/* 10-Second Intro Landing Animation */}
      {showIntro && <IntroLanding onComplete={() => setShowIntro(false)} />}

      {/* Top Segmented Navigation Header - Faithful replication of the screenshot */}
      <Navigation
        currentMode={currentMode}
        onSelectMode={(m) => setCurrentMode(m)}
        onToggleFocus={() => setIsFocusOpen(true)}
        onToggleMini={handleToggleMini}
        onOpenAudioSettings={() => setIsAudioModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        currentTheme={currentTheme}
        onChangeTheme={(t) => setCurrentTheme(t)}
        isAmbientActive={isAmbientActive}
        ambientSound={ambientSound}
        onToggleAmbient={handleToggleAmbient}
        themeClasses={themeClasses}
      />

      {/* Main Mode Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 relative z-10 pb-4">
        {renderActiveView()}

        {/* Bottom Auxiliary Toolbar from Screenshot (Tasks, Volume, Ambient) */}
        {(currentMode === 'timer' || currentMode === 'pomodoro') && (
          <BottomToolbar
            onOpenTasks={() => setIsTasksOpen(true)}
            onOpenAudioSettings={() => setIsAudioModalOpen(true)}
            onToggleAmbient={handleToggleAmbient}
            isAmbientActive={isAmbientActive}
            completedTasksCount={completedTasksCount}
            totalTasksCount={tasks.length}
          />
        )}
      </main>

      {/* Discreet Human Footer */}
      <footer className="w-full py-4 text-center text-xs text-neutral-600 font-light select-none">
        <span>Chronos Precision Time Suite · Shortcuts: [?] [Space] [F] [M] [T]</span>
      </footer>

      {/* Fullscreen Distraction-Free Focus Overlay */}
      <FocusOverlay
        isOpen={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        currentMode={currentMode}
        isAmbientActive={isAmbientActive}
        ambientSound={ambientSound}
      >
        {renderActiveView()}
      </FocusOverlay>

      {/* Ultra-Compact In-Page Floating Mini Pill Widget */}
      <MiniWidget
        isOpen={isMiniOpen}
        onClose={() => setIsMiniOpen(false)}
        onExpand={() => setIsMiniOpen(false)}
        onTriggerNativePip={handleTriggerNativePip}
        currentMode={currentMode}
        displayTime={liveTimeText}
        isRunning={isLiveRunning}
        onTogglePlay={() => {
          const mainCta = document.querySelector('button.group') as HTMLButtonElement | null;
          if (mainCta) mainCta.click();
        }}
        onReset={() => {
          const resetBtn = document.querySelector("button[title*='Reset']") as HTMLButtonElement | null;
          if (resetBtn) resetBtn.click();
        }}
      />

      {/* Focus Tasks Checklist Modal */}
      <TasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onClearCompleted={handleClearCompletedTasks}
      />

      {/* Audio & Ambient Sound Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        selectedChime={selectedChime}
        onSelectChime={setSelectedChime}
        chimeVolume={chimeVolume}
        onChangeChimeVolume={setChimeVolume}
        ambientSound={ambientSound}
        onSelectAmbient={handleSelectAmbient}
        ambientVolume={ambientVolume}
        onChangeAmbientVolume={setAmbientVolume}
        isAmbientActive={isAmbientActive}
        onToggleAmbient={handleToggleAmbient}
      />

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
