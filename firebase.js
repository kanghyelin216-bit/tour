// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgNfGmgeG7g8f4Nw9nrIpM9SOEJ4ADFqY",
  authDomain: "my-project-db2ca.firebaseapp.com",
  databaseURL: "https://my-project-db2ca-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-project-db2ca",
  storageBucket: "my-project-db2ca.firebasestorage.app",
  messagingSenderId: "52424245859",
  appId: "1:52424245859:web:6f2e3b648de0eade71ae56"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
