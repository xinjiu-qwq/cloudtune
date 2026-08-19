import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import { useAppTheme } from "./theme";
import { useTheme } from "./stores/themeStore";
import { useEffect } from "react";
import "@fontsource-variable/noto-sans-sc";
import "./index.css";

function ThemeRoot() {
  const theme = useAppTheme();
  const resolve = useTheme((s) => s.resolve);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => resolve();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [resolve]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeRoot />
  </React.StrictMode>,
);
