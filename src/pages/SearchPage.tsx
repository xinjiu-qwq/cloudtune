import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import { searchSongs } from "../api/netease";
import type { SongDetail } from "../api/types";
import { usePlayer } from "../stores/playerStore";
import { formatDuration } from "../data/mock";

interface SearchPageProps {
  /** Committed query; changes trigger a new search. */
  query: string;
}

export default function SearchPage({ query }: SearchPageProps) {
  const [songs, setSongs] = useState<SongDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playSong = usePlayer((s) => s.playSong);
  const currentSongId = usePlayer((s) => s.queue[s.currentIndex]?.id);
  const toggle = usePlayer((s) => s.toggle);

  useEffect(() => {
    if (!query.trim()) {
      setSongs(null);
      return;
    }
    let cancelled = false;
    setSongs(null);
    setError(null);
    searchSongs(query)
      .then((r) => !cancelled && setSongs(r))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <Box sx={{ p: 4, overflowY: "auto", height: "100%" }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        搜索
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {query ? `「${query}」的结果` : "在顶部输入关键词搜索歌曲"}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!query.trim() && (
        <Typography color="text.secondary" sx={{ mt: 8, textAlign: "center" }}>
          试试搜索「周杰伦」「邓紫棋」或一首歌的名字
        </Typography>
      )}

      {query.trim() && songs === null && !error && (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} height={48} />
          ))}
        </Box>
      )}

      {songs && songs.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
          没有找到相关歌曲
        </Typography>
      )}

      {songs && songs.length > 0 && (
        <Box sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "background.paper" }}>
          {songs.map((song, i) => {
            const active = currentSongId === song.id;
            return (
              <Box
                key={song.id}
                onClick={() => (active ? toggle() : void playSong(song, songs))}
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
                <Typography variant="body2" sx={{ color: active ? "primary.main" : "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                  {active ? "♪" : String(i + 1).padStart(2, "0")}
                </Typography>
                <Box
                  component="img"
                  src={song.al.picUrl}
                  alt=""
                  loading="lazy"
                  sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: "cover", bgcolor: "action.hover" }}
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
  );
}
