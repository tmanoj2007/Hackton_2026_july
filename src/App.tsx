import React, { useState } from 'react';
import DashboardScreen from './components/DashboardScreen';
import HistoryScreen from './components/HistoryScreen';
import TipsScreen from './components/TipsScreen';
import WalletScreen from './components/WalletScreen';
import PaymentScreen from './components/PaymentScreen';
import ParentPortalScreen from './components/ParentPortalScreen';
import AdminScreen from './components/AdminScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'payment' | 'history' | 'tips' | 'parent' | 'admin'>('dashboard');

  // Callback expected by DashboardScreen / PaymentScreen
  const handleNavigate = (screen: string) => {
    setActiveTab(screen as any);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">CW</div>
              <div>
                <h1 className="font-bold text-slate-900 leading-none">Campus Wallet</h1>
                <span className="text-xs text-slate-500">STUDENT PASS</span>
              </div>
            </div>

            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
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
          </div>
        </div>
      </header>

      {/* Screen Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardScreen onNavigate={handleNavigate} />}
        {activeTab === 'wallet' && <WalletScreen onNavigate={handleNavigate} />}
        {activeTab === 'payment' && <PaymentScreen onSuccess={() => handleNavigate('history')} onCancel={() => handleNavigate('dashboard')} />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'tips' && <TipsScreen />}
        {activeTab === 'parent' && <ParentPortalScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </main>
    </div>
  );
}
