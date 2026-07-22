var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/spending-tips", async (req, res) => {
    try {
      const { transactions, user } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is required on the server."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const transactionsSummary = (transactions || []).map(
        (t) => `- $${t.amount} spent on ${t.category} (${t.description}) on ${new Date(t.timestamp).toLocaleDateString()}`
      ).join("\n");
      const prompt = `
You are Campus Wallet AI, a friendly financial advisor for college students.
Analyze the following student's profile and transaction history to provide personalized, engaging, and highly actionable spending tips, category breakdowns, and saving challenges.

Student Profile:
- Name: ${user?.displayName || "Student"}
- Balance: $${user?.balance || 0}
- Role: ${user?.role || "student"}

Recent Transactions:
${transactionsSummary || "No transaction history yet. Encourage them to make transactions (like buying coffee at the campus caf\xE9, buying textbooks, or paying laundry)."}

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
                "tip": "Many local student stores and caf\xE9s offer 10% off with your Campus Wallet ID.",
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
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "An error occurred while generating spending tips." });
    }
  });
  app.post("/api/generate-payment-tip", async (req, res) => {
    try {
      const { merchantName, amount, category, userBalance } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          tip: `Smart purchase at ${merchantName}! You paid \u20B9${amount}. Keep an eye on your remaining \u20B9${userBalance} balance.`
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const prompt = `
You are Campus Wallet AI, a financial advisor for college students.
A student just made a QR code payment of \u20B9${amount} at "${merchantName}" (Category: ${category || "General"}).
Their remaining wallet balance is \u20B9${userBalance}.

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
      console.error("Error generating single payment tip:", err);
      return res.json({
        tip: `Payment processed! Manage your daily budget to keep your campus wallet healthy.`
      });
    }
  });
  app.post("/api/ai-spending-insights", async (req, res) => {
    try {
      const { transactions, user } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const categoriesMap = {
        Food: 0,
        Library: 0,
        Stationery: 0,
        Events: 0,
        Others: 0
      };
      const userSpends = (transactions || []).filter(
        (t) => (t.senderId === user?.uid || t.userId === user?.uid) && t.type !== "add_money"
      );
      userSpends.forEach((tx) => {
        const cat = (tx.category || "").toLowerCase();
        const desc = (tx.description || "").toLowerCase();
        const name = (tx.receiverName || "").toLowerCase();
        if (cat.includes("food") || cat.includes("dining") || desc.includes("coffee") || desc.includes("cafe") || desc.includes("lunch") || name.includes("cafe")) {
          categoriesMap.Food += tx.amount;
        } else if (cat.includes("library") || cat.includes("book") || desc.includes("book") || desc.includes("library") || name.includes("library") || name.includes("book")) {
          categoriesMap.Library += tx.amount;
        } else if (cat.includes("stationery") || desc.includes("pen") || desc.includes("print") || desc.includes("paper") || name.includes("stationery")) {
          categoriesMap.Stationery += tx.amount;
        } else if (cat.includes("event") || cat.includes("ticket") || desc.includes("fest") || desc.includes("concert") || desc.includes("event")) {
          categoriesMap.Events += tx.amount;
        } else {
          categoriesMap.Others += tx.amount;
        }
      });
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
        const totalSpent = userSpends.reduce((a, c) => a + c.amount, 0);
        return res.json({
          categories: categoriesMap,
          savingTip: `You spent the most on ${topCategory} (\u20B9${categoriesMap[topCategory]}). Look out for student campus discounts or bundles.`,
          budgetSuggestion: `Set a weekly spending target of \u20B9${Math.max(500, Math.round(totalSpent * 0.85))} to maintain a healthy wallet reserve.`
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const spendingSummary = Object.entries(categoriesMap).map(([cat, amt]) => `- ${cat}: \u20B9${amt}`).join("\n");
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
      let json = {};
      try {
        json = JSON.parse(text);
      } catch (e) {
        let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        json = JSON.parse(cleaned);
      }
      return res.json({
        categories: categoriesMap,
        savingTip: json.savingTip || "Try setting aside 10% of your wallet funds for textbook and stationery emergencies.",
        budgetSuggestion: json.budgetSuggestion || `Cap weekly dining spend to \u20B9${Math.max(300, Math.round((categoriesMap.Food || 500) * 0.8))} to build a healthy savings reserve.`
      });
    } catch (error) {
      console.error("AI Spending Insights error:", error);
      return res.status(500).json({
        error: "Failed to generate AI insights.",
        fallbackTip: "Keep tracking your transactions to receive personalized AI financial advice."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
