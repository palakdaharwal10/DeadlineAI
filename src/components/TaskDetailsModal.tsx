import React from 'react';
import { 
  X, Brain, ShieldAlert, Sparkles, CheckCircle2, 
  Clock, AlertCircle, Lightbulb, Focus, Map, ArrowRight, RefreshCw
} from 'lucide-react';
import { Task } from '../types';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onReanalyze: (id: string) => void;
  isAnalyzing: boolean;
}

export default function TaskDetailsModal({ task, onClose, onReanalyze, isAnalyzing }: TaskDetailsModalProps) {
  const analysis = task.aiAnalysis;
  if (!analysis) return null;

  // Badge styles
  const getLevelBadge = (level: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      case 'Low':
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
    }
  };

  // Color matching for risk levels
  const getRiskColor = (score: number) => {
    if (score >= 75) return { text: 'text-rose-400', bg: 'bg-rose-600', bgLight: 'bg-rose-950/30' };
    if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-600', bgLight: 'bg-amber-950/30' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-600', bgLight: 'bg-emerald-950/30' };
  };

  const riskInfo = getRiskColor(analysis.riskScore);
  const probInfo = getRiskColor(100 - analysis.completionProbability); // lower probability = higher risk color

  return (
    <div id="ai-details-modal-overlay" className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="ai-details-modal" 
        className="bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-slideUp"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/30">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-450">
              <Brain className="w-5 h-5 text-indigo-405" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Assistant Analysis</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">{task.name}</h2>
            <p className="text-xs text-slate-400">Category: <span className="font-semibold text-slate-300">{task.category}</span> • Effort: <span className="font-semibold text-slate-300">{task.estimatedHours} hours</span></p>
          </div>
          <button
            id="close-details-modal"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Urgency, Importance, Risk & Probability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Priority Score */}
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center flex flex-col justify-between">
              <span className="text-xs font-bold text-indigo-400">Priority Score</span>
              <div className="my-2">
                <span className="text-4xl font-black text-indigo-300">{analysis.priorityScore}</span>
                <span className="text-xs font-semibold text-slate-500">/100</span>
              </div>
              <span className="text-[10px] text-indigo-450 font-medium">Weighted rank</span>
            </div>

            {/* Risk Score */}
            <div className={`p-4 rounded-2xl border text-center flex flex-col justify-between ${riskInfo.bgLight} border-slate-800`}>
              <span className="text-xs font-bold text-slate-400">Risk of Missing</span>
              <div className="my-2">
                <span className={`text-4xl font-black ${riskInfo.text}`}>{analysis.riskScore}%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {analysis.riskScore >= 75 ? 'Critical Risk' : analysis.riskScore >= 40 ? 'Moderate Risk' : 'Low Risk'}
              </span>
            </div>

            {/* Completion Probability */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center flex flex-col justify-between md:col-span-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
                <span>Completion Probability</span>
                <span className="font-extrabold text-indigo-400">{analysis.completionProbability}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full my-3">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.completionProbability}%` }}
                ></div>
              </div>
              <span className="text-[11px] text-slate-500 leading-tight">Chance of completion by deadline</span>
            </div>
          </div>

          {/* Matrix Badges */}
          <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-950/30 rounded-xl border border-slate-800 text-sm">
            <div className="flex items-center space-x-1.5 mr-4">
              <span className="text-xs font-bold text-slate-400">Urgency:</span>
              <span className={`px-2 py-0.5 text-xs font-extrabold border rounded-md ${getLevelBadge(analysis.urgencyLevel)}`}>
                {analysis.urgencyLevel}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-400">Importance:</span>
              <span className={`px-2 py-0.5 text-xs font-extrabold border rounded-md ${getLevelBadge(analysis.importanceLevel)}`}>
                {analysis.importanceLevel}
              </span>
            </div>
          </div>

          {/* AI Reasoning Text */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Priority & Risk Explanation</span>
            </h4>
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
              {analysis.reasoning}
            </div>
          </div>

          {/* Action Planner Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Map className="w-3.5 h-3.5 text-slate-500" />
              <span>Step-by-Step Action Planner</span>
            </h4>
            
            <div className="relative border-l border-indigo-950 ml-3.5 pl-5.5 space-y-5">
              {analysis.actionPlan.map((stepItem, index) => (
                <div key={index} className="relative group">
                  {/* Step Dot */}
                  <div className="absolute -left-[31px] top-0.5 w-[20px] h-[20px] rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[10px] font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {stepItem.step}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="font-bold text-sm text-slate-200">{stepItem.title}</h5>
                      <span className="text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full self-start">
                        {stepItem.timeline}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{stepItem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Coach Corner */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Productivity Coach Corner</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Recommendations */}
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/15 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Strategic Tips</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {analysis.coachAdvice.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Distraction blockers */}
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/15 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Focus className="w-4 h-4 text-purple-500" />
                  <span>Focus Suggestions</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {analysis.coachAdvice.focusSuggestions.map((sug, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">{sug}</li>
                  ))}
                </ul>
              </div>

              {/* Time Management Advice */}
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Time Management & Pacing Strategy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.coachAdvice.timeManagementAdvice}
                </p>
              </div>

              {/* Pitfalls to Avoid */}
              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/15 space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Common Mistakes / Last-Minute Pitfalls to Avoid</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-200 list-none">
                  {analysis.coachAdvice.mistakesToAvoid.map((pit, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 pl-1">
                      <span className="text-rose-400 font-black mt-0.5">•</span>
                      <span>{pit}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/30">
          <button
            id={`reanalyze-task-${task.id}`}
            type="button"
            disabled={isAnalyzing}
            onClick={() => onReanalyze(task.id)}
            className="px-4 py-2.5 border border-slate-850 hover:border-slate-700 bg-slate-900 hover:bg-slate-850 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Recalculate AI Plan</span>
          </button>
          
          <button
            id="close-details-modal-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
