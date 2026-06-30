import React, { useState } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, Sparkles, 
  Lightbulb, ShieldAlert, Sliders, Play, RefreshCw, Zap
} from 'lucide-react';
import { DailyPlannerResponse, Task } from '../types';

interface DailyPlannerViewProps {
  tasks: Task[];
  dailyPlan: DailyPlannerResponse | null;
  onGeneratePlan: (availableHours: number, focusGoal: string) => void;
  isGenerating: boolean;
}

export default function DailyPlannerView({ 
  tasks, 
  dailyPlan, 
  onGeneratePlan, 
  isGenerating 
}: DailyPlannerViewProps) {
  const [availableHours, setAvailableHours] = useState<number>(8);
  const [focusGoal, setFocusGoal] = useState<string>('');

  const incompleteTasks = tasks.filter(t => !t.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan(availableHours, focusGoal.trim());
  };

  return (
    <div id="daily-planner-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left side: Configuration Pane */}
      <div className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5 h-fit">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Schedule Settings</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure your day's constraints. Gemini will map your highest-priority and most critical deadlines into a highly optimized hourly roadmap.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available hours slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="avail-hours-range" className="font-semibold text-slate-400">Productive Hours Available</label>
              <span className="font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                {availableHours} hours
              </span>
            </div>
            <input 
              id="avail-hours-range"
              type="range"
              min="1"
              max="16"
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Excluding breaks and sleep</span>
          </div>

          {/* Today's Focus Goal input */}
          <div className="space-y-1.5">
            <label htmlFor="focus-goal" className="text-xs font-semibold text-slate-400">Today's Prime Focus Goal</label>
            <input 
              id="focus-goal"
              type="text"
              value={focusGoal}
              onChange={(e) => setFocusGoal(e.target.value)}
              placeholder="e.g. Finish all critical work stuff"
              className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:bg-slate-900 rounded-xl focus:outline-none transition-all placeholder:text-slate-650 text-white"
            />
          </div>

          {/* Prompt warning if no tasks exist */}
          {incompleteTasks.length === 0 ? (
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-400 leading-relaxed">
              You don't have any active incomplete tasks to schedule. Please add some tasks first!
            </div>
          ) : (
            <button
              id="generate-daily-plan-btn"
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-950 disabled:text-slate-500 font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Structuring Day...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate AI Daily Plan</span>
                </>
              )}
            </button>
          )}
        </form>

        {dailyPlan && (
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Smart Tips</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {dailyPlan.productivityTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-450 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right side: Results Pane (Schedule & Risks) */}
      <div className="lg:col-span-2 space-y-6">
        {isGenerating ? (
          <div id="plan-loading-state" className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl min-h-[400px]">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full animate-pulse border border-indigo-500/20">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="font-bold text-lg text-white">Compiling Daily Roadmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini is cross-referencing your deadlines, analyzing remaining hours, predicting schedule overloads, and organizing optimal work sprints...
              </p>
            </div>
          </div>
        ) : dailyPlan ? (
          <div className="grid grid-cols-1 gap-6 animate-fadeIn">
            
            {/* Overload Alert Panel */}
            <div id="overload-analysis-panel" className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-4 items-start ${
              dailyPlan.overloadAnalysis.isOverloaded 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            }`}>
              <div className={`p-3 rounded-xl shrink-0 ${
                dailyPlan.overloadAnalysis.isOverloaded ? 'bg-rose-500/20 text-rose-400 border border-rose-500/25' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'
              }`}>
                {dailyPlan.overloadAnalysis.isOverloaded ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight leading-none text-white">
                    {dailyPlan.overloadAnalysis.isOverloaded 
                      ? 'Critical Schedule Overload Detected!' 
                      : 'Schedule Safely Balanced'}
                  </h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    dailyPlan.overloadAnalysis.isOverloaded ? 'bg-rose-500/25 text-rose-400' : 'bg-emerald-500/25 text-emerald-400'
                  }`}>
                    {dailyPlan.overloadAnalysis.isOverloaded ? 'Warning' : 'Good to Go'}
                  </span>
                </div>
                
                <p className="text-xs leading-relaxed text-slate-300">
                  {dailyPlan.overloadAnalysis.advice}
                </p>

                {/* Overloaded specifics */}
                {dailyPlan.overloadAnalysis.isOverloaded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-rose-500/20">
                    {dailyPlan.overloadAnalysis.conflicts.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-300">Time Conflicts:</span>
                        <ul className="text-xs list-disc list-inside space-y-0.5 text-rose-200">
                          {dailyPlan.overloadAnalysis.conflicts.map((conf, idx) => (
                            <li key={idx}>{conf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dailyPlan.overloadAnalysis.missedRiskTasks.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-300">Tasks likely missed without action:</span>
                        <ul className="text-xs list-disc list-inside space-y-0.5 text-rose-200">
                          {dailyPlan.overloadAnalysis.missedRiskTasks.map((tName, idx) => (
                            <li key={idx} className="font-semibold">{tName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Daily schedule block list */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-extrabold text-base text-white">Optimized Day Roadmap</h3>
                </div>
                <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full">
                  Sorted Chronologically
                </span>
              </div>

              <div className="space-y-4">
                {dailyPlan.optimizedSchedule.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-6">Your plan is empty. Double check your settings.</p>
                ) : (
                  dailyPlan.optimizedSchedule.map((block, index) => (
                    <div 
                      key={index} 
                      className="group flex flex-col md:flex-row gap-3 md:items-center p-3.5 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800 rounded-xl transition-all"
                    >
                      {/* Time Slot badge */}
                      <div className="flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl shrink-0 w-fit">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-black tracking-tight">{block.timeSlot}</span>
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 break-words">{block.taskName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{block.description}</p>
                      </div>

                      {/* Focus Tip */}
                      <div className="text-[11px] text-indigo-300 bg-slate-900 border border-indigo-500/15 p-2 rounded-lg leading-relaxed max-w-xs md:w-56 shrink-0 italic">
                        <span className="font-bold not-italic text-indigo-400 block text-[9px] uppercase tracking-wider mb-0.5">Focus Hack:</span>
                        {block.focusTip}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div id="plan-empty-state" className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl min-h-[400px]">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              <Calendar className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="font-bold text-lg text-white">Your AI Day Planner is Empty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your productive hours and hit the button to let Gemini structure a bulletproof hourly plan based on your deadlines.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
