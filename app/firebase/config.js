"use client";

// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWjIdiuzInlLOhCULHryvygMaWoL7wWNM",
  authDomain: "forevish-store.firebaseapp.com",
  projectId: "forevish-store",
  storageBucket: "forevish-store.firebasestorage.app",
  messagingSenderId: "775516129882",
  appId: "1:775516129882:web:83c26a77269832fa8c2663",
  measurementId: "G-YCMSFNB3YY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
