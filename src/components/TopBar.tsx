import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface TopBarProps {
  onSearch: (query: string) => void;
  onBack?: () => void;
}

export default function TopBar({ onSearch, onBack }: TopBarProps) {
  const [value, setValue] = useState("");

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
      <IconButton aria-label="账号（未登录）">
        <AccountCircleOutlinedIcon />
      </IconButton>
    </Box>
  );
}
