import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9cn5tin-7EYxodb6PdaysslRbAcQXfQk",
  authDomain: "healthconnect-f3a5e.firebaseapp.com",
  projectId: "healthconnect-f3a5e",
  storageBucket: "healthconnect-f3a5e.firebasestorage.app",
  messagingSenderId: "93040802702",
  appId: "1:93040802702:web:b3f420cad41a3f0a3282df",
  measurementId: "G-RFSTZ93X2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Admin credentials
export const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123',
};

// Auth functions
export const firebaseSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const firebaseSignUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const firebaseGoogleSignIn = () => signInWithPopup(auth, googleProvider);

export const firebaseSignOut = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// Firestore helpers
export const profilesRef = collection(db, 'profiles');
export const appointmentsRef = collection(db, 'appointments');
export const slotsRef = collection(db, 'slots');
export const messagesRef = collection(db, 'messages');

export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  collection,
};

export type { User };
