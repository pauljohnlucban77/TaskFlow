import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
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

const MOCK_USER_UID = 'mock-customer-123';
const MOCK_USER_EMAIL = 'customer@fredspies.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock';

  useEffect(() => {
    if (auth && dataSource === 'firebase') {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [dataSource]);

  const isMockUser = dataSource === 'mock' || !auth || !user;
  const uid = user ? user.uid : MOCK_USER_UID;
  const email = user ? user.email || '' : MOCK_USER_EMAIL;

  const signIn = async (emailInput: string, passInput: string) => {
    if (!auth) throw new Error('Firebase Auth not available');
    await signInWithEmailAndPassword(auth, emailInput, passInput);
  };

  const signUp = async (emailInput: string, passInput: string) => {
    if (!auth) throw new Error('Firebase Auth not available');
    await createUserWithEmailAndPassword(auth, emailInput, passInput);
  };

  const signOut = async () => {
    if (auth && user) {
      await fbSignOut(auth);
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
