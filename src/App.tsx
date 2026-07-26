import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

import DashboardScreen from './components/DashboardScreen';
import WalletScreen from './components/WalletScreen';
import PaymentScreen from './components/PaymentScreen';
import HistoryScreen from './components/HistoryScreen';
import TipsScreen from './components/TipsScreen';
import ParentPortalScreen from './components/ParentPortalScreen';
import AdminScreen from './components/AdminScreen';
import LoginScreen from './components/LoginScreen';
import UserProfileModal from './components/UserProfileModal';
import NotificationCenter from './components/NotificationCenter';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'payment' | 'history' | 'tips' | 'parent' | 'admin'>('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as any);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">CW</div>
              <div>
                <h1 className="font-bold text-slate-900 leading-none">Campus Wallet</h1>
                <span className="text-xs text-slate-500">STUDENT PASS</span>
              </div>
            </div>

            {/* Navigation Bar */}
            <nav className="flex space-x-1 overflow-x-auto py-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'wallet' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'payment' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pay Canteen
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'tips' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                AI Tips
              </button>
              <button
                onClick={() => setActiveTab('parent')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'parent' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Parent Portal
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Admin
              </button>
            </nav>

            {/* Profile & Notifications */}
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <button
                onClick={() => setShowProfile(true)}
                className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center hover:bg-blue-200 transition-colors"
                title="User Profile"
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && <DashboardScreen onNavigate={handleNavigate} />}
        {activeTab === 'wallet' && <WalletScreen onNavigate={handleNavigate} />}
        {activeTab === 'payment' && (
          <PaymentScreen 
            onSuccess={() => handleNavigate('history')} 
            onCancel={() => handleNavigate('dashboard')} 
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'tips' && <TipsScreen />}
        {activeTab === 'parent' && <ParentPortalScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <UserProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  );
}
