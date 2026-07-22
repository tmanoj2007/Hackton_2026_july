import React, { useState } from "react";
import { CampusUser, UserRole } from "../types";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  X, 
  Wallet, 
  IdCard, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  RefreshCw,
  Phone,
  Store
} from "lucide-react";

interface UserProfileModalProps {
  user: CampusUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onLogout,
  onNavigate,
}: UserProfileModalProps) {
  const [updatingRole, setUpdatingRole] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const currentWallet = user.wallet !== undefined ? user.wallet : (user.balance !== undefined ? user.balance : 1000);

  // Quick switch role for testing RBAC dynamically
  const handleRoleSwitch = async (newRole: UserRole) => {
    if (newRole === user.role) return;
    setUpdatingRole(true);
    setSuccessMsg("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { role: newRole });
      setSuccessMsg(`Account role successfully updated to ${newRole.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "parent":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "merchant":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "student":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white text-blue-800 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/20 shrink-0">
              {(user.displayName || user.name || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-lg truncate text-white leading-tight">
                {user.displayName || user.name}
              </h3>
              <p className="text-xs text-blue-100 truncate font-mono mt-0.5">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs ${getRoleBadgeStyle(user.role)}`}>
                  <ShieldCheck className="h-3 w-3" />
                  {user.role} Role
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* User Details Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              User Profile Information
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Full Name:
                </span>
                <span className="font-bold text-slate-900">{user.displayName || user.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address:
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{user.email}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Assigned Role:
                </span>
                <span className="font-bold text-slate-900 capitalize">{user.role}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-slate-400" /> Wallet Balance:
                </span>
                <span className="font-black text-emerald-600">₹{currentWallet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              {user.studentId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5 text-slate-400" /> Student Card No:
                  </span>
                  <span className="font-mono font-bold text-blue-700">{user.studentId}</span>
                </div>
              )}

              {user.merchantName && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-slate-400" /> Merchant Outlet:
                  </span>
                  <span className="font-bold text-slate-900">{user.merchantName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Role Switcher for Testing Security */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Role Management (RBAC Test)
              </span>
              {updatingRole && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["student", "parent", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  disabled={updatingRole}
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                    user.role === r
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Switching roles updates Firestore document <code className="text-slate-600 font-mono">users/{user.uid}</code> and dynamically recalculates route authorization.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                if (user.role === "admin") onNavigate("admin");
                else if (user.role === "parent") onNavigate("parent-portal");
                else onNavigate("dashboard");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              My Dashboard
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
