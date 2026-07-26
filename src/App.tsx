import React, { useState } from 'react';
import DashboardScreen from './DashboardScreen';
import HistoryScreen from './HistoryScreen';
import TipsScreen from './TipsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'tips'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Campus Wallet</h1>
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-3 py-1 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-3 py-1 rounded ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('tips')} 
            className={`px-3 py-1 rounded ${activeTab === 'tips' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Tips
          </button>
        </nav>
      </header>

      {/* Main Content View */}
      <main className="p-4 max-w-4xl mx-auto">
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'tips' && <TipsScreen />}
      </main>
    </div>
  );
}
