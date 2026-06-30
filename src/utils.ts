import { Task, DashboardStats } from './types';

/**
 * Formats a deadline string into a friendly, human-readable text
 * and determines if it's close or overdue.
 */
export function formatTimeRemaining(deadlineStr: string): { 
  text: string; 
  isClose: boolean; 
  isOverdue: boolean; 
  badgeClass: string;
} {
  const now = new Date().getTime();
  const target = new Date(deadlineStr).getTime();
  const diffMs = target - now;
  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let text = '';
  let isClose = false;

  if (isOverdue) {
    if (diffDays > 0) {
      text = `Overdue by ${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      text = `Overdue by ${diffHours}h`;
    } else {
      text = `Overdue by less than an hour`;
    }
    return {
      text,
      isClose: true,
      isOverdue: true,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
    };
  }

  // Future due
  isClose = diffHours < 24; // Less than 24 hours

  if (diffDays > 0) {
    text = `Due in ${diffDays}d ${diffHours % 24}h`;
    const badgeClass = diffDays <= 2 
      ? 'bg-amber-50 text-amber-700 border-amber-100' 
      : 'bg-slate-50 text-slate-600 border-slate-200';
    return { text, isClose, isOverdue, badgeClass };
  } else if (diffHours > 0) {
    text = `Due in ${diffHours}h`;
    return {
      text,
      isClose: true,
      isOverdue,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  } else {
    text = `Due in less than an hour!`;
    return {
      text,
      isClose: true,
      isOverdue,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
    };
  }
}

/**
 * Calculates dashboard statistics based on current active tasks.
 */
export function calculateStats(tasks: Task[]): DashboardStats {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      highPriorityTasks: 0,
      upcomingDeadlinesCount: 0,
      completionProgress: 0,
      productivityScore: 100
    };
  }

  const completedTasks = tasks.filter(t => t.completed);
  const completionProgress = Math.round((completedTasks.length / totalTasks) * 100);

  // High priority tasks are incomplete tasks with score >= 70 or Critical/High urgency
  const highPriorityTasks = tasks.filter(t => {
    if (t.completed) return false;
    if (!t.aiAnalysis) return false;
    return (
      t.aiAnalysis.priorityScore >= 70 || 
      t.aiAnalysis.urgencyLevel === 'High' || 
      t.aiAnalysis.urgencyLevel === 'Critical'
    );
  }).length;

  // Upcoming deadlines: incomplete and due in less than 48h
  const now = new Date().getTime();
  const upcomingDeadlinesCount = tasks.filter(t => {
    if (t.completed) return false;
    const dueTime = new Date(t.deadline).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  }).length;

  // Dynamic productivity scoring algorithm
  let score = completionProgress;

  let overdueIncompleteCount = 0;
  let highRiskIncompleteCount = 0;

  tasks.forEach(t => {
    if (!t.completed) {
      const isOverdue = new Date(t.deadline).getTime() < now;
      if (isOverdue) overdueIncompleteCount++;

      if (t.aiAnalysis && t.aiAnalysis.riskScore >= 75) {
        highRiskIncompleteCount++;
      }
    }
  });

  // Apply penalties
  score -= (overdueIncompleteCount * 8); // heavy penalty for overdue
  score -= (highRiskIncompleteCount * 4); // penalty for unmanaged high-risk tasks

  // Apply healthy velocity bonus
  if (overdueIncompleteCount === 0 && completedTasks.length > 0) {
    score += 12;
  }

  // Bound between 0 and 100
  const productivityScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    totalTasks,
    highPriorityTasks,
    upcomingDeadlinesCount,
    completionProgress,
    productivityScore
  };
}

/**
 * Returns formatted local string of date and time
 */
export function formatLocalDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}
