import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import DashboardScreen from './components/DashboardScreen';
import WalletScreen from './components/WalletScreen';
import PaymentScreen from './components/PaymentScreen';
import HistoryScreen from './components/HistoryScreen';
import TipsScreen from './components/TipsScreen';
import ParentPortalScreen from './components/ParentPortalScreen';
import AdminScreen from './components/AdminScreen';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (tab: any) => {
    setActiveTab(String(tab));
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">CW</div>
              <div>
                <h1 className="font-bold text-slate-900 leading-none">Campus Wallet</h1>
                <span className="text-xs text-slate-500">STUDENT PASS</span>
              </div>
            </div>

            <nav className="flex space-x-1 overflow-x-auto py-2">
              {['dashboard', 'wallet', 'payment', 'history', 'tips', 'parent', 'admin'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap capitalize transition-colors ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'payment' ? 'Pay Canteen' : tab === 'tips' ? 'AI Tips' : tab === 'parent' ? 'Parent Portal' : tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

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
    </div>
  );
}
