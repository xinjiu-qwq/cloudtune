/**
 * Types for the subset of NeteaseCloudMusicApi endpoints used by CloudTune.
 * Field names follow the raw API response (not camelCased).
 */

export interface ArtistBrief {
  id: number;
  name: string;
}

export interface AlbumBrief {
  id: number;
  name: string;
  picUrl?: string;
}

/** Song as returned by /song/detail, /cloudsearch, /playlist/detail. */
export interface SongDetail {
  id: number;
  name: string;
  ar: ArtistBrief[];
  al: AlbumBrief;
  /** Duration in milliseconds. */
  dt: number;
  /** Fee flag: 1 = VIP, 8 = free, 4 = purchase, 0=pay. */
  fee?: number;
}

/** Item from /personalized (anonymous recommended playlists). */
export interface PersonalizedPlaylist {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
  trackCount?: number;
  copywriter?: string;
}

export interface PlaylistDetail {
  id: number;
  name: string;
  description?: string;
  coverImgUrl: string;
  trackCount: number;
  playCount?: number;
  tracks: SongDetail[];
}

/** Item from /song/url/v1. */
export interface SongUrlItem {
  id: number;
  url: string | null;
  br: number;
  fee: number;
}

export interface LyricSection {
  lyric?: string;
}

export interface LyricResponse {
  lrc?: LyricSection;
  tlyric?: LyricSection;
  romalrc?: LyricSection;
}
