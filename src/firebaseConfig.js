// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9j9Qbv0pgSASzzuzpWuSJ43t8eoZLVs8",
  authDomain: "mayedo-e797e.firebaseapp.com",
  projectId: "mayedo-e797e",
  storageBucket: "mayedo-e797e.appspot.com",
  messagingSenderId: "926065716171",
  appId: "1:926065716171:web:d28d31210f0adf977f244e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)


export {auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut}