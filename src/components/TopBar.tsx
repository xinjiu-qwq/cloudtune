import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { fetchLogout } from "../api/netease";
import { useAuth } from "../stores/authStore";

interface TopBarProps {
  onSearch: (query: string) => void;
  onBack?: () => void;
  onLoginClick: () => void;
}

export default function TopBar({ onSearch, onBack, onLoginClick }: TopBarProps) {
  const [value, setValue] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const profile = useAuth((s) => s.profile);
  const status = useAuth((s) => s.status);
  const logout = useAuth((s) => s.logout);

  async function handleLogout() {
    setMenuAnchor(null);
    try {
      await fetchLogout();
    } catch {
      // Local session is cleared regardless of server-side result.
    }
    logout();
  }

  return (
    <Box
      sx={{
        height: 64,
        px: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {onBack && (
        <IconButton onClick={onBack} aria-label="返回">
          <ArrowBackIcon />
        </IconButton>
      )}
      <TextField
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onSearch(value.trim());
        }}
        placeholder="搜索音乐、歌手（回车搜索）"
        sx={{ width: 320 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: 999, bgcolor: "background.paper" },
          },
        }}
      />
      <Box sx={{ flex: 1 }} />
      <IconButton aria-label="设置">
        <SettingsOutlinedIcon />
      </IconButton>
      {status === "logged_in" && profile ? (
        <>
          <Tooltip title={profile.nickname}>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="账号菜单"
              sx={{ p: 0.5 }}
            >
              <Avatar src={profile.avatarUrl} alt={profile.nickname} sx={{ width: 34, height: 34 }} />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
            <MenuItem disabled>{profile.nickname}</MenuItem>
            <MenuItem onClick={() => void handleLogout()}>
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> 退出登录
            </MenuItem>
          </Menu>
        </>
      ) : (
        <IconButton aria-label="登录" onClick={onLoginClick}>
          <AccountCircleOutlinedIcon />
        </IconButton>
      )}
    </Box>
  );
}
