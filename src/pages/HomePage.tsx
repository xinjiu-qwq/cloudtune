import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useCallback, useEffect, useState } from "react";
import { fetchDailySongs, fetchPersonalized } from "../api/netease";
import type { PersonalizedPlaylist, SongDetail } from "../api/types";
import { usePlayer } from "../stores/playerStore";
import { useAuth } from "../stores/authStore";
import { formatDuration } from "../data/mock";
import ErrorFallback from "../components/ErrorFallback";

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
  const [dailySongs, setDailySongs] = useState<SongDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setError(null);
    setPlaylists(null);
    fetchPersonalized(12)
      .then((r) => !cancelled && setPlaylists(r))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const playerLoading = usePlayer((s) => s.loading);
  const authStatus = useAuth((s) => s.status);
  const currentSongId = usePlayer((s) => s.queue[s.currentIndex]?.id);
  const playSong = usePlayer((s) => s.playSong);
  const toggle = usePlayer((s) => s.toggle);

  useEffect(() => load(), [load]);

  // Daily picks require login.
  useEffect(() => {
    if (authStatus !== "logged_in") {
      setDailySongs(null);
      return;
    }
    let cancelled = false;
    fetchDailySongs()
      .then((r) => !cancelled && setDailySongs(r))
      .catch(() => !cancelled && setDailySongs([]));
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

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
        <Box sx={{ mb: 3 }}>
          <ErrorFallback
            message="无法连接网易云 API 服务，请确认本地 API 已启动。"
            onRetry={load}
          />
        </Box>
      )}

      {authStatus === "logged_in" && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            每日歌曲推荐
          </Typography>
          {dailySongs === null && (
            <Box sx={{ display: "grid", gap: 1.5, mb: 5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={48} />
              ))}
            </Box>
          )}
          {dailySongs && dailySongs.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
              暂时无法获取每日推荐（可能需要 VIP 或接口限流）
            </Typography>
          )}
          {dailySongs && dailySongs.length > 0 && (
            <Box sx={{ mb: 5, borderRadius: 4, overflow: "hidden", bgcolor: "background.paper" }}>
              {dailySongs.slice(0, 15).map((song, i) => {
                const active = currentSongId === song.id;
                return (
                  <Box
                    key={song.id}
                    onClick={() =>
                      active ? toggle() : void playSong(song, dailySongs)
                    }
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "40px 56px 1fr 1fr 64px",
                      alignItems: "center",
                      gap: 2,
                      px: 2.5,
                      py: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      bgcolor: active ? "rgba(255,180,171,.08)" : undefined,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: active ? "primary.main" : "text.secondary", fontVariantNumeric: "tabular-nums" }}
                    >
                      {active ? "♪" : String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Box
                      component="img"
                      src={song.al.picUrl}
                      alt=""
                      loading="lazy"
                      sx={{ width: 44, height: 44, borderRadius: 1, objectFit: "cover", bgcolor: "action.hover" }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap color={active ? "primary.main" : "text.primary"}>
                        {song.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {song.ar.map((a) => a.name).join(" / ")}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {song.al.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatDuration(song.dt)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </>
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
                      borderRadius: 2,
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
