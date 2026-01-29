
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCSGFBsywE09GQxRVSN2kcCELRl9uR1j6U",
  authDomain: "appcursorapidocajon.firebaseapp.com",
  projectId: "appcursorapidocajon",
  storageBucket: "appcursorapidocajon.firebasestorage.app",
  messagingSenderId: "520125433375",
  appId: "1:520125433375:web:0d9af680e40be9f618f72a",
  measurementId: "G-L08G99GPGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, googleProvider, analytics };
