import type {
  LyricResponse,
  PersonalizedPlaylist,
  PlaylistDetail,
  SongDetail,
  SongUrlItem,
} from "./types";
import type {
  QrCheckResponse,
  QrCreateResponse,
  QrKeyResponse,
  UserProfile,
  UserPlaylistItem,
} from "./authTypes";
import { useAuth } from "../stores/authStore";

/**
 * Client for the embedded NeteaseCloudMusicApi-enhanced server.
 * Base URL is overridable via VITE_API_URL so users can point at their own
 * deployment if the bundled sidecar is unavailable or broken.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(message: string, public readonly code?: number) {
    super(message);
  }
}

async function get<T>(path: string): Promise<T> {
  // Attach the persisted cookie string for authenticated endpoints.
  const cookie = useAuth.getState().cookie;
  const sep = path.includes("?") ? "&" : "?";
  const url = cookie ? `${path}${sep}cookie=${encodeURIComponent(cookie)}` : path;
  const res = await fetch(`${BASE}${url}`, {
    // The API server is cross-origin; responses include CORS headers.
    credentials: "include",
  });
  if (!res.ok) throw new ApiError(`HTTP ${res.status} on ${path}`, res.status);
  const json = (await res.json()) as T & { code?: number; message?: string; msg?: string };
  if (json.code !== undefined && json.code !== 200) {
    throw new ApiError(json.message ?? json.msg ?? `API code ${json.code}`, json.code);
  }
  return json;
}

/** Anonymous recommended playlists (works without login). */
export async function fetchPersonalized(limit = 10): Promise<PersonalizedPlaylist[]> {
  const j = await get<{ code: number; result: PersonalizedPlaylist[] }>(
    `/personalized?limit=${limit}`,
  );
  return j.result ?? [];
}

export async function fetchPlaylistDetail(id: number): Promise<PlaylistDetail> {
  const j = await get<{ code: number; playlist: PlaylistDetail }>(`/playlist/detail?id=${id}`);
  return j.playlist;
}

/** Full keyword search (type 1 = songs). */
export async function searchSongs(keywords: string, limit = 30): Promise<SongDetail[]> {
  const j = await get<{ code: number; result?: { songs?: SongDetail[] } }>(
    `/cloudsearch?keywords=${encodeURIComponent(keywords)}&limit=${limit}`,
  );
  return j.result?.songs ?? [];
}

/** Streamable audio URL. Returns null url for VIP-only songs on anonymous accounts. */
export async function fetchSongUrl(id: number, level = "standard"): Promise<SongUrlItem | null> {
  const j = await get<{ code: number; data?: SongUrlItem[] }>(
    `/song/url/v1?id=${id}&level=${level}`,
  );
  return j.data?.[0] ?? null;
}

export async function fetchLyric(id: number): Promise<LyricResponse> {
  return get<LyricResponse>(`/lyric?id=${id}`);
}

/* ---------------------------- Auth & user data ---------------------------- */

/** Step 1 of QR login: obtain a unique key. */
export async function fetchQrKey(): Promise<string> {
  const ts = Date.now();
  const j = await get<QrKeyResponse>(`/login/qr/key?timestamp=${ts}`);
  const key = j.data?.unikey;
  if (!key) throw new ApiError(j.data?.message ?? "无法获取登录二维码 key", j.code);
  return key;
}

/** Step 2: render the QR code (returns a base64 PNG data-url). */
export async function createQrCode(key: string): Promise<string> {
  const j = await get<QrCreateResponse>(`/login/qr/create?key=${encodeURIComponent(key)}&qrimg=true`);
  const img = j.data?.qrimg;
  if (!img) throw new ApiError("二维码生成失败", j.code);
  return img;
}

/** Step 3: poll scan status. code 803 = success, 800 expired, 801/802 pending. */
export async function checkQrStatus(key: string): Promise<QrCheckResponse> {
  return get<QrCheckResponse>(`/login/qr/check?key=${encodeURIComponent(key)}&timestamp=${Date.now()}`);
}

/** Profile of the logged-in user (requires cookie). */
export async function fetchLoginStatus(): Promise<UserProfile | null> {
  const j = await get<{ code: number; data?: { profile?: UserProfile } }>(
    `/login/status?timestamp=${Date.now()}`,
  );
  return j.data?.profile ?? null;
}

export async function fetchLogout(): Promise<void> {
  await get<{ code: number }>(`/logout?timestamp=${Date.now()}`);
}

/** The user's own playlists (+ subscribed ones) once logged in. */
export async function fetchUserPlaylists(uid: number): Promise<UserPlaylistItem[]> {
  const j = await get<{ code: number; playlist?: UserPlaylistItem[] }>(
    `/user/playlist?uid=${uid}&limit=100`,
  );
  return j.playlist ?? [];
}

/** Daily personalized song picks; login required. */
export async function fetchDailySongs(): Promise<SongDetail[]> {
  const j = await get<{ code: number; data?: { dailySongs?: SongDetail[] } }>(
    `/recommend/songs?timestamp=${Date.now()}`,
  );
  return j.data?.dailySongs ?? [];
}
