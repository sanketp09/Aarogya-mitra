// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyABNOfv7AWwbznymn9XZx2AKz5QDIlnKy4",
  authDomain: "codemonks-18faa.firebaseapp.com",
  projectId: "codemonks-18faa",
  storageBucket: "codemonks-18faa.appspot.com",
  messagingSenderId: "603808829560",
  appId: "1:603808829560:web:5a9be812cbb0df9865dd8d",
  measurementId: "G-0K1RDCVSZH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Analytics init failed:", error);
  }
}

// Set up Google Auth provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
export default app;
