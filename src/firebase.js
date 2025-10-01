import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Get this config from Firebase Console → Project Settings → Web App
const firebaseConfig = {
  apiKey: "AIzaSyDVguAnAagH-VRSwBaLx9YA01Q_hW2ISnM",
  authDomain: "e-book-store-b8a4c.firebaseapp.com",
  projectId: "e-book-store-b8a4c",
  storageBucket: "e-book-store-b8a4c.firebasestorage.app",
  messagingSenderId: "1077549117686",
  appId: "1:1077549117686:web:0ced8b8c33dfda76287cd7",
  measurementId: "G-DKQL39RFHR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
