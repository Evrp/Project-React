// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAs8G6rJQL1WWy0rkDcXCHCxYlzsjaGMx8",
    authDomain: "projectest-2c4fe.firebaseapp.com",
    projectId: "projectest-2c4fe",
    storageBucket: "projectest-2c4fe.firebasestorage.app",
    messagingSenderId: "376509206304",
    appId: "1:376509206304:web:48ad228cf0e790f4d65145",
    measurementId: "G-W0561PN4XE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
