import 'firebase/auth';
import 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getFunctions, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: any = null;
let db: any = null;
let authInstance: Auth | null = null;
let functionsInstance: Functions | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
}

export function getRuntimeDataSource(): 'mock' | 'firebase' | null {
  const requestedSource = process.env.EXPO_PUBLIC_DATA_SOURCE;
  return requestedSource === 'mock' || requestedSource === 'firebase'
    ? requestedSource
    : null;
}

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    functionsInstance = getFunctions(app, 'asia-east1');
    console.log('[Firebase] App & Firestore initialized successfully for Fred\'s Pies');
  } catch (err) {
    console.warn('[Firebase] App initialization warning:', err);
  }
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  if (!app) {
    if (!isFirebaseConfigured()) return null;
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }

  if (app) {
    try {
      authInstance = getAuth(app);
    } catch (e) {
      console.warn('[Firebase Auth Lazy Init]:', e);
      authInstance = null;
    }
  }

  return authInstance;
}

export { db, authInstance as auth };
export { functionsInstance as functions };
