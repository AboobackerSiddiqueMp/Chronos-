export type AppMode = 'timer' | 'clock' | 'pomodoro' | 'stopwatch';

export type AppTheme = 'oled' | 'midnight' | 'paper' | 'emerald';

export type ChimeSound = 'bell' | 'gong' | 'marimba' | 'beep';

export type AmbientSound = 'off' | 'rain' | 'whitenoise' | 'cafe' | 'forest';

export interface LapItem {
  id: number;
  lapNumber: number;
  lapTimeMs: number;
  overallTimeMs: number;
}

export interface WorldClockItem {
  id: string;
  city: string;
  timeZone: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
