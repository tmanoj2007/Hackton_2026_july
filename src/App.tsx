import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Make sure your firebase config file path matches

export function App() {
  const [photo, setPhoto] = useState<string>('');
  const [balance, setBalance] = useState<number>(500);

  // Handle uploading and converting profile picture
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPhoto(base64String); // Set image instantly on screen

        // Optional: Update in Firestore if logged in
        // const userRef = doc(db, 'users', 'YOUR_USER_ID');
        // await updateDoc(userRef, { photoURL: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        {/* Left Side: Custom App Brand Name */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            💳
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-blue-900">
              Campus Wallet
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Student Pass
            </p>
          </div>
        </div>

        {/* Right Side: Profile Picture Avatar with Image Upload */}
        <div className="flex items-center gap-4">
          <label 
            htmlFor="profile-upload" 
            className="cursor-pointer relative group"
            title="Click to change profile picture"
          >
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-600 shadow-sm group-hover:opacity-80 transition"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-2 border-blue-200 shadow-sm group-hover:bg-blue-700 transition">
                P
              </div>
            )}
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Banner */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md">
          <span className="bg-blue-500/50 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Active Student Card
          </span>
          <h2 className="text-2xl font-bold mt-2">Welcome back, Student!</h2>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Available Balance</p>
            <h3 className="text-4xl font-extrabold text-slate-900 mt-1">₹{balance}</h3>
          </div>
          <button 
            onClick={() => setBalance(prev => Math.max(0, prev - 50))}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
          >
            Pay Canteen ₹50
          </button>
        </div>
      </main>
    </div>
  );
}

// CRITICAL FIX FOR GITHUB BUILD: Default export required for main.tsx
export default App;
