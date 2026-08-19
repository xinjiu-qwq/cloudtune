/** LRC parsing utilities supporting main lyric, translation and romaji tracks. */

export interface LyricLine {
  /** Timestamp in milliseconds. */
  timeMs: number;
  text: string;
  trans?: string;
  romaji?: string;
}

const LINE_RE = /^\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]\s?(.*)$/;

function parseTrack(lrc?: string): { timeMs: number; text: string }[] {
  if (!lrc) return [];
  const lines: { timeMs: number; text: string }[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const m = LINE_RE.exec(raw.trim());
    if (!m) continue;
    const [, mm, ss, frac = "0", text] = m;
    const fracMs = frac.length === 3 ? Number(frac) : Number(frac) * 10;
    const timeMs = (Number(mm) * 60 + Number(ss)) * 1000 + fracMs;
    lines.push({ timeMs, text: text.trim() });
  }
  // API sometimes returns duplicate empty lead lines; keep them harmless.
  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Merge main/translation/romaji tracks into one timeline.
 * Translation lines attach to the nearest main line within 300ms.
 */
export function parseLyrics(lrc?: string, tlyric?: string, romalrc?: string): LyricLine[] {
  const main = parseTrack(lrc).filter((l) => l.text.length > 0);
  const trans = parseTrack(tlyric).filter((l) => l.text.length > 0);
  const romaji = parseTrack(romalrc).filter((l) => l.text.length > 0);

  const result: LyricLine[] = main.map((l) => ({ timeMs: l.timeMs, text: l.text }));

  const attach = (source: { timeMs: number; text: string }[], key: "trans" | "romaji") => {
    for (const s of source) {
      let best: LyricLine | null = null;
      let bestDiff = 300;
      for (const line of result) {
        const diff = Math.abs(line.timeMs - s.timeMs);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = line;
        }
      }
      if (best) best[key] = s.text;
    }
  };
  attach(trans, "trans");
  attach(romaji, "romaji");

  return result;
}

/** Binary search for the line that should be highlighted at positionMs. */
export function findActiveIndex(lines: LyricLine[], positionMs: number): number {
  let lo = 0;
  let hi = lines.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].timeMs <= positionMs) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
