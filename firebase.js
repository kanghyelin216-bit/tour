// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBiDslRDSwxH5OmzUze7a9ow-6xVIfEpHk",
  authDomain: "my-project-5431e.firebaseapp.com",
  projectId: "my-project-5431e",
  storageBucket: "my-project-5431e.firebasestorage.app",
  messagingSenderId: "806569000427",
  appId: "1:806569000427:web:61cf2ab540d6d468782dae"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
