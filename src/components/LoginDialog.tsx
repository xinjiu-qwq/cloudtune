import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkQrStatus, createQrCode, fetchLoginStatus, fetchQrKey } from "../api/netease";
import { useAuth } from "../stores/authStore";

type Stage = "loading" | "waiting" | "confirming" | "expired" | "error";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
}

/**
 * QR-code login flow against api-enhanced:
 * key -> create(qrimg) -> poll check every 1.5s until code 803.
 */
export default function LoginDialog({ open, onClose, onLogin }: LoginDialogProps) {
  const [stage, setStage] = useState<Stage>("loading");
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const keyRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const setSession = useAuth((s) => s.setSession);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startFlow = useCallback(async () => {
    stopPolling();
    setStage("loading");
    setQrImg(null);
    setErrorMsg("");
    try {
      const key = await fetchQrKey();
      keyRef.current = key;
      const img = await createQrCode(key);
      setQrImg(img);
      setStage("waiting");

      pollRef.current = window.setInterval(async () => {
        if (!keyRef.current) return;
        try {
          const res = await checkQrStatus(keyRef.current);
          if (res.code === 801) {
            setStage("waiting");
          } else if (res.code === 802) {
            setStage("confirming");
          } else if (res.code === 800) {
            stopPolling();
            setStage("expired");
          } else if (res.code === 803) {
            stopPolling();
            // The API returns the raw cookie string(s) on success. Extract the
            // MUSIC_U pair so we can use it as the authenticated cookie param.
            const cookie = res.cookie ?? "";
            const m = cookie.match(/(MUSIC_U=[^;]+)/);
            const musicU = m ? m[1] : null;
            if (!musicU) {
              setStage("error");
              setErrorMsg("登录成功但未获取到凭据，请重试");
              return;
            }
            // Persist the cookie first so subsequent authenticated requests carry it.
            useAuth.setState({ cookie: musicU });
            try {
              const profile = await fetchLoginStatus();
              if (!profile) {
                setStage("error");
                setErrorMsg("无法获取用户信息，请检查本地 API 服务是否正常");
                return;
              }
              setSession(musicU, profile);
              onLogin?.();
              onClose();
            } catch (e) {
              setStage("error");
              setErrorMsg(e instanceof Error ? e.message : "获取用户信息失败");
            }
          }
        } catch (e) {
          // Surface unexpected errors during polling so the user isn't left waiting.
          setStage("error");
          setErrorMsg(e instanceof Error ? e.message : "登录状态查询失败");
          stopPolling();
        }
      }, 1500);
    } catch (e) {
      setStage("error");
      setErrorMsg(e instanceof Error ? e.message : "登录服务不可用");
    }
  }, [onClose, setSession, stopPolling]);

  useEffect(() => {
    if (open) void startFlow();
    return stopPolling;
  }, [open, startFlow, stopPolling]);

  const text: Record<Stage, string> = {
    loading: "正在生成二维码…",
    waiting: "打开网易云音乐 App 扫码登录",
    confirming: "扫描成功，请在手机上确认",
    expired: "二维码已过期",
    error: "登录失败",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          扫码登录网易云
        </Typography>
        <Box
          sx={{
            width: 220,
            height: 220,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "#fff",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {stage === "loading" && <CircularProgress />}
          {qrImg && stage !== "loading" && (
            <Box
              component="img"
              src={qrImg}
              alt="登录二维码"
              sx={{ width: 200, height: 200, opacity: stage === "expired" ? 0.15 : 1 }}
            />
          )}
          {stage === "expired" && (
            <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <Button variant="contained" onClick={() => void startFlow()}>
                点击刷新
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 24 }}>
          {text[stage]}
        </Typography>
        {stage === "error" && (
          <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
            {errorMsg}
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          登录仅用于获取你的歌单与个性化推荐，凭据保存在本地。
        </Typography>
      </Box>
    </Dialog>
  );
}
