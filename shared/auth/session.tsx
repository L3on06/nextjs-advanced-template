"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/shared/firebase/auth";

interface SessionValue {
  user: User | null;
  loading: boolean;
  signOutEverywhere: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({ user: null, loading: true, signOutEverywhere: async () => {} });

/**
 * Single session source for the app shell. Screens branch on `user` and
 * `loading`; they never subscribe to Firebase Auth directly.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (next) => {
      setUser(next);
      setLoading(false);
    });
  }, []);

  const signOutEverywhere = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signOutEverywhere }), [user, loading, signOutEverywhere]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
