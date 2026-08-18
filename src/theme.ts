import { createTheme } from "@mui/material/styles";

/**
 * Material Design 3 tokens for CloudTune.
 * Seed color derives from NetEase red, expanded to a full MD3 tonal scheme.
 * Dark is the default mode: music apps read better on dark surfaces.
 */

const light = {
  primary: "#AB2E36",
  onPrimary: "#FFFFFF",
  primaryContainer: "#FFDAD7",
  onPrimaryContainer: "#410008",
  secondary: "#775654",
  secondaryContainer: "#FFDAD7",
  surface: "#FFF8F7",
  surfaceContainer: "#F3EDEC",
  surfaceContainerHigh: "#EDE2E1",
  onSurface: "#221919",
  onSurfaceVariant: "#534342",
  outline: "#857371",
};

const dark = {
  primary: "#FFB4AB",
  onPrimary: "#690012",
  primaryContainer: "#93001F",
  onPrimaryContainer: "#FFDAD7",
  secondary: "#E7BDB7",
  secondaryContainer: "#5D3F3C",
  surface: "#161111",
  surfaceContainer: "#201A1A",
  surfaceContainerHigh: "#2B2323",
  onSurface: "#F0DEDD",
  onSurfaceVariant: "#D8C2BF",
  outline: "#A08C8A",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: dark.primary, contrastText: dark.onPrimary },
    secondary: { main: dark.secondary, contrastText: "#2B1516" },
    background: { default: dark.surface, paper: dark.surfaceContainer },
    text: { primary: dark.onSurface, secondary: dark.onSurfaceVariant },
    divider: "rgba(216, 194, 191, 0.14)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Noto Sans SC Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 40,
          "&.Mui-selected": {
            backgroundColor: dark.secondaryContainer,
            color: dark.onSurface,
            "&:hover": { backgroundColor: dark.secondaryContainer },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: dark.surfaceContainerHigh },
      },
    },
  },
});

export const tokens = { light, dark };
