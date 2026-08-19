import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLyric } from "../api/netease";
import { usePlayer } from "../stores/playerStore";
import { parseLyrics, findActiveIndex, type LyricLine } from "../lib/lrc";
import { extractPalette, cssRgb, type Palette } from "../lib/color";
import { formatDuration } from "../data/mock";

/**
 * Apple Music-style full-screen lyrics view.
 * - Cover-derived ambient background (dominant color gradient + blurred artwork)
 * - Active line centered with scale/brightness emphasis, neighbours faded
 * - Smooth transform-based scrolling; hover pauses auto-scroll
 * - Translated line rendered under the main line
 * - Click any line to seek playback
 */
interface LyricsPageProps {
  onClose: () => void;
}

const FALLBACK_PALETTE: Palette = {
  dominant: [147, 0, 31],
  deep: [30, 12, 16],
};

export default function LyricsPage({ onClose }: LyricsPageProps) {
  const song = usePlayer((s) => s.queue[s.currentIndex]);
  const positionMs = usePlayer((s) => s.positionMs);
  const durationMs = usePlayer((s) => s.durationMs);
  const playing = usePlayer((s) => s.playing);
  const seek = usePlayer((s) => s.seek);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);

  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [palette, setPalette] = useState<Palette>(FALLBACK_PALETTE);
  const [hovered, setHovered] = useState(false);

  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const coverUrl = song?.al.picUrl;

  // Load lyrics whenever the track changes.
  useEffect(() => {
    if (!song) return;
    let cancelled = false;
    setLines(null);
    fetchLyric(song.id)
      .then((r) => {
        if (!cancelled) setLines(parseLyrics(r.lrc?.lyric, r.tlyric?.lyric, r.romalrc?.lyric));
      })
      .catch(() => {
        if (!cancelled) setLines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [song?.id]);

  // Extract ambient palette from the cover art.
  useEffect(() => {
    if (!coverUrl) return;
    let cancelled = false;
    extractPalette(coverUrl).then((p) => {
      if (!cancelled) setPalette(p);
    }).catch(() => {
      /* keep fallback palette */
    });
    return () => {
      cancelled = true;
    };
  }, [coverUrl]);

  const activeIndex = useMemo(
    () => (lines ? findActiveIndex(lines, positionMs) : -1),
    [lines, positionMs],
  );

  // Center the active line with a smooth transform transition.
  useEffect(() => {
    if (hovered || activeIndex < 0) return;
    const el = lineRefs.current[activeIndex];
    const viewport = viewportRef.current;
    if (!el || !viewport) return;
    // offsetTop is resolved against the nearest positioned ancestor (the mask container).
    const offset = el.offsetTop - viewport.parentElement!.clientHeight / 2 + el.offsetHeight / 2;
    viewport.style.transform = `translateY(${-Math.max(0, offset)}px)`;
  }, [activeIndex, hovered]);

  if (!song) return null;

  const hasLyrics = lines && lines.length > 0;

  return (
    <Box
      role="dialog"
      aria-label="歌词页"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (t) => t.zIndex.modal,
        overflow: "hidden",
        display: "flex",
        color: "#fff",
        background: `linear-gradient(160deg, ${cssRgb(palette.dominant, 0.55)} 0%, ${cssRgb(palette.deep)} 65%, #0a0708 100%)`,
        transition: "background .8s ease",
      }}
    >
      {/* Ambient blurred cover backdrop */}
      {coverUrl && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: "-15%",
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(90px) saturate(1.4)",
            opacity: 0.5,
            transition: "background-image .6s ease",
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{ position: "absolute", inset: 0, background: "rgba(8, 5, 6, 0.35)" }}
      />

      <IconButton
        onClick={onClose}
        aria-label="关闭歌词页"
        sx={{ position: "absolute", top: 20, right: 20, zIndex: 2, color: "#fff" }}
      >
        <CloseIcon />
      </IconButton>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 42%) 1fr",
          alignItems: "center",
          gap: 6,
          px: 8,
        }}
      >
        {/* Left: artwork + track info */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, justifySelf: "center" }}>
          <Box
            component="img"
            src={coverUrl}
            alt={song.name}
            sx={{
              width: "min(32vw, 360px)",
              aspectRatio: "1",
              objectFit: "cover",
              borderRadius: 6,
              boxShadow: "0 32px 90px rgba(0,0,0,.55)",
              transform: playing ? "scale(1)" : "scale(0.94)",
              transition: "transform .5s cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          />
          <Box sx={{ textAlign: "center", maxWidth: 380 }}>
            <Typography variant="h5" fontWeight={700} noWrap>
              {song.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.65)" }} noWrap>
              {song.ar.map((a) => a.name).join(" / ")} · {song.al.name}
            </Typography>
          </Box>
        </Box>

        {/* Right: lyrics column */}
        <Box
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            height: "78vh",
            overflow: "hidden",
            position: "relative",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
          }}
        >
          {lines === null && (
            <Box sx={{ display: "grid", gap: 2.5, pt: 24, maxWidth: 520 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={28} sx={{ bgcolor: "rgba(255,255,255,.12)" }} />
              ))}
            </Box>
          )}

          {lines && lines.length === 0 && (
            <Typography sx={{ pt: 24, color: "rgba(255,255,255,.6)" }}>
              纯音乐或暂无歌词
            </Typography>
          )}

          {hasLyrics && (
            <Box
              ref={viewportRef}
              sx={{
                display: "grid",
                gap: 0.5,
                pt: "34vh",
                pb: "40vh",
                maxWidth: 560,
                transition: "transform .65s cubic-bezier(0.33, 1, 0.68, 1)",
                willChange: "transform",
              }}
            >
              {lines.map((line, i) => {
                const state = i === activeIndex ? "active" : i < activeIndex ? "past" : "future";
                return (
                  <Box
                    key={`${line.timeMs}-${i}`}
                    ref={(el: HTMLDivElement | null) => {
                      lineRefs.current[i] = el;
                    }}
                    onClick={() => seek(line.timeMs)}
                    sx={{
                      cursor: "pointer",
                      py: 0.75,
                      transition: "opacity .4s ease, transform .4s ease, filter .4s ease",
                      opacity: state === "active" ? 1 : state === "past" ? 0.38 : 0.55,
                      transform: state === "active" ? "scale(1.02)" : "scale(1)",
                      transformOrigin: "left center",
                      filter: state === "active" ? "none" : "blur(0.4px)",
                      "&:hover": { opacity: 0.9 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: state === "active" ? 30 : 24,
                        fontWeight: state === "active" ? 700 : 500,
                        lineHeight: 1.45,
                        letterSpacing: "-0.01em",
                        transition: "font-size .35s ease",
                        textShadow: state === "active" ? "0 2px 24px rgba(0,0,0,.35)" : "none",
                      }}
                    >
                      {line.text}
                    </Typography>
                    {line.trans && (
                      <Typography
                        sx={{
                          fontSize: state === "active" ? 16 : 14,
                          color: "rgba(255,255,255,.72)",
                          mt: 0.25,
                          transition: "font-size .35s ease",
                        }}
                      >
                        {line.trans}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom transport — the main PlayerBar is hidden behind this overlay */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          px: 8,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: "linear-gradient(0deg, rgba(0,0,0,.5), transparent)",
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,.7)", width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {formatDuration(positionMs)}
        </Typography>
        <Slider
          size="small"
          value={durationMs > 0 ? (positionMs / durationMs) * 100 : 0}
          min={0}
          max={100}
          onChange={(_, v) => seek(Math.round(((v as number) / 100) * durationMs))}
          aria-label="播放进度"
          sx={{ color: "#fff", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
        />
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,.7)", width: 40, fontVariantNumeric: "tabular-nums" }}>
          {formatDuration(durationMs)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton aria-label="上一首" onClick={() => void prev()} sx={{ color: "#fff" }}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            aria-label={playing ? "暂停" : "播放"}
            onClick={toggle}
            sx={{ color: "#fff", bgcolor: "rgba(255,255,255,.16)", "&:hover": { bgcolor: "rgba(255,255,255,.28)" }, width: 44, height: 44 }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton aria-label="下一首" onClick={() => void next()} sx={{ color: "#fff" }}>
            <SkipNextIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
