"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile } from "@/lib/types/database";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
  error: null,
  refetch: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/user");
      if (!res.ok) {
        if (res.status === 401) {
          setProfile(null);
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return React.createElement(
    ProfileContext.Provider,
    { value: { profile, loading, error, refetch } },
    children
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
