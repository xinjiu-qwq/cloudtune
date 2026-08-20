import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import CloseIcon from "@mui/icons-material/Close";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import StorageIcon from "@mui/icons-material/Storage";
import TextField from "@mui/material/TextField";
import { useTheme } from "../stores/themeStore";
import { useApiConfig } from "../stores/apiConfigStore";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);
  const apiUrl = useApiConfig((s) => s.baseUrl);
  const setApiUrl = useApiConfig((s) => s.setBaseUrl);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 2,
        }}
      >
        设置
        <IconButton onClick={onClose} aria-label="关闭设置">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: "grid", gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            外观
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            aria-label="主题模式"
            size="small"
            sx={{ width: "100%" }}
          >
            <ToggleButton value="light" sx={{ flex: 1, gap: 0.75 }}>
              <LightModeOutlinedIcon fontSize="small" />
              浅色
            </ToggleButton>
            <ToggleButton value="dark" sx={{ flex: 1, gap: 0.75 }}>
              <DarkModeOutlinedIcon fontSize="small" />
              深色
            </ToggleButton>
            <ToggleButton value="auto" sx={{ flex: 1, gap: 0.75 }}>
              <ComputerOutlinedIcon fontSize="small" />
              跟随系统
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            API 服务
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="API 地址"
            placeholder="http://localhost:3000"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            helperText="可留空使用默认值。若内置 API 无法使用，请手动运行 vendor/api-enhanced 下的 node app.js 并填入地址。"
            InputProps={{
              startAdornment: (
                <StorageIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              ),
            }}
          />
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            关于
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            CloudTune 是一个第三方网易云音乐桌面客户端，采用 Tauri 2 与 React 构建。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            作者：歆九
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            支持
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GitHubIcon fontSize="small" color="action" />
            <Link
              href="https://github.com/xinjiu-qwq/cloudtune"
              target="_blank"
              rel="noopener"
              variant="body2"
            >
              项目 GitHub 页面
            </Link>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            遇到问题请在 GitHub Issues 反馈，或检查本地 API 服务是否正常运行。
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
