"use client";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtfWjj1ThZ9NowsN0-9foY9im72J87KFs",
  authDomain: "yamu-marble.firebaseapp.com",
  projectId: "yamu-marble",
  storageBucket: "yamu-marble.firebasestorage.app",
  messagingSenderId: "588146338885",
  appId: "1:588146338885:web:93489f41f7d1c8e669472c",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);