"use client";

// This file serves as a backup/alternative import location
// The main initialization happens in Provider.js for guaranteed loading

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWjIdiuzInlLOhCULHryvygMaWoL7wWNM",
  authDomain: "forevish-store.firebaseapp.com",
  projectId: "forevish-store",
  storageBucket: "forevish-store.firebasestorage.app",
  messagingSenderId: "775516129882",
  appId: "1:775516129882:web:83c26a77269832fa8c2663",
  measurementId: "G-YCMSFNB3YY",
};

// Prevent multiple Firebase app initialization
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

// Configure Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { app, db, auth, GoogleAuthProvider };
