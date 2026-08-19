import { create } from "zustand";
import type { SongDetail } from "../api/types";
import { fetchSongUrl } from "../api/netease";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: SongDetail[];
  currentIndex: number;
  playing: boolean;
  positionMs: number;
  durationMs: number;
  repeatMode: RepeatMode;
  loading: boolean;
  error: string | null;
  playSong: (song: SongDetail, queue?: SongDetail[]) => Promise<void>;
  playQueue: (songs: SongDetail[], startIndex?: number) => Promise<void>;
  toggle: () => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (ms: number) => void;
  cycleRepeat: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

/**
 * Single audio element owned by the store; the store subscribes to its
 * timeupdate/ended events so every component observes one source of truth.
 */
const audio = new Audio();
audio.preload = "auto";
audio.volume = 0.7;

export const usePlayer = create<PlayerState>((set, get) => {
  let lastTimeUpdate = 0;

  audio.addEventListener("timeupdate", () => {
    // Throttle to ~4 updates/sec; smooth visuals come from CSS elsewhere.
    const now = performance.now();
    if (now - lastTimeUpdate < 250) return;
    lastTimeUpdate = now;
    set({ positionMs: Math.floor(audio.currentTime * 1000) });
  });
  audio.addEventListener("ended", () => {
    const { repeatMode } = get();
    if (repeatMode === "one") {
      audio.currentTime = 0;
      void audio.play();
      return;
    }
    void get().next();
  });
  audio.addEventListener("play", () => set({ playing: true }));
  audio.addEventListener("pause", () => set({ playing: false }));
  audio.addEventListener("error", () => set({ error: "音频加载失败" }));

  async function startPlayback(song: SongDetail) {
    set({ loading: true, error: null });
    try {
      const urlItem = await fetchSongUrl(song.id);
      if (!urlItem?.url) {
        set({ loading: false, error: `「${song.name}」需要 VIP 或已下架，自动跳过` });
        // Skip unplayable track after a short pause so the notice is readable.
        window.setTimeout(() => void get().next(), 1200);
        return;
      }
      audio.src = urlItem.url;
      set({ durationMs: song.dt, loading: false });
      updateMediaSession(song);
      await audio.play();
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "播放失败" });
    }
  }

  function updateMediaSession(song: SongDetail) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist: song.ar.map((a) => a.name).join(" / "),
      album: song.al.name,
      artwork: song.al.picUrl ? [{ src: song.al.picUrl, sizes: "512x512" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => void audio.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => void get().prev());
    navigator.mediaSession.setActionHandler("nexttrack", () => void get().next());
  }

  return {
    queue: [],
    currentIndex: -1,
    playing: false,
    positionMs: 0,
    durationMs: 0,
    repeatMode: "off",
    loading: false,
    error: null,
    volume: 70,

    async playSong(song, queue) {
      if (queue) set({ queue, currentIndex: Math.max(0, queue.findIndex((s) => s.id === song.id)) });
      set({ positionMs: 0 });
      await startPlayback(song);
    },

    async playQueue(songs, startIndex = 0) {
      const song = songs[startIndex];
      if (!song) return;
      set({ queue: songs, currentIndex: startIndex, positionMs: 0 });
      await startPlayback(song);
    },

    toggle() {
      if (!audio.src) return;
      if (audio.paused) void audio.play();
      else audio.pause();
    },

    async next() {
      const { queue, currentIndex, repeatMode } = get();
      if (queue.length === 0) return;
      const nextIndex = (currentIndex + 1) % queue.length;
      if (nextIndex === 0 && repeatMode === "off" && currentIndex !== 0) {
        audio.pause();
        return;
      }
      set({ currentIndex: nextIndex, positionMs: 0 });
      await startPlayback(queue[nextIndex]);
    },

    async prev() {
      const { queue, currentIndex } = get();
      if (queue.length === 0) return;
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      set({ currentIndex: prevIndex, positionMs: 0 });
      await startPlayback(queue[prevIndex]);
    },

    seek(ms) {
      audio.currentTime = ms / 1000;
      set({ positionMs: ms });
    },

    cycleRepeat() {
      const order: RepeatMode[] = ["off", "all", "one"];
      const cur = order.indexOf(get().repeatMode);
      set({ repeatMode: order[(cur + 1) % order.length] });
    },

    setVolume(v) {
      audio.volume = Math.min(1, Math.max(0, v / 100));
      set({ volume: v });
    },
  };
});
