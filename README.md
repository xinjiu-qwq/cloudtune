# CloudTune

第三方网易云音乐桌面客户端 — Material Design 3 界面，Apple Music 风格歌词页。

> ⚠️ 本项目仅供个人学习与技术研究使用。所有音乐数据与版权归网易云音乐所有，请勿用于商业用途或非法传播。

## 开发状态

- [x] M1 应用骨架（Tauri 2 + React + TS + MUI MD3）
- [ ] M2 接入网易云 API（api-enhanced sidecar）
- [ ] M3 Apple Music 风格歌词页
- [ ] M4 二维码登录与个人歌单
- [ ] M5 Windows 打包发布

## 技术栈

- Tauri 2 (Rust) + React 19 + TypeScript
- MUI v7 (Material Design 3)
- 网易云数据源：NeteaseCloudMusicApiEnhanced/api-enhanced（Bun compile sidecar，随客户端分发）
