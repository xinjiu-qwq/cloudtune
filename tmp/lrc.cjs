var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var lrc_exports = {};
__export(lrc_exports, {
  findActiveIndex: () => findActiveIndex,
  parseLyrics: () => parseLyrics
});
module.exports = __toCommonJS(lrc_exports);
const LINE_RE = /^\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]\s?(.*)$/;
function parseTrack(lrc) {
  if (!lrc) return [];
  const lines = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const m = LINE_RE.exec(raw.trim());
    if (!m) continue;
    const [, mm, ss, frac = "0", text] = m;
    const fracMs = frac.length === 3 ? Number(frac) : Number(frac) * 10;
    const timeMs = (Number(mm) * 60 + Number(ss)) * 1e3 + fracMs;
    lines.push({ timeMs, text: text.trim() });
  }
  return lines.sort((a, b) => a.timeMs - b.timeMs);
}
function parseLyrics(lrc, tlyric, romalrc) {
  const main = parseTrack(lrc).filter((l) => l.text.length > 0);
  const trans = parseTrack(tlyric).filter((l) => l.text.length > 0);
  const romaji = parseTrack(romalrc).filter((l) => l.text.length > 0);
  const result = main.map((l) => ({ timeMs: l.timeMs, text: l.text }));
  const attach = (source, key) => {
    for (const s of source) {
      let best = null;
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
function findActiveIndex(lines, positionMs) {
  let lo = 0;
  let hi = lines.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (lines[mid].timeMs <= positionMs) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
