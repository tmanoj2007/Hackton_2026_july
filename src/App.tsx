import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust this import path based on your setup

export function UserAvatar({ userId, currentPhotoUrl }: { userId: string, currentPhotoUrl?: string }) {
  const [photo, setPhoto] = useState<string>(currentPhotoUrl || '');

  // Function to handle image upload and convert to Base64 string
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPhoto(base64String); // Instantly update UI

        // Save to Firestore if user ID exists
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, { photoURL: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group flex items-center cursor-pointer">
      <label htmlFor="profile-upload" className="cursor-pointer flex items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm hover:opacity-80 transition"
          />
        ) : (
          /* Default initial badge if no image selected yet */
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-2 border-white shadow-sm hover:bg-blue-700">
            P
          </div>
        )}
      </label>

      {/* Hidden file input that opens image picker on click */}
      <input
        id="profile-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}
