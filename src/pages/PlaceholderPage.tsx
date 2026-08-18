import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LibraryMusicOutlinedIcon from "@mui/icons-material/LibraryMusicOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import type { NavKey } from "../components/AppSidebar";

const placeholders: Record<Exclude<NavKey, "home">, { title: string; desc: string; icon: React.ReactNode }> = {
  library: {
    title: "我的音乐",
    desc: "登录网易云账号后，这里会显示你的歌单、收藏与最近播放（M4 里程碑接入）。",
    icon: <LibraryMusicOutlinedIcon sx={{ fontSize: 48 }} />,
  },
  favorite: {
    title: "我的收藏",
    desc: "收藏的专辑、歌手与视频将集中在这里展示。",
    icon: <FavoriteBorderIcon sx={{ fontSize: 48 }} />,
  },
  download: {
    title: "下载管理",
    desc: "本地缓存与下载任务将在后续里程碑中实现。",
    icon: <DownloadOutlinedIcon sx={{ fontSize: 48 }} />,
  },
};

export default function PlaceholderPage({ page }: { page: Exclude<NavKey, "home"> }) {
  const p = placeholders[page];
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        color: "text.secondary",
        textAlign: "center",
        p: 4,
      }}
    >
      {p.icon}
      <Typography variant="h6" color="text.primary">
        {p.title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        {p.desc}
      </Typography>
    </Box>
  );
}
