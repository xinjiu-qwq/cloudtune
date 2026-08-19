import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CloseIcon from "@mui/icons-material/Close";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import { usePlayer } from "../stores/playerStore";
import { formatDuration } from "../data/mock";

interface PlayQueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function PlayQueueDrawer({ open, onClose }: PlayQueueDrawerProps) {
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const playQueue = usePlayer((s) => s.playQueue);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 360 } }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <QueueMusicOutlinedIcon color="action" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          播放列表
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {queue.length} 首
        </Typography>
        <IconButton onClick={onClose} aria-label="关闭播放列表" size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <List dense sx={{ pt: 0 }}>
        {queue.map((song, i) => {
          const active = i === currentIndex;
          return (
            <ListItem key={`${song.id}-${i}`} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => {
                  void playQueue(queue, i);
                  onClose();
                }}
              >
                <Box
                  component="img"
                  src={song.al.picUrl}
                  alt=""
                  sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", mr: 1.5, bgcolor: "action.hover" }}
                />
                <ListItemText
                  primary={song.name}
                  secondary={`${song.ar.map((a) => a.name).join(" / ")} · ${formatDuration(song.dt)}`}
                  primaryTypographyProps={{ noWrap: true, color: active ? "primary" : "textPrimary" }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
