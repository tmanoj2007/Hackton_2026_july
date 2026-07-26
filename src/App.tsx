import React, { useState } from 'react';

export default function App() {
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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>CW</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Campus Wallet</h1>
            <span style={{ fontSize: '11px', color: '#64748b' }}>STUDENT PASS</span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px' }}>
          {['dashboard', 'wallet', 'payment', 'history', 'tips'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                textTransform: 'capitalize',
                backgroundColor: activeTab === tab ? '#2563eb' : '#f1f5f9',
                color: activeTab === tab ? '#ffffff' : '#475569'
              }}
            >
              {tab === 'payment' ? 'Pay Canteen' : tab === 'tips' ? 'AI Tips' : tab}
            </button>
          ))}
        </nav>
        <div style={{ fontWeight: 600, fontSize: '14px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
          Purnima
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>ACTIVE STUDENT CARD</span>
              <h2 style={{ margin: '12px 0 4px 0', fontSize: '24px' }}>Welcome back, Purnima!</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#e0e7ff' }}>Manage your campus expenses and quick payments seamlessly.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Available Balance</span>
                <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '4px' }}>₹{balance}</div>
              </div>
              <button 
                onClick={handlePay}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                Pay Canteen ₹50
              </button>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 8px 0' }}>Wallet Top-up & Management</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Add funds instantly using UPI or NetBanking.</p>
            <button 
              onClick={() => setBalance(balance + 100)}
              style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Quick Add ₹100
            </button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Scan & Pay Canteen</h2>
            <div style={{ backgroundColor: '#f1f5f9', height: '180px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', color: '#94a3b8', marginBottom: '16px' }}>
              [ QR Scanner Simulation ]
            </div>
            <button 
              onClick={handlePay}
              style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Confirm Payment (₹50)
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Transaction History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Canteen Purchase</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Today, 12:30 PM</p>
                </div>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>-₹50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Wallet Topup</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Yesterday, 10:00 AM</p>
                </div>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>+₹500</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 12px 0' }}>AI Budget Tips</h2>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px', color: '#1e40af', fontSize: '14px' }}>
              💡 <strong>Smart Saving:</strong> You spent 20% less on stationery this week. Great job keeping your monthly budget on track!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
