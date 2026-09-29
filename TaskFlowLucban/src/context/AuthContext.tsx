import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const uid = user?.uid ?? 'guest-customer-123';
  const email = user?.email ?? '';
  const isMockUser = !user;

  const signIn = async (emailInput: string, passInput: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      throw new Error('Firebase Auth failed to initialize. Check your Firebase project config.');
    }
    const userCred = await signInWithEmailAndPassword(authInstance, emailInput, passInput);
    setUser(userCred.user);
  };

  const signUp = async (emailInput: string, passInput: string) => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      throw new Error('Firebase Auth failed to initialize. Check your Firebase project config.');
    }
    const userCred = await createUserWithEmailAndPassword(authInstance, emailInput, passInput);
    setUser(userCred.user);
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
        isMockUser,
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
