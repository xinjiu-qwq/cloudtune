import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import { fetchPersonalized } from "../api/netease";
import type { PersonalizedPlaylist } from "../api/types";
import { usePlayer } from "../stores/playerStore";

function formatPlayCount(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)} 亿`;
  if (n >= 10_000) return `${Math.floor(n / 10_000)} 万`;
  return String(n);
}

interface HomePageProps {
  onOpenPlaylist: (id: number) => void;
  onPlayPlaylist: (playlistId: number) => Promise<void>;
}

export default function HomePage({ onOpenPlaylist, onPlayPlaylist }: HomePageProps) {
  const [playlists, setPlaylists] = useState<PersonalizedPlaylist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const playerLoading = usePlayer((s) => s.loading);

  useEffect(() => {
    let cancelled = false;
    fetchPersonalized(12)
      .then((r) => !cancelled && setPlaylists(r))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function quickPlay(id: number) {
    setPlayingId(id);
    try {
      await onPlayPlaylist(id);
    } finally {
      setPlayingId(null);
    }
  }

  return (
    <Box sx={{ p: 4, overflowY: "auto", height: "100%" }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        发现音乐
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          无法连接网易云 API 服务：{error}
          <br />
          请确认本地 API 已启动（cd vendor/api-enhanced &amp;&amp; node app.js），或通过 VITE_API_URL
          指向你的服务地址。
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        推荐歌单
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(176px, 1fr))",
          gap: 2.5,
          mb: 5,
        }}
      >
        {playlists === null && !error
          ? Array.from({ length: 12 }).map((_, i) => (
              <Box key={i}>
                <Skeleton variant="rounded" sx={{ aspectRatio: "1", borderRadius: 4, mb: 1 }} />
                <Skeleton width="70%" />
              </Box>
            ))
          : playlists?.map((pl) => (
              <Box
                key={pl.id}
                onClick={() => onOpenPlaylist(pl.id)}
                sx={{
                  cursor: "pointer",
                  transition: "transform .15s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                  "&:hover .play-fab": { opacity: 1 },
                }}
              >
                <Box sx={{ position: "relative", mb: 1 }}>
                  <Box
                    component="img"
                    src={pl.picUrl}
                    alt={pl.name}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: 4,
                      display: "block",
                      bgcolor: "background.paper",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 10,
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,.6)",
                    }}
                  >
                    ▶ {formatPlayCount(pl.playCount)}
                  </Typography>
                  <Box
                    className="play-fab"
                    onClick={(e) => {
                      e.stopPropagation();
                      void quickPlay(pl.id);
                    }}
                    sx={{
                      position: "absolute",
                      right: 10,
                      bottom: 10,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                      opacity: 0,
                      transition: "opacity .15s ease",
                      boxShadow: "0 4px 16px rgba(0,0,0,.4)",
                    }}
                    aria-label={`播放歌单 ${pl.name}`}
                  >
                    {playingId === pl.id && playerLoading ? "…" : "▶"}
                  </Box>
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    minHeight: 40,
                  }}
                >
                  {pl.name}
                </Typography>
              </Box>
            ))}
      </Box>
      <Box sx={{ height: 24 }} />
    </Box>
  );
}
