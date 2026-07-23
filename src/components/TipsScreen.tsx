import React, { useState, useEffect } from "react";
import { CampusUser, Transaction, SpendingTip } from "../types";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  Lightbulb, 
  Coffee, 
  BookOpen, 
  Waves, 
  PiggyBank 
} from "lucide-react";

interface TipsScreenProps {
  user: CampusUser;
  onRefreshUser: (updatedUser: Partial<CampusUser>) => void;
  onNavigate: (page: string) => void;
}

interface AIResponse {
  summary: string;
  tips: SpendingTip[];
  challenge: {
    title: string;
    description: string;
  };
}

export default function TipsScreen({ user, onNavigate }: TipsScreenProps) {
  const [loading, setLoading] = useState(false);
  const [tipsData, setTipsData] = useState<AIResponse | null>(null);

  const fetchAITips = async () => {
    setLoading(true);
    try {
      const txRef = collection(db, "transactions");
      const q = query(txRef, where("senderId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);

      const response = await fetch("/api/spending-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, user })
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        setTipsData(data);
      } else {
        const totalSpent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

        setTipsData({
          summary: totalSpent > 0 
            ? `You have spent ₹${totalSpent.toLocaleString("en-IN")} total on campus. Managing daily small purchases can optimize your budget!` 
            : "Welcome to Campus Wallet! Start spending at campus outlets to view smart AI financial recommendations.",
          tips: [
            {
              title: "Library Café Rebate",
              tip: "Enjoy 10% instant student cashback on hot beverages when paying via Campus Wallet.",
              category: "Food",
              impact: "high"
            },
            {
              title: "Digital Textbook Rentals",
              tip: "Check the university library portal for free e-book rentals before purchasing physical textbooks.",
              category: "Education",
              impact: "medium"
            }
          ],
          challenge: {
            title: "Campus ₹100 Saver Challenge",
            description: "Skip one extra coffee or beverage this Friday and save ₹100 in your wallet!"
          }
        });
      }
    } catch (err: any) {
      console.warn("Tips fetch fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAITips();
  }, [user.uid]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Campus AI Insights</h2>
            <p className="text-xs text-slate-500 font-medium">Smart spending diagnostics for students</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 border border-slate-100 shadow-sm rounded-2xl text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Reviewing Campus Expenditure...</h3>
        </div>
      ) : (
        tipsData && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-6 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">AI Spending Assessment</span>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                "{tipsData.summary}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipsData.tips.map((item, idx) => (
                <div key={idx} className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
