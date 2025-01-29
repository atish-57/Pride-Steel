import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyAo1tTGRDuLkzciiGV3lgEHAxSSLRwJrlw",
  authDomain: "pridesteel-5f839.firebaseapp.com",
  projectId: "pridesteel-5f839",
  storageBucket: "pridesteel-5f839.firebasestorage.app",
  messagingSenderId: "136648932596",
  appId: "1:136648932596:web:007d6d4aba50aacf2ff2a1",
  measurementId: "G-EQ23ZCPGEQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
