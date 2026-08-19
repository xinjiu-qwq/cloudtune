import { useState } from "react";
import Box from "@mui/material/Box";
import AppSidebar, { type NavKey } from "./components/AppSidebar";
import TopBar from "./components/TopBar";
import PlayerBar from "./components/PlayerBar";
import LoginDialog from "./components/LoginDialog";
import HomePage from "./pages/HomePage";
import PlaylistPage from "./pages/PlaylistPage";
import SearchPage from "./pages/SearchPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LyricsPage from "./pages/LyricsPage";
import { fetchPlaylistDetail } from "./api/netease";
import { usePlayer } from "./stores/playerStore";

type View =
  | { kind: "home" }
  | { kind: "playlist"; id: number }
  | { kind: "search"; query: string }
  | { kind: "placeholder"; page: Exclude<NavKey, "home"> };

export default function App() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [history, setHistory] = useState<View[]>([]);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  function navigate(next: View) {
    setHistory((h) => [...h, view]);
    setView(next);
  }

  function goBack() {
    if (history.length === 0) {
      setView({ kind: "home" });
      return;
    }
    const prevView = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setView(prevView);
  }

  /** Sidebar nav resets the stack, like switching tabs. */
  function navigateRoot(nav: NavKey) {
    setHistory([]);
    setView(nav === "home" ? { kind: "home" } : { kind: "placeholder", page: nav });
  }

  async function playPlaylist(playlistId: number) {
    const detail = await fetchPlaylistDetail(playlistId);
    if (detail.tracks.length > 0) {
      await usePlayer.getState().playQueue(detail.tracks, 0);
    }
  }

  const showBack = history.length > 0;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <AppSidebar
          active={view.kind === "home" ? "home" : view.kind === "placeholder" ? view.page : null}
          onNavigate={navigateRoot}
          onOpenPlaylist={(id) => navigate({ kind: "playlist", id })}
        />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar
            onSearch={(q) => navigate({ kind: "search", query: q })}
            onBack={showBack ? goBack : undefined}
            onLoginClick={() => setLoginOpen(true)}
          />
          <Box sx={{ flex: 1, minHeight: 0, bgcolor: "background.default" }}>
            {view.kind === "home" && (
              <HomePage onOpenPlaylist={(id) => navigate({ kind: "playlist", id })} onPlayPlaylist={playPlaylist} />
            )}
            {view.kind === "playlist" && <PlaylistPage playlistId={view.id} />}
            {view.kind === "search" && <SearchPage query={view.query} />}
            {view.kind === "placeholder" && <PlaceholderPage page={view.page} />}
          </Box>
        </Box>
      </Box>
      <PlayerBar onOpenLyrics={() => setLyricsOpen(true)} />
      {lyricsOpen && <LyricsPage onClose={() => setLyricsOpen(false)} />}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
}
