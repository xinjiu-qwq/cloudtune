import type {
  LyricResponse,
  PersonalizedPlaylist,
  PlaylistDetail,
  SongDetail,
  SongUrlItem,
} from "./types";

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
  const res = await fetch(`${BASE}${path}`, {
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
