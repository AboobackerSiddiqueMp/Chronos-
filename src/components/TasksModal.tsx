import React, { useState } from 'react';
import { X, Check, Trash2, Plus, ListTodo } from 'lucide-react';
import { TaskItem } from '../types';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [newText, setNewText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddTask(newText.trim());
    setNewText('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-5 h-5 text-neutral-300" />
          <h2 className="text-lg font-medium text-white tracking-wide">Focus Tasks</h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add task for this session..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
            autoFocus
          />
          <button
            type="submit"
            className="p-2.5 bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Task List */}
        <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-1">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No tasks added yet. Write down what you want to achieve!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-neutral-900 bg-neutral-950/60 hover:border-neutral-800 transition-all"
              >
                <div
                  onClick={() => onToggleTask(task.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-neutral-700 bg-transparent group-hover:border-neutral-500'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs transition-all ${
                      task.completed ? 'line-through text-neutral-600' : 'text-neutral-200'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info & Clear */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-900 text-xs text-neutral-500">
          <span>
            {completedCount} of {tasks.length} completed
          </span>
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
