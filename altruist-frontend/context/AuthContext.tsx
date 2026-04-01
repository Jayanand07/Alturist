"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onIdTokenChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  userType: string | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  loading: true,
  getToken: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // onIdTokenChanged fires on login, logout, AND automatic token refresh
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Force refresh ensures we always write a valid, non-expired token to the cookie
          const token = await currentUser.getIdToken(/* forceRefresh */ true);
          
          if (isMounted) {
            // Write to cookie so server-side middleware can read it for route protection
            document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
            
            // Sync with backend to get latest user info and type
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/sync`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            });
            
            if (response.ok && isMounted) {
              const data = await response.json();
              const type = data.userType || 'PATIENT';
              setUserType(type);
              document.cookie = `userType=${type}; path=/; max-age=3600; SameSite=Strict; Secure`;
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError' && isMounted) {
            console.error("Auth sync failed:", error);
          }
        }
      } else {
        // Clear cookies and state on logout
        setUserType(null);
        document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
        document.cookie = `userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
      unsubscribe();
    };
  }, []);

  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserType(null);
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
    document.cookie = `userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
  };

  return (
    <AuthContext.Provider value={{ user, userType, loading, getToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};