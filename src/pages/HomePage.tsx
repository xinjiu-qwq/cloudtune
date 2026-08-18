import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { dailySongs, recommendPlaylists, coverGradient, formatDuration, nowPlaying } from "../data/mock";

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="h6" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

export default function HomePage() {
  return (
    <Box sx={{ p: 4, overflowY: "auto", height: "100%" }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        发现音乐
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        今天从「{nowPlaying.title}」继续听吧
      </Typography>

      <SectionTitle>推荐歌单</SectionTitle>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(176px, 1fr))",
          gap: 2.5,
          mb: 5,
        }}
      >
        {recommendPlaylists.map((pl) => (
          <Box
            key={pl.id}
            sx={{ cursor: "pointer", transition: "transform .15s ease", "&:hover": { transform: "translateY(-2px)" } }}
          >
            <Box
              sx={{
                aspectRatio: "1",
                borderRadius: 4,
                background: coverGradient(pl.coverHue),
                mb: 1,
                display: "grid",
                placeItems: "center",
                color: "rgba(255,255,255,.7)",
              }}
            >
              <Typography variant="caption">{pl.songCount} 首</Typography>
            </Box>
            <Typography variant="subtitle2" noWrap>
              {pl.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {pl.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <SectionTitle>每日歌曲推荐</SectionTitle>
      <Box sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "background.paper" }}>
        {dailySongs.map((song, i) => {
          const active = song.id === nowPlaying.id;
          return (
            <Box
              key={song.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr 64px",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 1.25,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                bgcolor: active ? "rgba(255,180,171,.08)" : undefined,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: active ? "primary.main" : "text.secondary", fontVariantNumeric: "tabular-nums" }}
              >
                {String(i + 1).padStart(2, "0")}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap color={active ? "primary.main" : "text.primary"}>
                  {song.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {song.artist}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {song.album}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              >
                {formatDuration(song.durationMs)}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ height: 24 }} />
    </Box>
  );
}
