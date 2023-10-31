import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMHN1tFsmiNFxlm08ikpVcnlCqbDqGlbs",
  authDomain: "fullstackassignment-50697.firebaseapp.com",
  projectId: "fullstackassignment-50697",
  storageBucket: "fullstackassignment-50697.appspot.com",
  messagingSenderId: "42987883893",
  appId: "1:42987883893:web:7c42225ac87c71b4f5173c",
  measurementId: "G-GPB4DWVNFM",
};

const app = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Initialize Firestore

export { auth, db };
