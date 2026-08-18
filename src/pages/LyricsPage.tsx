import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { coverGradient, nowPlaying } from "../data/mock";

/**
 * M1 stub of the full-screen lyrics view.
 * M3 replaces this with the Apple Music-style implementation:
 * cover-derived dynamic background, smooth line-centering interpolation,
 * blurred backdrop and translated/romaji lines.
 */
interface LyricsPageProps {
  onClose: () => void;
}

export default function LyricsPage({ onClose }: LyricsPageProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (t) => t.zIndex.modal,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        background: `radial-gradient(120% 100% at 50% 0%, hsl(4 45% 22%) 0%, hsl(250 30% 10%) 100%)`,
        color: "text.primary",
      }}
      role="dialog"
      aria-label="歌词页"
    >
      <IconButton
        onClick={onClose}
        aria-label="关闭歌词页"
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        <CloseIcon />
      </IconButton>

      <Box
        sx={{
          width: 260,
          height: 260,
          borderRadius: 6,
          background: coverGradient(4),
          boxShadow: "0 24px 80px rgba(0,0,0,.5)",
        }}
      />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700}>
          {nowPlaying.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {nowPlaying.artist} · {nowPlaying.album}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        歌词页骨架（M1）— 流畅滚动与动态背景将在 M3 实现
      </Typography>
    </Box>
  );
}
