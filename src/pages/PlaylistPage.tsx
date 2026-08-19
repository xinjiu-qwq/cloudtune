import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useCallback, useEffect, useState } from "react";
import { fetchPlaylistDetail } from "../api/netease";
import type { PlaylistDetail, SongDetail } from "../api/types";
import { usePlayer } from "../stores/playerStore";
import { formatDuration } from "../data/mock";
import ErrorFallback from "../components/ErrorFallback";

interface PlaylistPageProps {
  playlistId: number;
}

export default function PlaylistPage({ playlistId }: PlaylistPageProps) {
  const [detail, setDetail] = useState<PlaylistDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playQueue = usePlayer((s) => s.playQueue);
  const currentSong = usePlayer((s) => s.queue[s.currentIndex]);
  const playing = usePlayer((s) => s.playing);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const playSong = usePlayer((s) => s.playSong);

  const load = useCallback(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    fetchPlaylistDetail(playlistId)
      .then((r) => !cancelled && setDetail(r))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  useEffect(() => load(), [load]);

  function toggleRow(song: SongDetail) {
    const isCurrent = currentSong?.id === song.id;
    if (isCurrent) {
      usePlayer.getState().toggle();
      return;
    }
    void playSong(song, detail?.tracks ?? undefined);
  }

  // True when the player's current queue originates from this playlist view.
  const isThisQueuePlaying =
    detail != null && queue.length > 0 && queue[currentIndex] != null &&
    detail.tracks.some((t) => t.id === queue[currentIndex]?.id);

  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
      {detail && (
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              height: 220,
              background: "linear-gradient(180deg, rgba(147,0,31,.55), transparent)",
            }}
          />
          <Box sx={{ position: "absolute", top: 24, left: 24, display: "flex", gap: 3, alignItems: "flex-end", right: 24 }}>
            <Box
              component="img"
              src={detail.coverImgUrl}
              alt={detail.name}
              sx={{ width: 180, height: 180, borderRadius: 2, boxShadow: "0 12px 40px rgba(0,0,0,.5)", flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, pb: 1 }}>
              <Typography variant="h4" sx={{ mb: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {detail.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {detail.trackCount} 首歌曲
                {detail.description ? ` · ${detail.description.slice(0, 60)}` : ""}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={playing && isThisQueuePlaying ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => {
                  if (isThisQueuePlaying && playing) usePlayer.getState().toggle();
                  else void playQueue(detail.tracks, 0);
                }}
                sx={{ borderRadius: 999, px: 4 }}
              >
                {playing && isThisQueuePlaying ? "暂停" : "播放全部"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ p: 3, pt: 2.5 }}>
        {error && <ErrorFallback message={error} onRetry={load} />}
        {!detail && !error && (
          <Box sx={{ display: "grid", gap: 1.5, mt: 24 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} height={44} />
            ))}
          </Box>
        )}

        {detail && (
          <Box sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "background.paper" }}>
            {detail.tracks.map((song, i) => {
              const active = currentSong?.id === song.id;
              return (
                <Box
                  key={song.id}
                  onClick={() => toggleRow(song)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "44px 56px 1fr 1fr 64px",
                    alignItems: "center",
                    gap: 2,
                    px: 2.5,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    bgcolor: active ? "rgba(255,180,171,.08)" : undefined,
                  }}
                >
                  <Typography variant="body2" sx={{ color: active ? "primary.main" : "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                    {active ? "♪" : String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Box component="img" src={song.al.picUrl} alt="" loading="lazy" sx={{ width: 44, height: 44, borderRadius: 1, objectFit: "cover", bgcolor: "action.hover" }} />
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
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatDuration(song.dt)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
        <Box sx={{ height: 24 }} />
      </Box>
    </Box>
  );
}
