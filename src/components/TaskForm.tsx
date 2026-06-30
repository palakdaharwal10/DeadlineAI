import React, { useState } from 'react';
import { Plus, Sparkles, Clock, Calendar, HelpCircle, Briefcase, GraduationCap, User, DollarSign, HeartPulse, ListPlus } from 'lucide-react';
import { CategoryType, Task } from '../types';

interface TaskFormProps {
  onAddTask: (taskData: {
    name: string;
    description: string;
    deadline: string;
    estimatedHours: number;
    category: CategoryType;
  }) => void;
}

const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  Work: <Briefcase className="w-4 h-4" />,
  Study: <GraduationCap className="w-4 h-4" />,
  Personal: <User className="w-4 h-4" />,
  Finance: <DollarSign className="w-4 h-4" />,
  Health: <HeartPulse className="w-4 h-4" />,
  Other: <HelpCircle className="w-4 h-4" />,
};

const PRESETS = [
  {
    name: "Finalize Hackathon Prototype",
    description: "Connect APIs, build visual metrics dashboards, test responsive layouts, and document installation guides.",
    estimatedHours: 6,
    category: "Work" as CategoryType,
    dueInHours: 8,
  },
  {
    name: "Prepare for Calculus Midterm Exam",
    description: "Review chapters 4 to 7, solve previous year mock papers, and practice integration techniques.",
    estimatedHours: 12,
    category: "Study" as CategoryType,
    dueInHours: 36,
  },
  {
    name: "File Yearly Personal Taxes",
    description: "Gather invoices, verify investment statements, fill state forms, and submit final e-file declaration.",
    estimatedHours: 4,
    category: "Finance" as CategoryType,
    dueInHours: 24,
  }
];

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [category, setCategory] = useState<CategoryType>('Work');
  const [showPresets, setShowPresets] = useState(false);

  // Helper to set datetime relative to now for testing
  const getRelativeDateTimeString = (hoursInFuture: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursInFuture);
    // Format to YYYY-MM-DDTHH:MM
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !deadline || !estimatedHours || Number(estimatedHours) <= 0) return;

    onAddTask({
      name: name.trim(),
      description: description.trim(),
      deadline,
      estimatedHours: Number(estimatedHours),
      category,
    });

    // Reset fields
    setName('');
    setDescription('');
    setDeadline('');
    setEstimatedHours('');
    setCategory('Work');
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setName(preset.name);
    setDescription(preset.description);
    setCategory(preset.category);
    setEstimatedHours(preset.estimatedHours);
    setDeadline(getRelativeDateTimeString(preset.dueInHours));
    setShowPresets(false);
  };

  return (
    <div id="task-creation-container" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <ListPlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Track New Task</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Quick Presets</span>
        </button>
      </div>

      {showPresets && (
        <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-fadeIn">
          <p className="text-xs font-semibold text-slate-400 px-1">Select a task scenario to test immediately:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition-all text-xs cursor-pointer"
              >
                <div className="font-bold text-slate-200 line-clamp-1">{preset.name}</div>
                <div className="text-slate-500 mt-1 flex items-center justify-between">
                  <span>Effort: {preset.estimatedHours}h</span>
                  <span className="font-medium text-indigo-400 bg-indigo-500/15 px-1 rounded">Due: {preset.dueInHours}h</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <div className="space-y-1">
          <label htmlFor="task-name" className="text-xs font-semibold text-slate-400">Task Name</label>
          <input
            id="task-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Finish chemistry project submission"
            className="w-full text-sm px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all placeholder:text-slate-600 text-white"
          />
        </div>

        {/* Description input */}
        <div className="space-y-1">
          <label htmlFor="task-desc" className="text-xs font-semibold text-slate-400">Description / Details (Optional)</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="List any sub-tasks, guidelines, or materials you have..."
            rows={2}
            className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all placeholder:text-slate-600 text-white resize-none"
          />
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deadline */}
          <div className="space-y-1">
            <label htmlFor="task-deadline" className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Deadline</span>
            </label>
            <input
              id="task-deadline"
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all text-white"
            />
          </div>

          {/* Time Required */}
          <div className="space-y-1">
            <label htmlFor="task-effort" className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Estimated Hours</span>
            </label>
            <input
              id="task-effort"
              type="number"
              required
              min="0.1"
              step="0.1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5.5"
              className="w-full text-sm px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all text-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="task-category" className="text-xs font-semibold text-slate-400">Category</label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full text-sm px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all text-white"
            >
              <option value="Work" className="bg-slate-900">Work</option>
              <option value="Study" className="bg-slate-900">Study</option>
              <option value="Personal" className="bg-slate-900">Personal</option>
              <option value="Finance" className="bg-slate-900">Finance</option>
              <option value="Health" className="bg-slate-900">Health</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-950/40 hover:shadow-indigo-950/60 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task & Auto-Analyze</span>
        </button>
      </form>
    </div>
  );
}
