import { useState } from "react";
import Box from "@mui/material/Box";
import AppSidebar, { type NavKey } from "./components/AppSidebar";
import TopBar from "./components/TopBar";
import PlayerBar from "./components/PlayerBar";
import HomePage from "./pages/HomePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LyricsPage from "./pages/LyricsPage";

export default function App() {
  const [nav, setNav] = useState<NavKey>("home");
  const [lyricsOpen, setLyricsOpen] = useState(false);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <AppSidebar active={nav} onNavigate={setNav} />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar />
          <Box sx={{ flex: 1, minHeight: 0, bgcolor: "background.default" }}>
            {nav === "home" ? <HomePage /> : <PlaceholderPage page={nav} />}
          </Box>
        </Box>
      </Box>
      <PlayerBar onOpenLyrics={() => setLyricsOpen(true)} />
      {lyricsOpen && <LyricsPage onClose={() => setLyricsOpen(false)} />}
    </Box>
  );
}
