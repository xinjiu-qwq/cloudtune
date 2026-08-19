import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";
import RepeatOneOutlinedIcon from "@mui/icons-material/RepeatOneOutlined";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import LyricsOutlinedIcon from "@mui/icons-material/LyricsOutlined";
import { usePlayer } from "../stores/playerStore";
import { formatDuration } from "../data/mock";

interface PlayerBarProps {
  onOpenLyrics: () => void;
}

export default function PlayerBar({ onOpenLyrics }: PlayerBarProps) {
  const song = usePlayer((s) => s.queue[s.currentIndex]);
  const playing = usePlayer((s) => s.playing);
  const loading = usePlayer((s) => s.loading);
  const positionMs = usePlayer((s) => s.positionMs);
  const durationMs = usePlayer((s) => s.durationMs);
  const repeatMode = usePlayer((s) => s.repeatMode);
  const error = usePlayer((s) => s.error);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const volume = usePlayer((s) => s.volume);
  const setVolume = usePlayer((s) => s.setVolume);

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <Box
      sx={{
        height: 84,
        px: 2.5,
        display: "grid",
        gridTemplateColumns: "280px 1fr 280px",
        alignItems: "center",
        gap: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Track info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {song ? (
          <>
            <Box
              component="img"
              src={song.al.picUrl}
              alt={song.name}
              sx={{ width: 52, height: 52, borderRadius: 2, objectFit: "cover", flexShrink: 0, bgcolor: "action.hover" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {song.name}
              </Typography>
              <Typography variant="caption" color={error ? "error.main" : "text.secondary"} noWrap>
                {error ?? song.ar.map((a) => a.name).join(" / ")}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            未在播放 — 从首页或搜索中挑一首
          </Typography>
        )}
      </Box>

      {/* Transport */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton aria-label="上一首" onClick={() => void prev()}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            onClick={toggle}
            disabled={!song || loading}
            aria-label={playing ? "暂停" : "播放"}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              mx: 0.75,
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "primary.main" },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "primary.contrastText" }} />
            ) : playing ? (
              <PauseIcon />
            ) : (
              <PlayArrowIcon />
            )}
          </IconButton>
          <IconButton aria-label="下一首" onClick={() => void next()}>
            <SkipNextIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: repeatMode === "off" ? "text.secondary" : "primary.main", ml: 0.5 }}
            onClick={cycleRepeat}
            aria-label="循环模式"
          >
            {repeatMode === "one" ? <RepeatOneOutlinedIcon fontSize="small" /> : <RepeatOutlinedIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", width: 1, maxWidth: 520, gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {formatDuration(positionMs)}
          </Typography>
          <Slider
            size="small"
            value={progress}
            min={0}
            max={100}
            disabled={!song || durationMs === 0}
            onChange={(_, v) => seek(Math.round(((v as number) / 100) * durationMs))}
            aria-label="播放进度"
          />
          <Typography variant="caption" color="text.secondary" sx={{ width: 40, fontVariantNumeric: "tabular-nums" }}>
            {formatDuration(durationMs)}
          </Typography>
        </Box>
      </Box>

      {/* Right controls */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
        <IconButton aria-label="打开歌词页" onClick={onOpenLyrics} disabled={!song}>
          <LyricsOutlinedIcon />
        </IconButton>
        <IconButton aria-label="播放队列" disabled={!song}>
          <QueueMusicOutlinedIcon />
        </IconButton>
        <VolumeUpOutlinedIcon fontSize="small" sx={{ color: "text.secondary", ml: 1, mr: 0.5 }} />
        <Slider
          size="small"
          value={volume}
          onChange={(_, v) => setVolume(v as number)}
          sx={{ width: 96 }}
          aria-label="音量"
        />
      </Box>
    </Box>
  );
}
