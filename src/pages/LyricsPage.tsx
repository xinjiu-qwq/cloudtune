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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
 * - Native scroll container: mouse wheel / trackpad / drag all work
 * - Swipe/drag down from the top half dismisses the page with a drawer-like animation
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

const CLOSED_THRESHOLD = 120; // px; drag beyond this dismisses the drawer

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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);

  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

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
    extractPalette(coverUrl)
      .then((p) => {
        if (!cancelled) setPalette(p);
      })
      .catch(() => {
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

  // Auto-scroll active line into center when user is not interacting.
  useEffect(() => {
    if (isUserScrolling || activeIndex < 0) return;
    const el = lineRefs.current[activeIndex];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const target = el.offsetTop - scroller.clientHeight / 2 + el.offsetHeight / 2;
    scroller.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [activeIndex, isUserScrolling]);

  function markUserScrolling() {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current !== null) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => setIsUserScrolling(false), 3500);
  }

  function handleWheel(e: React.WheelEvent) {
    if (!scrollerRef.current) return;
    markUserScrolling();
    scrollerRef.current.scrollTop += e.deltaY;
  }

  function handlePointerDown(e: React.PointerEvent) {
    // Only start a drag close from the top ~45% of the screen.
    if (e.clientY > window.innerHeight * 0.45) return;
    dragStartY.current = e.clientY;
    dragStartTime.current = performance.now();
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragStartY.current === 0) return;
    const delta = Math.max(0, e.clientY - dragStartY.current);
    setDragY(delta);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragStartY.current === 0) return;
    const delta = Math.max(0, e.clientY - dragStartY.current);
    const elapsed = performance.now() - dragStartTime.current;
    const velocity = delta / Math.max(1, elapsed);
    dragStartY.current = 0;
    dragStartTime.current = 0;
    if (delta > CLOSED_THRESHOLD || velocity > 0.6) {
      setClosing(true);
      window.setTimeout(onClose, 280);
    } else {
      setDragY(0);
    }
  }

  if (!song) return null;

  const hasLyrics = lines && lines.length > 0;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Box
      role="dialog"
      aria-label="歌词页"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (dragY > 0) setDragY(0);
        dragStartY.current = 0;
      }}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (t) => t.zIndex.modal,
        overflow: "hidden",
        display: "flex",
        color: "#fff",
        background: `linear-gradient(160deg, ${cssRgb(palette.dominant, 0.55)} 0%, ${cssRgb(palette.deep)} 65%, #0a0708 100%)`,
        transition: "background .8s ease",
        transform: closing || dragY > 0 ? `translateY(${closing ? "100%" : `${dragY}px`})` : "translateY(0)",
        opacity: closing ? 0.4 : 1,
        transitionProperty: "transform, opacity",
        transitionDuration: closing || dragY === 0 ? (prefersReducedMotion ? "0ms" : "280ms") : "0ms",
        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* Drag affordance */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 4,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,.35)",
          zIndex: 3,
          pointerEvents: "none",
          opacity: dragY > 0 ? 1 : 0.6,
          transition: "opacity .2s ease",
        }}
      />

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
            pointerEvents: "none",
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{ position: "absolute", inset: 0, background: "rgba(8, 5, 6, 0.35)", pointerEvents: "none" }}
      />

      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setClosing(true);
          window.setTimeout(onClose, 280);
        }}
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
          gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 42%) 1fr" },
          alignItems: "center",
          gap: 6,
          px: { xs: 3, md: 8 },
          pt: { xs: 7, md: 4 },
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
              borderRadius: 2,
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

        {/* Right: scrollable lyrics column */}
        <Box
          ref={scrollerRef}
          onWheel={handleWheel}
          onScroll={markUserScrolling}
          onPointerDown={(e) => e.stopPropagation()}
          sx={{
            height: { xs: "56vh", md: "78vh" },
            overflowY: "auto",
            position: "relative",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            py: "34vh",
            px: 1,
          }}
        >
          {lines === null && (
            <Box sx={{ display: "grid", gap: 2.5, maxWidth: 520 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={28} sx={{ bgcolor: "rgba(255,255,255,.12)" }} />
              ))}
            </Box>
          )}

          {lines && lines.length === 0 && (
            <Typography sx={{ color: "rgba(255,255,255,.6)" }}>纯音乐或暂无歌词</Typography>
          )}

          {hasLyrics && (
            <Box sx={{ display: "grid", gap: 0.5, maxWidth: 560 }}>
              {lines.map((line, i) => {
                const state = i === activeIndex ? "active" : i < activeIndex ? "past" : "future";
                return (
                  <Box
                    key={`${line.timeMs}-${i}`}
                    ref={(el: HTMLDivElement | null) => {
                      lineRefs.current[i] = el;
                    }}
                    onClick={() => {
                      seek(line.timeMs);
                      setIsUserScrolling(false);
                    }}
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
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 3,
          background: "linear-gradient(0deg, rgba(0,0,0,.5), transparent)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,.7)",
            width: 40,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
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
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,.7)",
            width: 40,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatDuration(durationMs)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton aria-label="上一首" onClick={() => void prev()} sx={{ color: "#fff" }}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            aria-label={playing ? "暂停" : "播放"}
            onClick={toggle}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,.16)",
              "&:hover": { bgcolor: "rgba(255,255,255,.28)" },
              width: 44,
              height: 44,
            }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton aria-label="下一首" onClick={() => void next()} sx={{ color: "#fff" }}>
            <SkipNextIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile / small window bottom close hint */}
      <Box
        onClick={() => {
          setClosing(true);
          window.setTimeout(onClose, 280);
        }}
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          gap: 0.5,
          color: "rgba(255,255,255,.7)",
          cursor: "pointer",
        }}
      >
        <KeyboardArrowDownIcon />
        <Typography variant="caption">下滑关闭</Typography>
      </Box>
    </Box>
  );
}
