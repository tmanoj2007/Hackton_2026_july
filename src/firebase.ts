import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import firebaseConfigJson from "../firebase-applet-config.json";

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyAl_NsImbafh8DeeEDEx_GqtRanMwG6iNA",
  authDomain: firebaseConfigJson.authDomain || "divine-transport-7n50x.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "divine-transport-7n50x",
  storageBucket: firebaseConfigJson.storageBucket || "divine-transport-7n50x.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "898763850305",
  appId: firebaseConfigJson.appId || "1:898763850305:web:551f7e11f6349ac077fcc0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use getFirestore and specify the custom database ID from the provisioned configurations
const db = getFirestore(
  app, 
  firebaseConfigJson.firestoreDatabaseId || "ai-studio-campuswallet-75108920-5b4f-4852-816e-49d7e9e9bf7c"
);

export { app, auth, db };
