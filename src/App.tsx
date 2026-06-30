import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, ListTodo, Calendar, AlertCircle, X, Sparkles, AlertTriangle, Lightbulb
} from 'lucide-react';
import { Task, DashboardStats, DailyPlannerResponse } from './types';
import { calculateStats } from './utils';

// Import child views
import DashboardStatsView from './components/DashboardStatsView.tsx';
import TaskForm from './components/TaskForm.tsx';
import TaskCard from './components/TaskCard.tsx';
import TaskDetailsModal from './components/TaskDetailsModal.tsx';
import DailyPlannerView from './components/DailyPlannerView.tsx';

// Seed task helper for onboarding
const getRelativeDateTimeString = (hoursInFuture: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursInFuture);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const ONBOARDING_TASKS: Task[] = [
  {
    id: "hackathon-sub-initial",
    name: "Submit Hackathon Project Entry",
    description: "Submit codebase, demo video, and brief documentation before the final deadline.",
    deadline: getRelativeDateTimeString(14),
    estimatedHours: 4,
    category: "Work",
    completed: false,
    createdAt: new Date().toISOString(),
    aiAnalysis: {
      priorityScore: 92,
      riskScore: 68,
      urgencyLevel: "Critical",
      importanceLevel: "Critical",
      reasoning: "The deadline is in less than 24 hours. While the remaining effort (4 hours) is manageable, any sudden technical delays could place the submission at high risk. Completing this immediately is highly advised.",
      completionProbability: 88,
      actionPlan: [
        { step: 1, title: "Clean codebase & run final build check", description: "Verify that there are no linter errors and the server starts on port 3000.", timeline: "Hours 0-1" },
        { step: 2, title: "Record 3-minute walk-through demo video", description: "Explain core features (Smart Creation, AI Planner, Coach, Daily Planner) clearly.", timeline: "Hours 1-2.5" },
        { step: 3, title: "Write brief high-fidelity documentation", description: "Focus on design decisions, local storage persistence, and express proxy details.", timeline: "Hours 2.5-3.5" },
        { step: 4, title: "Submit project link & video on Devpost", description: "Submit details, confirm entry, and notify teammates.", timeline: "Hours 3.5-4" }
      ],
      coachAdvice: {
        recommendations: [
          "Secure the working build first before refining aesthetic visual touches.",
          "Record the walk-through demo video in a single take to conserve precious time.",
          "Avoid introducing new major features or dependencies at this late hour."
        ],
        timeManagementAdvice: "Block a dedicated, contiguous 4-hour window today. Turn off all social media notifications and focus entirely on finishing the submissions in discrete steps.",
        focusSuggestions: [
          "Put your phone in another room or on 'Do Not Disturb' mode.",
          "Listen to low-tempo lofi music to maintain steady, calm cognitive state.",
          "Use a 50-minute work, 10-minute break cycle to avoid mental burnout."
        ],
        strategy: "Focus 100% on delivery and submission mechanics. Done is better than perfect.",
        mistakesToAvoid: [
          "Procrastinating on recording the demo video — uploading takes longer than expected.",
          "Testing new packages or major schema changes in the final hours."
        ]
      }
    }
  }
];

