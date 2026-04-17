import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { uid: string; email: string; displayName: string; photoURL: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName: string; photoURL: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve a persistent guest ID
    let guestId = localStorage.getItem('gehlotai_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('gehlotai_guest_id', guestId);
    }

    const mockUser = {
      uid: guestId,
      email: 'guest@gehlotai.local',
      displayName: 'Guest Student',
      photoURL: `https://ui-avatars.com/api/?name=Guest+Student&background=random`,
    };

    const initializeGuest = async () => {
      setUser(mockUser);
      try {
        const userDoc = await getDoc(doc(db, 'users', guestId));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: guestId,
            email: mockUser.email,
            displayName: mockUser.displayName,
            photoURL: mockUser.photoURL,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', guestId), newProfile);
          setProfile(newProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${guestId}`);
      }
      setLoading(false);
    };

    initializeGuest();
  }, []);

  const login = async () => {
    // No-op since auth is removed
    console.log('Login logic removed');
  };

  const logout = async () => {
    // No-op since auth is removed
    console.log('Logout logic removed');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
