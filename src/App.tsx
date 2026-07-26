import React, { useState } from 'react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [balance, setBalance] = useState(500);

  const handlePay = () => {
    if (balance >= 50) {
      setBalance(balance - 50);
      alert('Payment of ₹50 successful!');
    } else {
      alert('Insufficient balance!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
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
              {['dashboard', 'wallet', 'payment', 'history', 'tips'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap capitalize transition-colors ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'payment' ? 'Pay Canteen' : tab === 'tips' ? 'AI Tips' : tab}
                </button>
              ))}
            </nav>
            <div className="font-semibold text-sm bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
              Purnima
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-medium">ACTIVE STUDENT CARD</span>
              <h2 className="text-2xl font-bold mt-3">Welcome back, Purnima!</h2>
              <p className="text-blue-100 text-sm mt-1">Manage your campus expenses and quick payments seamlessly.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-sm text-slate-500 font-medium">Available Balance</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{balance}</div>
              </div>
              <button 
                onClick={handlePay}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow transition-all cursor-pointer"
              >
                Pay Canteen ₹50
              </button>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Wallet Top-up & Management</h2>
            <p className="text-slate-600 text-sm">Add funds instantly using UPI or NetBanking.</p>
            <button 
              onClick={() => setBalance(balance + 100)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow transition-all"
            >
              + Quick Add ₹100
            </button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">Scan & Pay Canteen</h2>
            <div className="bg-slate-100 h-48 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 font-medium">
              [ QR Scanner Simulation ]
            </div>
            <button 
              onClick={handlePay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium shadow"
            >
              Confirm Payment (₹50)
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
            <div className="divide-y divide-slate-100">
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">Canteen Purchase</p>
                  <p className="text-xs text-slate-500">Today, 12:30 PM</p>
                </div>
                <span className="text-red-600 font-bold">-₹50</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">Wallet Topup</p>
                  <p className="text-xs text-slate-500">Yesterday, 10:00 AM</p>
                </div>
                <span className="text-emerald-600 font-bold">+₹500</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-slate-900">AI Budget Tips</h2>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-900 text-sm">
              💡 <strong>Smart Saving:</strong> You spent 20% less on stationery this week. Great job keeping your monthly budget on track!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
