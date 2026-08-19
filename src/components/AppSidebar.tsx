import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import LibraryMusicOutlinedIcon from "@mui/icons-material/LibraryMusicOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { userPlaylists } from "../data/mock";

const navItems = [
  { key: "home", label: "发现音乐", icon: <ExploreOutlinedIcon /> },
  { key: "library", label: "我的音乐", icon: <LibraryMusicOutlinedIcon /> },
  { key: "favorite", label: "我的收藏", icon: <FavoriteBorderIcon /> },
  { key: "download", label: "下载管理", icon: <DownloadOutlinedIcon /> },
] as const;

export type NavKey = (typeof navItems)[number]["key"];

interface AppSidebarProps {
  active: NavKey | null;
  onNavigate: (key: NavKey) => void;
}

export default function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  return (
    <Box
      component="nav"
      sx={{
        width: 248,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 2,
        py: 2.5,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, #c20c0c 0%, #7a1f2b 100%)",
            color: "#fff",
          }}
        >
          <MusicNoteIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontSize: 19 }}>
          CloudTune
        </Typography>
      </Box>

      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={active === item.key}
            onClick={() => onNavigate(item.key)}
            sx={{ px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="caption"
        sx={{ px: 1.5, mb: 1, color: "text.secondary", fontWeight: 600 }}
      >
        我的歌单
      </Typography>
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <List disablePadding dense>
          {userPlaylists.map((pl) => (
            <ListItemButton key={pl.id} sx={{ px: 2 }}>
              <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                <QueueMusicOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={pl.name}
                primaryTypographyProps={{ fontSize: 14, noWrap: true }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
}
