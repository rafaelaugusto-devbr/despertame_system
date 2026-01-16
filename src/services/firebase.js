import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyA8nykV5bBkk2SflhOjnt3IbqVHKO-qTcE",
  authDomain: "despertame-8b932.firebaseapp.com",
  projectId: "despertame-8b932",
  storageBucket: "despertame-8b932.firebasestorage.app",
  messagingSenderId: "436618938431",
  appId: "1:436618938431:web:7635e3bd59182c82dc108a",
  measurementId: "G-TH8XGQ1JMP"
};

// Inicializa os serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inicializa as Cloud Functions especificando a região correta
const functions = getFunctions(app, "us-central1");

// Exporta as instâncias para serem usadas em outras partes do app
export { app, auth, db, functions };

