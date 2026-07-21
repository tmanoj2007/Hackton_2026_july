import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Spending Tips
  app.post("/api/spending-tips", async (req, res) => {
    try {
      const { transactions, user } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is required on the server." 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const transactionsSummary = (transactions || []).map((t: any) => 
        `- $${t.amount} spent on ${t.category} (${t.description}) on ${new Date(t.timestamp).toLocaleDateString()}`
      ).join("\n");

      const prompt = `
You are Campus Wallet AI, a friendly financial advisor for college students.
Analyze the following student's profile and transaction history to provide personalized, engaging, and highly actionable spending tips, category breakdowns, and saving challenges.

Student Profile:
- Name: ${user?.displayName || "Student"}
- Balance: $${user?.balance || 0}
- Role: ${user?.role || "student"}

Recent Transactions:
${transactionsSummary || "No transaction history yet. Encourage them to make transactions (like buying coffee at the campus café, buying textbooks, or paying laundry)."}

Provide your response strictly in JSON format. The response MUST be a single valid JSON object matching this structure (do not include markdown block ticks like \`\`\`json or anything else, just return raw JSON):
{
  "summary": "A 2-3 sentence overview of their financial health, encouraging and practical.",
  "tips": [
    {
      "title": "Tip title (e.g., 'Coffee Smart')",
      "tip": "Personalized advice based on their transactions (e.g., 'You spent $35 on coffee this week. Try the student union discount card...').",
      "category": "Food",
      "impact": "high"
    },
    {
      "title": "Textbook Savings",
      "tip": "Look for campus library rentals or digital options before purchasing new books.",
      "category": "Education",
      "impact": "medium"
    },
    {
      "title": "Commute Smart",
      "tip": "Use the campus shuttle or carpool to reduce travel expenses on weekends.",
      "category": "Transport",
      "impact": "low"
    }
  ],
  "challenge": {
    "title": "The $5 Coffee-Free Friday",
    "description": "Skip buying custom drinks this Friday and make coffee at your dorm. Put the $5 saved into your wallet!"
  }
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch (e) {
        console.error("Gemini failed to output valid JSON, content was:", text);
        // Fallback in case Gemini sends bad format or is wrapped in markdown
        // Try cleaning markdown wrapping if any
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.substring(7);
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.substring(3);
        }
        if (cleanedText.endsWith("```")) {
          cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();
        try {
          const json = JSON.parse(cleanedText);
          return res.json(json);
        } catch (e2) {
          return res.json({
            summary: "We're analyzing your transactions. Make sure to keep tracking your spending to get more granular insights!",
            tips: [
              {
                "title": "Track Your Budget",
                "tip": "Try setting aside a weekly allowance for dining and textbooks.",
                "category": "General",
                "impact": "high"
              },
              {
                "title": "Explore Campus Discounts",
                "tip": "Many local student stores and cafés offer 10% off with your Campus Wallet ID.",
                "category": "Food",
                "impact": "medium"
              }
            ],
            challenge: {
              "title": "Weekly Savings Challenge",
              "description": "Try to spend 10% less on non-essential campus items this week."
            }
          });
        }
      }

    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "An error occurred while generating spending tips." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
