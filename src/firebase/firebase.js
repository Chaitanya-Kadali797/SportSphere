import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAKQQkz2uUpw4JswztZNs_Qi4DERkLFrn0",
  authDomain: "sportsphere-81746.firebaseapp.com",
  projectId: "sportsphere-81746",
  storageBucket: "sportsphere-81746.firebasestorage.app",
  messagingSenderId: "158914702341",
  appId: "1:158914702341:web:1a900a27164b6fe3de806c",
  measurementId: "G-B2ZKBLRDPJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
