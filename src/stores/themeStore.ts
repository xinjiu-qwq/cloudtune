import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "auto";

interface ThemeState {
  mode: ThemeMode;
  /** Resolved effective mode (light or dark). */
  effective: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  resolve: () => void;
}

const STORAGE_KEY = "cloudtune_theme_mode";

function readStored(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  } catch {
    /* ignore */
  }
  return "auto";
}

function mediaEffective(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useTheme = create<ThemeState>((set) => ({
  mode: readStored(),
  effective: mediaEffective(),

  setMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    set({ mode, effective: mode === "auto" ? mediaEffective() : mode });
  },

  resolve() {
    set((s) => ({ effective: s.mode === "auto" ? mediaEffective() : s.mode }));
  },
}));
