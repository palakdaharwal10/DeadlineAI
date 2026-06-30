import React from 'react';
import { 
  Clock, Brain, ShieldAlert, Trash2, Check, HelpCircle, 
  Briefcase, GraduationCap, User, DollarSign, HeartPulse, RefreshCw
} from 'lucide-react';
import { Task, CategoryType } from '../types';
import { formatTimeRemaining, formatLocalDateTime } from '../utils';

interface TaskCardProps {
  key?: string;
  task: Task;
  isAnalyzing: boolean;
  onToggleComplete: (id: string) => void;
  onAnalyze: (id: string) => void;
  onViewDetails: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; icon: React.ReactNode }> = {
  Work: { 
    bg: 'bg-blue-500/10 border border-blue-500/15', 
    text: 'text-blue-400', 
    icon: <Briefcase className="w-3.5 h-3.5" /> 
  },
  Study: { 
    bg: 'bg-purple-500/10 border border-purple-500/15', 
    text: 'text-purple-400', 
    icon: <GraduationCap className="w-3.5 h-3.5" /> 
  },
  Personal: { 
    bg: 'bg-emerald-500/10 border border-emerald-500/15', 
    text: 'text-emerald-400', 
    icon: <User className="w-3.5 h-3.5" /> 
  },
  Finance: { 
    bg: 'bg-amber-500/10 border border-amber-500/15', 
    text: 'text-amber-400', 
    icon: <DollarSign className="w-3.5 h-3.5" /> 
  },
  Health: { 
    bg: 'bg-rose-500/10 border border-rose-500/15', 
    text: 'text-rose-400', 
    icon: <HeartPulse className="w-3.5 h-3.5" /> 
  },
  Other: { 
    bg: 'bg-slate-500/10 border border-slate-500/15', 
    text: 'text-slate-400', 
    icon: <HelpCircle className="w-3.5 h-3.5" /> 
  },
};

export default function TaskCard({ 
  task, 
  isAnalyzing, 
  onToggleComplete, 
  onAnalyze, 
  onViewDetails, 
  onDelete 
}: TaskCardProps) {
  const { text: countdownText, isClose, isOverdue, badgeClass: countdownBadgeClass } = formatTimeRemaining(task.deadline);
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;

  // Compute border style based on AI risk score if available
  let cardBorder = 'border-slate-800 hover:border-slate-750 bg-slate-900';
  if (!task.completed && task.aiAnalysis) {
    if (task.aiAnalysis.riskScore >= 80) {
      cardBorder = 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/15 ring-1 ring-rose-500/10';
    } else if (task.aiAnalysis.riskScore >= 50) {
      cardBorder = 'border-amber-500/30 hover:border-amber-500/50 bg-amber-950/15';
    }
  }

  // Adjust Countdown badge class for dark mode if they are light-based
  let darkCountdownClass = countdownBadgeClass;
  if (countdownBadgeClass.includes('bg-rose-50')) {
    darkCountdownClass = 'bg-rose-500/10 border-rose-500/25 text-rose-400';
  } else if (countdownBadgeClass.includes('bg-amber-50')) {
    darkCountdownClass = 'bg-amber-500/10 border-amber-500/25 text-amber-400';
  } else if (countdownBadgeClass.includes('bg-slate-50')) {
    darkCountdownClass = 'bg-slate-800 border-slate-700 text-slate-300';
  }

  return (
    <div id={`task-card-${task.id}`} className={`rounded-2xl border p-5 shadow-lg transition-all duration-200 ${cardBorder}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Checkbox & Task details */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <button
            id={`toggle-complete-${task.id}`}
            type="button"
            onClick={() => onToggleComplete(task.id)}
            className={`w-5.5 h-5.5 mt-0.5 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 transition-all ${
              task.completed 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-slate-700 hover:border-indigo-500 bg-slate-950'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className={`font-bold text-base leading-tight tracking-tight text-white break-words ${task.completed ? 'line-through text-slate-500' : ''}`}>
              {task.name}
            </h3>
            {task.description && (
              <p className={`text-xs text-slate-400 line-clamp-2 leading-relaxed ${task.completed ? 'text-slate-500' : ''}`}>
                {task.description}
              </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Category */}
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${catStyle.bg} ${catStyle.text}`}>
                {catStyle.icon}
                <span>{task.category}</span>
              </span>

              {/* Effort */}
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{task.estimatedHours}h effort</span>
              </span>

              {/* Countdown badge (only if incomplete) */}
              {!task.completed && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${darkCountdownClass}`}>
                  <span>{countdownText}</span>
                </span>
              )}

              {/* Completed badge */}
              {task.completed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Completed
                </span>
              )}
            </div>
            
            {/* Real local deadline */}
            <p className="text-[11px] text-slate-500">
              Deadline: {formatLocalDateTime(task.deadline)}
            </p>
          </div>
        </div>

        {/* Right Side: AI Panel or actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t border-slate-800 sm:border-t-0">
          <div className="flex items-center space-x-2">
            {/* AI Status / Result */}
            {isAnalyzing ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Analysing...</span>
              </div>
            ) : task.completed ? (
              // No analysis action for completed tasks to reduce clutter
              null
            ) : task.aiAnalysis ? (
              <div className="flex items-center space-x-2">
                {/* Priority Badge */}
                <div className="flex flex-col items-center px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Priority</span>
                  <span className="text-sm font-black text-indigo-300">{task.aiAnalysis.priorityScore}</span>
                </div>

                {/* Risk Level */}
                <div className={`flex flex-col items-center px-2.5 py-1 border rounded-xl text-center ${
                  task.aiAnalysis.riskScore >= 75 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : task.aiAnalysis.riskScore >= 40 
                      ? 'bg-amber-500/10 border-amber-500/20' 
                      : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    task.aiAnalysis.riskScore >= 75 
                      ? 'text-rose-400' 
                      : task.aiAnalysis.riskScore >= 40 
                        ? 'text-amber-400' 
                        : 'text-emerald-400'
                  }`}>Risk</span>
                  <span className={`text-sm font-black ${
                    task.aiAnalysis.riskScore >= 75 
                      ? 'text-rose-300' 
                      : task.aiAnalysis.riskScore >= 40 
                        ? 'text-amber-300' 
                        : 'text-emerald-300'
                  }`}>{task.aiAnalysis.riskScore}%</span>
                </div>

                {/* Details Button */}
                <button
                  id={`view-details-${task.id}`}
                  type="button"
                  onClick={() => onViewDetails(task)}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/40 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>AI Plan</span>
                </button>
              </div>
            ) : (
              <button
                id={`analyze-task-${task.id}`}
                type="button"
                onClick={() => onAnalyze(task.id)}
                className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Analyze</span>
              </button>
            )}
          </div>

          {/* Delete Action */}
          <button
            id={`delete-task-${task.id}`}
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label="Delete Task"
            className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
