import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Get the API key safely
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON Schema for task analysis
const taskAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    priorityScore: { type: Type.INTEGER, description: "A calculated priority score from 1 to 100 based on urgency and importance." },
    riskScore: { type: Type.INTEGER, description: "A risk level score from 1 to 100 indicating the probability of missing the deadline." },
    urgencyLevel: { type: Type.STRING, description: "One of: 'Low', 'Medium', 'High', 'Critical'." },
    importanceLevel: { type: Type.STRING, description: "One of: 'Low', 'Medium', 'High', 'Critical'." },
    reasoning: { type: Type.STRING, description: "Brief explanation of why this priority and risk level were assigned." },
    completionProbability: { type: Type.INTEGER, description: "The calculated chance of successful on-time completion (0 to 100)." },
    actionPlan: {
      type: Type.ARRAY,
      description: "Step-by-step actionable plan to get this task done.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          title: { type: Type.STRING, description: "Name of the step" },
          description: { type: Type.STRING, description: "Clear instructions for this step" },
          timeline: { type: Type.STRING, description: "Suggested timing or effort, e.g. 'Day 1: 2 hours', 'Final day'" }
        },
        required: ["step", "title", "description", "timeline"]
      }
    },
    coachAdvice: {
      type: Type.OBJECT,
      properties: {
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable quick tips" },
        timeManagementAdvice: { type: Type.STRING, description: "Specific time blocking or pacing advice" },
        focusSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions to avoid distractions during this task" },
        strategy: { type: Type.STRING, description: "High-level summary of the completion strategy" },
        mistakesToAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Common pitfalls or last-minute mistakes to watch out for" }
      },
      required: ["recommendations", "timeManagementAdvice", "focusSuggestions", "strategy", "mistakesToAvoid"]
    }
  },
  required: [
    "priorityScore", "riskScore", "urgencyLevel", "importanceLevel", 
    "reasoning", "completionProbability", "actionPlan", "coachAdvice"
  ]
};

// JSON Schema for daily planner response
const dailyPlannerSchema = {
  type: Type.OBJECT,
  properties: {
    optimizedSchedule: {
      type: Type.ARRAY,
      description: "An hour-by-hour or block-by-block optimized schedule for the day.",
      items: {
        type: Type.OBJECT,
        properties: {
          timeSlot: { type: Type.STRING, description: "e.g., '09:00 AM - 10:30 AM'" },
          taskName: { type: Type.STRING, description: "Name of the task being worked on" },
          duration: { type: Type.STRING, description: "e.g., '1.5 hours'" },
          description: { type: Type.STRING, description: "What exactly to do in this slot" },
          focusTip: { type: Type.STRING, description: "A micro productivity or focus tip tailored to this block" }
        },
        required: ["timeSlot", "taskName", "duration", "description", "focusTip"]
      }
    },
    overloadAnalysis: {
      type: Type.OBJECT,
      description: "Analysis of whether the user is overloaded and where potential failures or conflicts exist.",
      properties: {
        isOverloaded: { type: Type.BOOLEAN, description: "Whether the remaining tasks require more effort than the time available" },
        conflicts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific timeline or task conflicts" },
        missedRiskTasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of tasks likely to be missed if schedule is not optimized" },
        advice: { type: Type.STRING, description: "Tactical, direct advice on how to triage or reorganize to avoid disaster" }
      },
      required: ["isOverloaded", "conflicts", "missedRiskTasks", "advice"]
    },
    productivityTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 highly tailored productivity hacks for today's workload."
    }
  },
  required: ["optimizedSchedule", "overloadAnalysis", "productivityTips"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API Route 1: Analyze individual task
  app.post("/api/analyze-task", async (req, res) => {
    try {
      const { name, description, deadline, estimatedHours, category, currentDate } = req.body;
      if (!name || !deadline || !estimatedHours) {
        return res.status(400).json({ error: "Missing required task fields (name, deadline, estimatedHours)" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on the server. Please check the Secrets panel." });
      }

      const prompt = `
        You are DeadlineAI, an intelligent productivity coach.
        Analyze the following task and assess priority, urgency, and deadline risk.
        
        Task Details:
        - Name: ${name}
        - Description: ${description || "No description provided"}
        - Category: ${category || "Other"}
        - Deadline: ${deadline}
        - Estimated Effort: ${estimatedHours} hours
        
        Current Time Context: ${currentDate || new Date().toISOString()}
        
        Calculate:
        1. A priorityScore (1 to 100): Weighted heavily by urgency and importance.
        2. A riskScore (1 to 100): Chance of missing the deadline considering effort, complexity, and remaining time.
        3. Urgency and Importance levels (Low, Medium, High, Critical).
        4. Detailed reasoning explanation.
        5. Completion Probability (0 to 100).
        6. A realistic step-by-step actionPlan.
        7. coachAdvice containing tailored time management, focus suggestions, strategy, and mistakes to avoid.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are DeadlineAI, a strict but highly supportive productivity strategist. Your target is helping procrastinators and busy professionals avoid failure by giving clear, high-fidelity, actionable task breakdowns and realistic time estimates. Always output standard valid JSON adhering strictly to the schema provided.",
          responseMimeType: "application/json",
          responseSchema: taskAnalysisSchema,
          temperature: 0.2,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No text returned from Gemini API");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing task:", error);
      res.status(500).json({ error: error.message || "Failed to analyze task" });
    }
  });

  // API Route 2: Generate overall daily plan / overload analysis
  app.post("/api/daily-planner", async (req, res) => {
    try {
      const { tasks, availableHours, focusGoal, currentDate } = req.body;
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: "Tasks array is required" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on the server. Please check the Secrets panel." });
      }

      const tasksString = JSON.stringify(tasks.map(t => ({
        name: t.name,
        description: t.description,
        category: t.category,
        deadline: t.deadline,
        estimatedHours: t.estimatedHours,
        completed: t.completed,
        priority: t.aiAnalysis ? {
          score: t.aiAnalysis.priorityScore,
          urgency: t.aiAnalysis.urgencyLevel,
          importance: t.aiAnalysis.importanceLevel
        } : "Not analyzed yet"
      })), null, 2);

      const prompt = `
        You are DeadlineAI, an expert schedule optimizer and risk manager.
        Create a high-fidelity, daily planner schedule and overload risk analysis.
        
        Current Time Context: ${currentDate || new Date().toISOString()}
        Available productive time for today: ${availableHours || 8} hours.
        Today's Focus Goal: ${focusGoal || "Maximize task progress and secure upcoming deadlines."}
        
        Active tasks to schedule and analyze:
        ${tasksString}
        
        Your response must provide:
        1. An optimizedSchedule with chronological time slots (e.g. "09:00 AM - 10:30 AM", etc.) fitting within the user's available time.
        2. A complete overloadAnalysis indicating if they are overloaded, any timeline conflicts, specific tasks likely to be missed (due to high remaining effort vs short timeline), and professional coaching triage advice.
        3. Tailored high-impact productivity tips.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are DeadlineAI's scheduler engine. You analyze multiple deadlines, total remaining effort, and human productivity bounds to generate highly realistic daily plans. You call out scheduling conflicts ruthlessly to prevent users from lying to themselves about how much they can get done.",
          responseMimeType: "application/json",
          responseSchema: dailyPlannerSchema,
          temperature: 0.2,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No text returned from Gemini API");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error generating daily plan:", error);
      res.status(500).json({ error: error.message || "Failed to generate daily planner" });
    }
  });

  // Serve static assets in production, otherwise use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
