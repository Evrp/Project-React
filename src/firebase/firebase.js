// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";  // นำเข้า Authentication
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // เริ่มต้นการใช้งาน Firebase Authentication
const provider = new GoogleAuthProvider(); // ใช้ GoogleAuthProvider สำหรับการลงชื่อเข้าใช้งานผ่าน Google
const db = getFirestore(app);
const storage = getStorage(app);

// ใช้ analytics หากต้องการ
const analytics = getAnalytics(app);

export { auth, provider, signInWithPopup, db, storage, analytics };  // ส่งออกสิ่งที่ใช้จาก Firebase
