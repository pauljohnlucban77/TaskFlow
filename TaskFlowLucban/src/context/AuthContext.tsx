import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
import { isLocalOrderPreviewEnabled } from '../utils/localOrderPreview';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  uid: string;
  email: string;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  isMockUser: boolean;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (authInstance) {
      try {
        const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        console.warn('[AuthContext] Auth listener error:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const uid = user?.uid ?? 'mock-customer-123';
  const email = user?.email ?? '';
  const isMockUser = !user;
  const enterGuestMode = () => {
    if (!isLocalOrderPreviewEnabled()) throw new Error('Guest access is available in the local preview only.');
    setGuestMode(true);
  };

  const signIn = async (emailInput: string, passInput: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      throw new Error('Firebase Auth failed to initialize. Check your Firebase project config.');
    }
    const userCred = await signInWithEmailAndPassword(authInstance, emailInput, passInput);
    setUser(userCred.user);
    setGuestMode(false);
  };

  const signUp = async (emailInput: string, passInput: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      throw new Error('Firebase Auth failed to initialize. Check your Firebase project config.');
    }
    const userCred = await createUserWithEmailAndPassword(authInstance, emailInput, passInput);
    setUser(userCred.user);
    setGuestMode(false);
  };

  const signOut = async () => {
    const authInstance = getFirebaseAuth();
    if (authInstance && user) {
      try {
        await fbSignOut(authInstance);
      } catch (e) {
        console.warn('[AuthContext] Firebase signOut error:', e);
      }
    }
    setUser(null);
    setGuestMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        uid,
        email,
        loading,
        signIn,
        signUp,
        signOut,
        isMockUser: isMockUser && !guestMode,
        enterGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
