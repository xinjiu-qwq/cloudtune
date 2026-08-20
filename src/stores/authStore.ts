import { create } from "zustand";
import type { UserProfile } from "../api/authTypes";

export type AuthStatus = "anonymous" | "logged_in";

interface AuthState {
  status: AuthStatus;
  profile: UserProfile | null;
  /** Full `MUSIC_U=...` cookie string; persisted in localStorage. */
  cookie: string | null;
  setSession: (cookie: string, profile: UserProfile) => void;
  logout: () => void;
  restore: () => UserProfile | null;
}

const STORAGE_KEY = "cloudtune_music_u";

function readStored(): { cookie: string; profile: UserProfile } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { cookie: string; profile: UserProfile };
    if (!parsed.cookie) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Credentials strategy: api-enhanced returns the full cookie string (including
 * MUSIC_U) in the QR-check response body. We persist it and send it as the
 * `cookie=` query parameter on every authenticated request.
 */
export const useAuth = create<AuthState>((set) => {
  const stored = readStored();
  return {
    status: stored ? "logged_in" : "anonymous",
    profile: stored?.profile ?? null,
    cookie: stored?.cookie ?? null,

    setSession(cookie, profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cookie, profile }));
      set({ status: "logged_in", profile, cookie });
    },

    logout() {
      localStorage.removeItem(STORAGE_KEY);
      set({ status: "anonymous", profile: null, cookie: null });
    },

    restore() {
      const s = readStored();
      if (s) set({ status: "logged_in", profile: s.profile, cookie: s.cookie });
      return s?.profile ?? null;
    },
  };
});
