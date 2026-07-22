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
    const { transactions, user } = req.body || {};
    try {
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
      console.log("Notice: Gemini API call for spending tips rate-limited or unavailable. Serving rule-based financial insights.");
      const categoryTotals: Record<string, number> = {};
      (transactions || []).forEach((t: any) => {
        const cat = t.category || "General";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (t.amount || 0);
      });
      const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "Food";

      return res.json({
        summary: `Based on your recent campus wallet activity, your highest spending category is ${topCat}. Managing small daily expenses can save up to 20% of your monthly allowance!`,
        tips: [
          {
            title: `${topCat} Saver Strategy`,
            tip: `You have active transactions in ${topCat}. Check out student discount passes and off-peak bundles at campus outlets.`,
            category: topCat,
            impact: "high"
          },
          {
            title: "Campus Library & Printing",
            tip: "Utilize free monthly printing quotas at the university library before using paid campus printers.",
            category: "Education",
            impact: "medium"
          },
          {
            title: "Coffee & Beverage Card",
            tip: "Use your Campus Wallet at the Student Union café to earn 10% instant cashback on every beverage.",
            category: "Food",
            impact: "low"
          }
        ],
        challenge: {
          title: "The $5 Campus Saver Challenge",
          description: "Skip one extra coffee or impulse purchase at campus outlets this Friday and save ₹400 in your wallet!"
        }
      });
    }
  });

  // API Route for Single Payment Gemini Tip
  app.post("/api/generate-payment-tip", async (req, res) => {
    try {
      const { merchantName, amount, category, userBalance } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          tip: `Smart purchase at ${merchantName}! You paid ₹${amount}. Keep an eye on your remaining ₹${userBalance} balance.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are Campus Wallet AI, a financial advisor for college students.
A student just made a QR code payment of ₹${amount} at "${merchantName}" (Category: ${category || "General"}).
Their remaining wallet balance is ₹${userBalance}.

Generate ONE concise, friendly, and actionable financial tip or encouragement specifically regarding this purchase and their remaining budget.
Keep it strictly under 25 words. Do not use quotation marks.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      const tipText = response.text?.trim() || `Great payment at ${merchantName}! Remember to check for campus student discounts.`;
      return res.json({ tip: tipText });
    } catch (err) {
      console.log("Notice: Gemini API single payment tip rate-limited or unavailable. Serving fallback tip.");
      return res.json({
        tip: `Payment processed! Manage your daily budget to keep your campus wallet healthy.`
      });
    }
  });

  // API Route for Full AI Spending Insights (Categorized Breakdown, Saving Tip, Budget Suggestion)
  app.post("/api/ai-spending-insights", async (req, res) => {
    const { transactions, user } = req.body || {};
    const categoriesMap: { Food: number; Library: number; Stationery: number; Events: number; Others: number } = {
      Food: 0,
      Library: 0,
      Stationery: 0,
      Events: 0,
      Others: 0
    };

    const userSpends = (transactions || []).filter((t: any) => 
      (t.senderId === user?.uid || t.userId === user?.uid) && t.type !== "add_money"
    );

    userSpends.forEach((tx: any) => {
      const cat = (tx.category || "").toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      const name = (tx.receiverName || "").toLowerCase();

      if (cat.includes("food") || cat.includes("dining") || desc.includes("coffee") || desc.includes("cafe") || desc.includes("lunch") || name.includes("cafe")) {
        categoriesMap.Food += (tx.amount || 0);
      } else if (cat.includes("library") || cat.includes("book") || desc.includes("book") || desc.includes("library") || name.includes("library") || name.includes("book")) {
        categoriesMap.Library += (tx.amount || 0);
      } else if (cat.includes("stationery") || desc.includes("pen") || desc.includes("print") || desc.includes("paper") || name.includes("stationery")) {
        categoriesMap.Stationery += (tx.amount || 0);
      } else if (cat.includes("event") || cat.includes("ticket") || desc.includes("fest") || desc.includes("concert") || desc.includes("event")) {
        categoriesMap.Events += (tx.amount || 0);
      } else {
        categoriesMap.Others += (tx.amount || 0);
      }
    });

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (userSpends.length === 0) {
        return res.json({
          empty: true,
          message: "Start using Campus Wallet to receive AI insights.",
          categories: categoriesMap,
          savingTip: null,
          budgetSuggestion: null
        });
      }

      if (!apiKey) {
        const sortedCats = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCats[0][0];
        const totalSpent = userSpends.reduce((a: number, c: any) => a + c.amount, 0);

        return res.json({
          categories: categoriesMap,
          savingTip: `You spent the most on ${topCategory} (₹${categoriesMap[topCategory as keyof typeof categoriesMap]}). Look out for student campus discounts or bundles.`,
          budgetSuggestion: `Set a weekly spending target of ₹${Math.max(500, Math.round(totalSpent * 0.85))} to maintain a healthy wallet reserve.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const spendingSummary = Object.entries(categoriesMap)
        .map(([cat, amt]) => `- ${cat}: ₹${amt}`)
        .join("\n");

      const prompt = `
You are Campus Wallet AI, an intelligent financial advisor for college students.
Analyze this student's spending breakdown across 5 strict categories:
${spendingSummary}

Total transactions recorded: ${userSpends.length}.

Generate TWO things in valid JSON format:
1. "savingTip": One personalized, actionable, friendly money-saving tip (under 30 words) based on their actual spending in these categories.
2. "budgetSuggestion": One practical weekly budget suggestion (under 25 words) with a concrete recommended target.

Return raw JSON only, matching this exact structure:
{
  "savingTip": "...",
  "budgetSuggestion": "..."
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
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (e) {
        let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        json = JSON.parse(cleaned);
      }

      return res.json({
        categories: categoriesMap,
        savingTip: json.savingTip || "Try setting aside 10% of your wallet funds for textbook and stationery emergencies.",
        budgetSuggestion: json.budgetSuggestion || `Cap weekly dining spend to ₹${Math.max(300, Math.round((categoriesMap.Food || 500) * 0.8))} to build a healthy savings reserve.`
      });

    } catch (error: any) {
      console.log("Notice: Gemini API spending insights rate-limited or unavailable. Serving calculated fallback insights.");
      const sortedCats = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
      const topCategory = sortedCats[0]?.[0] || "Food";
      const topAmount = sortedCats[0]?.[1] || 0;
      const totalSpent = userSpends.reduce((a: number, c: any) => a + c.amount, 0);

      return res.json({
        categories: categoriesMap,
        savingTip: topAmount > 0 
          ? `Your highest expenditure is on ${topCategory} (₹${topAmount.toLocaleString("en-IN")}). Consider using campus student discount passes.`
          : "Track your daily dining and stationery purchases to optimize your monthly allowance.",
        budgetSuggestion: `Cap weekly discretionary spend to ₹${Math.max(400, Math.round(totalSpent * 0.85 || 500))} to keep a healthy wallet reserve.`
      });
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
