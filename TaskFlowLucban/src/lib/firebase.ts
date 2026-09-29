import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
let auth: any = null;

export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
}

export function getRuntimeDataSource(): 'mock' | 'firebase' {
  const requestedSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock';

  if (requestedSource !== 'firebase') {
    return 'mock';
  }

  if (!isFirebaseConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Firebase is required in production, but one or more EXPO_PUBLIC_FIREBASE_* values are missing or invalid.'
      );
    }

    console.warn('[Firebase] Firebase config is incomplete. Falling back to mock data in development mode.');
    return 'mock';
  }

  return 'firebase';
}

if (process.env.EXPO_PUBLIC_DATA_SOURCE === 'firebase') {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      try {
        auth = getAuth(app);
      } catch {
        auth = null;
      }
      console.log('[Firebase] Initialized successfully for Fred\'s Pies');
    } catch {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase initialization failed in production mode.');
      }

      console.warn('[Firebase] Initialization failed. Falling back to mock data.');
    }
  }
}

export { db, auth };
