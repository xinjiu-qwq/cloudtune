import { create } from "zustand";

const STORAGE_KEY = "cloudtune_api_url";
const DEFAULT_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

interface ApiConfigState {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

function readStored(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && raw.startsWith("http")) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_URL;
}

export const useApiConfig = create<ApiConfigState>((set) => ({
  baseUrl: readStored(),

  setBaseUrl(baseUrl) {
    try {
      localStorage.setItem(STORAGE_KEY, baseUrl);
    } catch {
      /* ignore */
    }
    set({ baseUrl });
  },
}));

/** The active API base URL (env override > user setting > default). */
export function getApiBase(): string {
  return (
    (import.meta.env.VITE_API_URL as string | undefined) ??
    useApiConfig.getState().baseUrl ??
    DEFAULT_URL
  );
}
