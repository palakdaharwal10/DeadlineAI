/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'Work' | 'Study' | 'Personal' | 'Finance' | 'Health' | 'Other';

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string; // YYYY-MM-DDTHH:mm
  estimatedHours: number;
  category: CategoryType;
  completed: boolean;
  createdAt: string;
  aiAnalysis?: TaskAIAnalysis | null;
}

export interface TaskAIAnalysis {
  priorityScore: number; // 1-100
  riskScore: number; // 1-100
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  importanceLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning: string;
  completionProbability: number; // 0-100
  actionPlan: {
    step: number;
    title: string;
    description: string;
    timeline: string;
  }[];
  coachAdvice: {
    recommendations: string[];
    timeManagementAdvice: string;
    focusSuggestions: string[];
    strategy: string;
    mistakesToAvoid: string[];
  };
}

export interface DailyScheduleBlock {
  timeSlot: string;
  taskName: string;
  duration: string;
  description: string;
  focusTip: string;
}

export interface DailyPlannerResponse {
  optimizedSchedule: DailyScheduleBlock[];
  overloadAnalysis: {
    isOverloaded: boolean;
    conflicts: string[];
    missedRiskTasks: string[];
    advice: string;
  };
  productivityTips: string[];
}

export interface DashboardStats {
  totalTasks: number;
  highPriorityTasks: number;
  upcomingDeadlinesCount: number;
  completionProgress: number; // percentage
  productivityScore: number; // calculated rating 0-100
}
