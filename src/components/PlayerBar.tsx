import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ShuffleOutlinedIcon from "@mui/icons-material/ShuffleOutlined";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import LyricsOutlinedIcon from "@mui/icons-material/LyricsOutlined";
import { coverGradient, formatDuration, nowPlaying } from "../data/mock";

/**
 * M1 playback is simulated: position advances on a timer so the UI feels live.
 * M2 replaces this with the real audio element and Media Session API.
 */
import { useEffect, useRef, useState } from "react";

interface PlayerBarProps {
  onOpenLyrics: () => void;
}

export default function PlayerBar({ onOpenLyrics }: PlayerBarProps) {
  const [positionMs, setPositionMs] = useState(38_000);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setPositionMs((p) => (p + 1000 > nowPlaying.durationMs ? 0 : p + 1000));
    }, 1000);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [playing]);

  const progress = (positionMs / nowPlaying.durationMs) * 100;

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
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            background: coverGradient(4),
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {nowPlaying.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {nowPlaying.artist}
          </Typography>
        </Box>
      </Box>

      {/* Transport */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="small" sx={{ color: "text.secondary" }} aria-label="随机播放">
            <ShuffleOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="上一首">
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            onClick={() => setPlaying((v) => !v)}
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
            <PlayArrowIcon sx={{ transform: playing ? "none" : undefined }} />
          </IconButton>
          <IconButton aria-label="下一首">
            <SkipNextIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }} aria-label="循环播放">
            <RepeatOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", width: 1, maxWidth: 520, gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {formatDuration(positionMs)}
          </Typography>
          <Slider
            size="small"
            value={progress}
            onChange={(_, v) =>
              setPositionMs(Math.round(((v as number) / 100) * nowPlaying.durationMs))
            }
            aria-label="播放进度"
          />
          <Typography variant="caption" color="text.secondary" sx={{ width: 36, fontVariantNumeric: "tabular-nums" }}>
            {formatDuration(nowPlaying.durationMs)}
          </Typography>
        </Box>
      </Box>

      {/* Right controls */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
        <IconButton aria-label="打开歌词页" onClick={onOpenLyrics}>
          <LyricsOutlinedIcon />
        </IconButton>
        <IconButton aria-label="播放队列">
          <QueueMusicOutlinedIcon />
        </IconButton>
        <VolumeUpOutlinedIcon fontSize="small" sx={{ color: "text.secondary", ml: 1, mr: 0.5 }} />
        <Slider size="small" defaultValue={70} sx={{ width: 96 }} aria-label="音量" />
      </Box>
    </Box>
  );
}
