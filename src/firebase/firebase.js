// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";  // นำเข้า Authentication
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // เริ่มต้นการใช้งาน Firebase Authentication
const provider = new GoogleAuthProvider(); // ใช้ GoogleAuthProvider สำหรับการลงชื่อเข้าใช้งานผ่าน Google
const db = getFirestore(app);
const storage = getStorage(app);

// ใช้ analytics เฉพาะใน production environment
let analytics = null;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
} else {
  analytics = null;
}

export { auth, provider, signInWithPopup, db, storage, analytics };  // ส่งออกสิ่งที่ใช้จาก Firebase
