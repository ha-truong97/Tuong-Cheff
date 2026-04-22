import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  updatePassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isRep: boolean;
  loginWithGoogle: () => Promise<void>;
  updatePass: (newPass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        } else {
          // If profile doesn't exist, create it from Google User info
          const newProfile: UserProfile = {
            id: user.uid,
            username: user.email?.split('@')[0] || 'user',
            realName: user.displayName || 'Người dùng',
            role: 'employee',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, user.uid), newProfile);
          // Snapshot will trigger again and update state
        }
        setLoading(false);
      }, (err) => {
        console.error("Profile fetch error:", err);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const updatePass = async (newPass: string) => {
    if (!auth.currentUser) throw new Error("Chưa đăng nhập");
    await updatePassword(auth.currentUser, newPass);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isRep: profile?.role === 'representative',
    loginWithGoogle,
    updatePass,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
