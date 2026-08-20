import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ErrorFallbackProps {
  onRetry?: () => void;
  message?: string;
}

export default function ErrorFallback({ onRetry, message }: ErrorFallbackProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 8,
        gap: 2,
      }}
    >
      <Typography variant="h6" color="text.primary">
        唔，出了点问题
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {message ?? "刷新试试？如果内置 API 未启动，可手动运行 vendor/api-enhanced 下的 node app.js，并在设置中指定 API 地址。"}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ borderRadius: 999, mt: 1 }}
        >
          刷新
        </Button>
      )}
    </Box>
  );
}
