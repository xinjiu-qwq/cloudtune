import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export default function TopBar() {
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
      <TextField
        size="small"
        placeholder="搜索音乐、歌手、歌单"
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
