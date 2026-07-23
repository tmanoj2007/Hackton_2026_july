import React, { useState, useEffect } from "react";
import { CampusUser, Transaction } from "../types";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, 
  Search, 
  Coffee, 
  BookOpen, 
  Waves, 
  ArrowUpRight, 
  ShoppingBag, 
  Clapperboard, 
  History, 
  FileSpreadsheet 
} from "lucide-react";

interface HistoryScreenProps {
  user: CampusUser;
  onNavigate: (page: string) => void;
}

export default function HistoryScreen({ user, onNavigate }: HistoryScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "debit" | "credit">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const txRef = collection(db, "transactions");
    
    // Removed orderBy from Firestore queries to prevent Index errors
    const qSender = query(txRef, where("senderId", "==", user.uid));
    const qReceiver = query(txRef, where("receiverId", "==", user.uid));
    const qUser = query(txRef, where("userId", "==", user.uid));

    const unsubSender = onSnapshot(qSender, (sSnapshot) => {
      const sTxs = sSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
      
      const unsubReceiver = onSnapshot(qReceiver, (rSnapshot) => {
        const rTxs = rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
        
        const unsubUser = onSnapshot(qUser, (uSnapshot) => {
          const uTxs = uSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
          
          const merged = [...sTxs, ...rTxs, ...uTxs]
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          setTransactions(merged);
          setLoading(false);
        });
        return () => unsubUser();
      });
      return () => unsubReceiver();
    });

    return () => {
      unsubSender();
    };
  }, [user.uid]);

  useEffect(() => {
    let result = [...transactions];
    if (typeFilter === "debit") {
      result = result.filter(tx => tx.senderId === user.uid);
    } else if (typeFilter === "credit") {
      result = result.filter(tx => tx.receiverId === user.uid);
    }
    if (categoryFilter !== "all") {
      result = result.filter(tx => (tx.category || "").toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.description || "").toLowerCase().includes(term) ||
        (tx.senderName || "").toLowerCase().includes(term) ||
        (tx.receiverName || "").toLowerCase().includes(term) ||
        (tx.category || "").toLowerCase().includes(term)
      );
    }
    setFilteredTransactions(result);
  }, [transactions, searchTerm, typeFilter, categoryFilter, user.uid]);

  const getCategoryIcon = (category?: string) => {
    if (!category) return <ShoppingBag className="h-4 w-4 text-slate-500" />;
    switch (category.toLowerCase()) {
      case "food":
      case "dining":
        return <Coffee className="h-4 w-4 text-amber-500" />;
      case "books":
      case "education":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "entertainment":
        return <Clapperboard className="h-4 w-4 text-purple-500" />;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Account Statement</h2>
            <p className="text-xs text-slate-500 font-medium">Verify or search all wallet activities</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">
            Retrieving account records...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No matching activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Description</th>
                  <th className="py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isDebit = tx.senderId === user.uid;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-semibold text-slate-700 block">
                          {new Date(tx.timestamp || Date.now()).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-bold text-slate-800 block">
                          {tx.description}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`text-xs font-bold block ${isDebit ? "text-slate-800" : "text-emerald-600"}`}>
                          {isDebit ? "-" : "+"} ₹{tx.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
