import React from 'react';
import { ListTodo, Volume2, Music } from 'lucide-react';

interface BottomToolbarProps {
  onOpenTasks: () => void;
  onOpenAudioSettings: () => void;
  onToggleAmbient: () => void;
  isAmbientActive: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onOpenTasks,
  onOpenAudioSettings,
  onToggleAmbient,
  isAmbientActive,
  completedTasksCount,
  totalTasksCount,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-8 select-none z-10">
      {/* Tasks Pill */}
      <button
        onClick={onOpenTasks}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-800/80 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs font-normal transition-all cursor-pointer shadow-sm group"
      >
        <ListTodo className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
        <span>Tasks</span>
        {totalTasksCount > 0 && (
          <span className="ml-0.5 text-[10px] text-neutral-500 font-mono">
            {completedTasksCount}/{totalTasksCount}
          </span>
        )}
      </button>

      {/* Volume Control Pill */}
      <button
        onClick={onOpenAudioSettings}
        title="Volume & Sound Controls"
        className="p-2.5 rounded-full border border-neutral-800/80 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-sm"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Ambient Sound Pill */}
      <button
        onClick={onToggleAmbient}
        title={isAmbientActive ? 'Ambient Soundscape Playing (Click to Stop)' : 'Play Ambient Soundscape'}
        className={`p-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${
          isAmbientActive
            ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'border-neutral-800/80 bg-neutral-950/70 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white'
        }`}
      >
        <Music className="w-4 h-4" />
      </button>
    </div>
  );
};