export default function App() {
  // State variables
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('deadline_ai_tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading tasks from localStorage", e);
    }
    return ONBOARDING_TASKS;
  });

  const [dailyPlan, setDailyPlan] = useState<DailyPlannerResponse | null>(() => {
    try {
      const saved = localStorage.getItem('deadline_ai_daily_plan');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading daily plan from localStorage", e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner'>('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAnalyzingTaskId, setIsAnalyzingTaskId] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync tasks to local storage
  useEffect(() => {
    localStorage.setItem('deadline_ai_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync daily plan to local storage
  useEffect(() => {
    if (dailyPlan) {
      localStorage.setItem('deadline_ai_daily_plan', JSON.stringify(dailyPlan));
    } else {
      localStorage.removeItem('deadline_ai_daily_plan');
    }
  }, [dailyPlan]);

  // Dynamic calculated statistics
  const stats: DashboardStats = useMemo(() => {
    return calculateStats(tasks);
  }, [tasks]);

  // Core handler: Add task & auto-trigger Gemini analysis
  const handleAddTask = async (taskData: {
    name: string;
    description: string;
    deadline: string;
    estimatedHours: number;
    category: typeof tasks[number]['category'];
  }) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: taskData.name,
      description: taskData.description,
      deadline: taskData.deadline,
      estimatedHours: taskData.estimatedHours,
      category: taskData.category,
      completed: false,
      createdAt: new Date().toISOString(),
      aiAnalysis: null,
    };

    // Add to state
    setTasks(prev => [newTask, ...prev]);

    // Auto trigger Gemini analysis on creation
    handleAnalyzeTask(newTask.id);
  };

  // Core handler: Delete task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  // Core handler: Toggle task completion
  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  // Core handler: Trigger individual task priority assessment & planner
  const handleAnalyzeTask = async (id: string) => {
    setIsAnalyzingTaskId(id);
    setError(null);

    // Find the task inside current state
    const taskToAnalyze = tasks.find(t => t.id === id);
    if (!taskToAnalyze) {
      setIsAnalyzingTaskId(null);
      return;
    }

    try {
      const response = await fetch('/api/analyze-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: taskToAnalyze.name,
          description: taskToAnalyze.description,
          deadline: taskToAnalyze.deadline,
          estimatedHours: taskToAnalyze.estimatedHours,
          category: taskToAnalyze.category,
          currentDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const analysisResult = await response.json();

      // Update task in state
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, aiAnalysis: analysisResult };
          // If this was currently selected, update modal content as well
          if (selectedTask?.id === id) {
            setSelectedTask(updated);
          }
          return updated;
        }
        return t;
      }));

    } catch (err: any) {
      console.error("Error running AI Task analysis:", err);
      setError(`Gemini Analysis failed for "${taskToAnalyze.name}": ${err.message || 'Unknown network error'}`);
    } finally {
      setIsAnalyzingTaskId(null);
    }
  };

  // Core handler: Trigger Daily Schedule Planner
  const handleGenerateDailyPlan = async (availableHours: number, focusGoal: string) => {
    setIsGeneratingPlan(true);
    setError(null);

    try {
      const response = await fetch('/api/daily-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks,
          availableHours,
          focusGoal,
          currentDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const plannerResult = await response.json();
      setDailyPlan(plannerResult);
    } catch (err: any) {
      console.error("Error running daily planner:", err);
      setError(`Daily Planner failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div id="deadline-ai-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Header / Gradient Hero Section */}
      <header className="bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg border border-indigo-500">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-300 bg-clip-text text-transparent">
                    DeadlineAI
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500 text-white tracking-widest border border-indigo-400">
                    Companion
                  </span>
                </div>
                <p className="text-xs text-indigo-300">The Last-Minute Life Saver</p>
              </div>
            </div>

            {/* Nav Switch */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex space-x-1 shrink-0 self-start sm:self-auto">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Smart Dashboard</span>
              </button>
              <button
                id="tab-planner"
                onClick={() => setActiveTab('planner')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'planner'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>AI Daily Planner</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-y-auto">
        
        {/* Error Alert Bar */}
        {error && (
          <div id="global-error-bar" className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start space-x-3.5 text-rose-200 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold leading-none text-white">AI Integration Notice</p>
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views based on tab selection */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Dashboard stats layout */}
            <DashboardStatsView stats={stats} />

            {/* Bottom Section: Creation & Track listings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Task Creation Form Panel */}
              <div className="lg:col-span-1 h-fit">
                <TaskForm onAddTask={handleAddTask} />
              </div>

              {/* Task Listings Panel */}
              <div className="lg:col-span-2 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <ListTodo className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-extrabold text-white tracking-tight">Active Tasks & Milestones</h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {tasks.filter(t => !t.completed).length} remaining
                  </span>
                </div>

                {tasks.length === 0 ? (
                  <div id="tasks-empty-state" className="bg-slate-900 rounded-2xl border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xl">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                      <ListTodo className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-sm">No tasks tracked yet</h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Enter a task above or select a preset to begin avoiding last-minute deadline stress.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {tasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isAnalyzing={isAnalyzingTaskId === task.id}
                        onToggleComplete={handleToggleComplete}
                        onAnalyze={handleAnalyzeTask}
                        onViewDetails={(t) => setSelectedTask(t)}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* AI Daily Planner layout */}
            <DailyPlannerView
              tasks={tasks}
              dailyPlan={dailyPlan}
              onGeneratePlan={handleGenerateDailyPlan}
              isGenerating={isGeneratingPlan}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 shrink-0 text-center">
        <p className="text-xs text-slate-500">
          DeadlineAI – Built for Vibe2Ship Hackathon. Proactive scheduling powered by Gemini.
        </p>
      </footer>

      {/* Detailed AI Analysis Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onReanalyze={handleAnalyzeTask}
          isAnalyzing={isAnalyzingTaskId === selectedTask.id}
        />
      )}

    </div>
  );
}
