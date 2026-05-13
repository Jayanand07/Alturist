"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onIdTokenChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  userType: string | null;
  loading: boolean;
  syncing: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Returns true when the current user's role exactly matches the given role string. */
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  loading: true,
  syncing: false,
  getToken: async () => null,
  signOut: async () => {},
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

// Helper to read a cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${name}=`));
  return match ? match.split("=")[1] : null;
}

function cookieOptions(maxAgeSeconds: number): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `path=/; max-age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}

function clearCookie(name: string): void {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict${secure}`;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      setUser(currentUser);

      if (currentUser) {
        try {
          // Force refresh for a valid, non-expired token
          const token = await currentUser.getIdToken(/* forceRefresh */ true);

          if (!isMounted) return;

          // The route guard only needs an auth marker. Never place bearer tokens
          // in document.cookie, where injected scripts could read them.
          document.cookie = `token=authenticated; ${cookieOptions(3600)}`;

          // ── FAST PATH: Use cached cookie userType immediately ──
          const storedUserType = getCookie("userType");
          if (storedUserType && storedUserType !== "") {
            setUserType(storedUserType);
            // Mark loading done IMMEDIATELY — user can navigate right away
            setLoading(false);
          }

          // ── BACKGROUND SYNC: Don't block the UI ──
          setSyncing(true);
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/sync`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error(`Sync response not ok: ${res.status}`);
            })
            .then((data) => {
              if (!isMounted) return;
              const type = data.userType || "PATIENT";
              setUserType(type);
              document.cookie = `userType=${type}; ${cookieOptions(3600)}`;
            })
            .catch((err) => {
              if (!isMounted) return;
              console.error("Auth sync failed (background):", err);
              // If no stored type existed, default to PATIENT so user isn't stuck
              if (!storedUserType) {
                setUserType("PATIENT");
                document.cookie = `userType=PATIENT; ${cookieOptions(3600)}`;
              }
            })
            .finally(() => {
              if (!isMounted) return;
              setSyncing(false);
              // If this was a brand-new user (no cookie), loading ends after sync
              if (!storedUserType) {
                setLoading(false);
              }
            });
        } catch (error: unknown) {
          if (isMounted) {
            console.error("Auth token error:", error instanceof Error ? error.message : "Unknown auth error");
            setLoading(false);
          }
        }
      } else {
        // Logged out — clear everything
        setUserType(null);
        clearCookie("token");
        clearCookie("userType");
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const getToken = async (): Promise<string | null> => {
    try {
      if (!auth.currentUser) return null;
      return await auth.currentUser.getIdToken();
    } catch (error: unknown) {
      console.error("Unable to read Firebase ID token:", error instanceof Error ? error.message : "Unknown auth error");
      return null;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } finally {
      setUserType(null);
      clearCookie("token");
      clearCookie("userType");
    }
  };

  /** Returns true when the currently authenticated user has exactly the given role. */
  const hasRole = (role: string): boolean => userType === role;

  return (
    <AuthContext.Provider value={{ user, userType, loading, syncing, getToken, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
