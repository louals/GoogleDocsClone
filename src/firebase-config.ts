// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB76YR4CYIPadNbExgxrTIoufXuJcZ2r6s",
  authDomain: "docs-clone-8d2ce.firebaseapp.com",
  projectId: "docs-clone-8d2ce",
  storageBucket: "docs-clone-8d2ce.firebasestorage.app",
  messagingSenderId: "280421390778",
  appId: "1:280421390778:web:14235d605116bf02c8a583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
