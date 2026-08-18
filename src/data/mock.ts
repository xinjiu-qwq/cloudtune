export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  /** Hue used to derive the placeholder cover gradient. */
  coverHue: number;
  songCount: number;
}

export const nowPlaying: Song = {
  id: 1,
  title: "夜空中最亮的星",
  artist: "逃跑计划",
  album: "世界",
  durationMs: 252_000,
};

export const dailySongs: Song[] = [
  nowPlaying,
  { id: 2, title: "平凡之路", artist: "朴树", album: "猎户星座", durationMs: 302_000 },
  { id: 3, title: "晴天", artist: "周杰伦", album: "叶惠美", durationMs: 269_000 },
  { id: 4, title: "海阔天空", artist: "Beyond", album: "乐与怒", durationMs: 326_000 },
  { id: 5, title: "光年之外", artist: "邓紫棋", album: "光年之外", durationMs: 235_000 },
  { id: 6, title: "起风了", artist: "买辣椒也用券", album: "起风了", durationMs: 325_000 },
  { id: 7, title: "漂洋过海来看你", artist: "李宗盛", album: "理性与感性", durationMs: 266_000 },
  { id: 8, title: "红玫瑰", artist: "陈奕迅", album: "认了吧", durationMs: 240_000 },
];

export const recommendPlaylists: Playlist[] = [
  { id: 101, name: "华语流行精选", description: "每周更新的华语热门单曲", coverHue: 4, songCount: 68 },
  { id: 102, name: "深夜独处的房间", description: "适合一个人安静听的歌", coverHue: 258, songCount: 42 },
  { id: 103, name: "粤语经典回忆", description: "八九十年代的港乐黄金时代", coverHue: 36, songCount: 95 },
  { id: 104, name: "独立民谣地图", description: "从万晓利到陈鸿宇", coverHue: 152, songCount: 51 },
  { id: 105, name: "电子节拍充电", description: "工作学习时的能量补给", coverHue: 200, songCount: 77 },
];

export const userPlaylists: Playlist[] = [
  { id: 201, name: "我喜欢的音乐", description: "收藏的单曲", coverHue: 4, songCount: 312 },
  { id: 202, name: "通勤路上", description: "地铁与公交的 BGM", coverHue: 210, songCount: 87 },
  { id: 203, name: "跑步节奏", description: "BPM 160+", coverHue: 120, songCount: 45 },
];

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Deterministic cover gradient from a hue, used until real covers load. */
export function coverGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 32%), hsl(${(hue + 40) % 360} 55% 18%))`;
}
