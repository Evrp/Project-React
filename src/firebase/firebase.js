// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";  // นำเข้า Authentication
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs8G6rJQL1WWy0rkDcXCHCxYlzsjaGMx8",
  authDomain: "projectest-2c4fe.firebaseapp.com",
  projectId: "projectest-2c4fe",
  storageBucket: "projectest-2c4fe.firebasestorage.app",
  messagingSenderId: "376509206304",
  appId: "1:376509206304:web:48ad228cf0e790f4d65145",
  measurementId: "G-W0561PN4XE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // เริ่มต้นการใช้งาน Firebase Authentication
const provider = new GoogleAuthProvider(); // ใช้ GoogleAuthProvider สำหรับการลงชื่อเข้าใช้งานผ่าน Google
const db = getFirestore(app);

// ใช้ analytics หากต้องการ
const analytics = getAnalytics(app);

export { auth, provider, signInWithPopup, db };  // ส่งออกสิ่งที่ใช้จาก Firebase
