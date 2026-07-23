import React, { useState, useEffect, useMemo } from "react";
import { CampusUser, Transaction } from "../types";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  QrCode, 
  History, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Activity, 
  Coffee, 
  BookOpen, 
  Waves, 
  Sparkles, 
  ShoppingBag, 
  RefreshCw, 
  Target, 
  Ticket, 
  PenTool, 
  Utensils, 
  Loader2, 
  PieChart as PieChartIcon, 
  Plus, 
  ChevronRight 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from "recharts";
import { motion } from "motion/react";

interface DashboardScreenProps {
  user: CampusUser;
  onNavigate: (page: string) => void;
}

interface AiInsightsData {
  empty?: boolean;
  message?: string;
  categories: { Food: number; Library: number; Stationery: number; Events: number; Others: number };
  savingTip: string | null;
  budgetSuggestion: string | null;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Food: "#f59e0b",
  Library: "#3b82f6",
  Stationery: "#06b6d4",
  Events: "#a855f7",
  Others: "#10b981",
};

export default function DashboardScreen({ user, onNavigate }: DashboardScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<{ [cat: string]: number }>({});

  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiInsights = async (allUserTransactions: Transaction[]) => {
    const userSpends = allUserTransactions.filter(
      t => (t.senderId === user.uid || t.userId === user.uid) && t.type !== "add_money"
    );
    if (userSpends.length === 0) {
      setAiInsights({
        empty: true,
        message: "Start using Campus Wallet to receive AI insights.",
        categories: { Food: 0, Library: 0, Stationery: 0, Events: 0, Others: 0 },
        savingTip: null,
        budgetSuggestion: null
      });
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai-spending-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: allUserTransactions, user })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      } else {
        const topCat = Object.keys(categoryStats)[0] || "Food";
        setAiInsights({
          categories: { Food: categoryStats.Food || 0, Library: categoryStats.Library || 0, Stationery: categoryStats.Stationery || 0, Events: categoryStats.Events || 0, Others: categoryStats.Others || 0 },
          savingTip: `Consider setting a daily spending budget for ${topCat} to optimize your campus allowance.`,
          budgetSuggestion: "Keep track of campus dining and book purchases to build your savings reserve."
        });
      }
    } catch (err) {
      const topCat = Object.keys(categoryStats)[0] || "Food";
      setAiInsights({
        categories: { Food: categoryStats.Food || 0, Library: categoryStats.Library || 0, Stationery: categoryStats.Stationery || 0, Events: categoryStats.Events || 0, Others: categoryStats.Others || 0 },
        savingTip: `Consider setting a daily spending budget for ${topCat} to optimize your campus allowance.`,
        budgetSuggestion: "Keep track of campus dining and book purchases to build your savings reserve."
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let initialFetched = false;
    const txRef = collection(db, "transactions");

    const unsubSender = onSnapshot(query(txRef, where("senderId", "==", user.uid)), (snapshot) => {
      const senderTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);

      const unsubReceiver = onSnapshot(query(txRef, where("receiverId", "==", user.uid)), (snapshotRx) => {
        const receiverTxs = snapshotRx.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);

        const mergedAll = [...senderTxs, ...receiverTxs]
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        setTransactions(mergedAll);
        setLoading(false);

        const spends = mergedAll.filter(tx => (tx.senderId === user.uid || tx.userId === user.uid) && tx.type !== "add_money");
        const stats: { [cat: string]: number } = {};
        spends.forEach(s => {
          const cat = s.category || "Others";
          stats[cat] = (stats[cat] || 0) + s.amount;
        });
        setCategoryStats(stats);

        if (!initialFetched) {
          initialFetched = true;
          fetchAiInsights(mergedAll);
        }
      });
      return () => unsubReceiver();
    });

    return () => {
      unsubSender();
    };
  }, [user.uid]);

  const monthlySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions
      .filter((tx) => {
        const isDebit = tx.senderId === user.uid || tx.userId === user.uid;
        if (!isDebit || tx.type === "add_money") return false;
        const txDate = new Date(tx.timestamp || Date.now());
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, user.uid]);

  const chartData = useMemo(() => {
    const categories = ["Food", "Library", "Stationery", "Events", "Others"];
    const aggregated: { [key: string]: number } = {
      Food: aiInsights?.categories?.Food || categoryStats["Food"] || categoryStats["Dining"] || 0,
      Library: aiInsights?.categories?.Library || categoryStats["Library"] || categoryStats["Education"] || 0,
      Stationery: aiInsights?.categories?.Stationery || categoryStats["Stationery"] || categoryStats["Books"] || 0,
      Events: aiInsights?.categories?.Events || categoryStats["Events"] || categoryStats["Entertainment"] || 0,
      Others: aiInsights?.categories?.Others || categoryStats["Others"] || categoryStats["Amenities"] || 0,
    };
    const result = categories.map((cat) => ({
      name: cat,
      value: aggregated[cat] || 0,
      color: CATEGORY_COLORS[cat] || "#64748b",
    })).filter(item => item.value > 0);

    if (result.length === 0) {
      return [
        { name: "Food", value: 400, color: "#f59e0b" },
        { name: "Library", value: 250, color: "#3b82f6" },
        { name: "Stationery", value: 150, color: "#06b6d4" },
        { name: "Events", value: 300, color: "#a855f7" },
        { name: "Others", value: 100, color: "#10b981" },
      ];
    }
    return result;
  }, [aiInsights, categoryStats]);

  const totalChartSpending = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const getCategoryIcon = (category?: string) => {
    if (!category) return <ShoppingBag className="h-4 w-4 text-slate-500" />;
    switch (category.toLowerCase()) {
      case "food":
      case "dining":
        return <Utensils className="h-4 w-4 text-amber-500" />;
      case "library":
      case "books":
      case "education":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "stationery":
        return <PenTool className="h-4 w-4 text-cyan-500" />;
      case "events":
      case "entertainment":
        return <Ticket className="h-4 w-4 text-purple-500" />;
      case "laundry":
      case "amenities":
        return <Waves className="h-4 w-4 text-cyan-500" />;
      case "deposits":
      case "add_money":
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-slate-500" />;
    }
  };

  const walletBalance = user.wallet ?? user.balance ?? 1000;
  const currentMonthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 rounded-3xl shadow-md border border-blue-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-blue-100 border border-white/20">
              BlueRidge State Student Pass
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Activity className="h-3 w-3 animate-pulse text-emerald-400" /> Active Card
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.displayName || user.name}!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
            Student ID: <span className="font-mono font-bold text-white">{user.studentId || "BSU-84920"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => onNavigate("add-money")}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-white text-blue-900 font-extrabold text-xs rounded-xl shadow-sm hover:bg-blue-50 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="h-4 w-4 text-blue-700" /> Top-Up Wallet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-blue-800/80 flex flex-col justify-between h-52 relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-blue-400" /> Wallet Balance
              </span>
            </div>
            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight block">
                ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-blue-800/60">
            <button
              onClick={() => onNavigate("add-money")}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <CreditCard className="h-3.5 w-3.5" /> Add Money
            </button>
            <button
              onClick={() => onNavigate("qr-payment")}
              className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/15 flex items-center justify-center gap-1 active:scale-95"
            >
              <QrCode className="h-3.5 w-3.5 text-blue-300" /> Scan QR
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between h-52">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-rose-500" /> Total Monthly Spending
              </span>
            </div>
            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
                ₹{monthlySpending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between h-52">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="h-4 w-4 text-amber-500" /> Top Spend Category
              </span>
            </div>
            {Object.keys(categoryStats).length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                  {getCategoryIcon(Object.keys(categoryStats)[0])}
                </div>
                <div className="min-w-0">
                  <span className="text-base font-extrabold text-slate-900 block capitalize truncate">
                    {Object.keys(categoryStats)[0]}
                  </span>
                  <span className="text-xs font-bold text-amber-900 block">
                    ₹{categoryStats[Object.keys(categoryStats)[0]].toLocaleString("en-IN")} Spent
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-500">
                No recent category transactions logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Real-time ledger entries from your Campus Wallet</p>
          </div>
          <button
            onClick={() => onNavigate("history")}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            <span>View All Ledger</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Fetching Firestore records...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 space-y-2">
            <History className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 6).map((tx) => {
              const isDebit = tx.senderId === user.uid || tx.userId === user.uid;
              const formattedAmt = `${isDebit ? "-" : "+"} ₹${tx.amount.toLocaleString("en-IN")}`;
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                        {isDebit ? (tx.receiverName || "Campus Outlet") : (tx.senderName || "Wallet Deposit")}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                        {new Date(tx.timestamp || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-black block ${isDebit ? "text-slate-900" : "text-emerald-600"}`}>
                      {formattedAmt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
