import React from 'react';
import { ListTodo, AlertTriangle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardStatsViewProps {
  stats: DashboardStats;
}

export default function DashboardStatsView({ stats }: DashboardStatsViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Tasks Card */}
      <div id="stat-total-tasks" className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.totalTasks}</p>
          <p className="text-xs text-slate-500">In your companion</p>
        </div>
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      {/* High Priority Card */}
      <div id="stat-high-priority" className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 ring-1 ring-rose-500/20 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Urgent & Critical</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.highPriorityTasks}</p>
          <p className="text-xs text-rose-500 font-medium">Needs immediate focus</p>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div id="stat-upcoming-deadlines" className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Upcoming (48h)</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.upcomingDeadlinesCount}</p>
          <p className="text-xs text-amber-500 font-medium">Closing deadlines</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Completion progress */}
      <div id="stat-completion-progress" className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 flex items-start justify-between">
        <div className="space-y-1 w-full">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Progress</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-white tracking-tight">{stats.completionProgress}%</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.completionProgress}%` }}
            ></div>
          </div>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 self-start ml-2">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Productivity Score */}
      <div id="stat-productivity-score" className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-white tracking-tight">{stats.productivityScore}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              {stats.productivityScore >= 80 ? 'Excellent' : stats.productivityScore >= 50 ? 'Good' : 'Needs Work'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Based on task velocity</p>
        </div>
        <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
