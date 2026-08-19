# CloudTune

第三方网易云音乐桌面客户端 — Material Design 3 界面，Apple Music 风格歌词页。

> ⚠️ **免责声明**：本项目仅供个人学习与技术研究使用，严禁用于任何商业用途或大规模传播。
> 所有音乐数据、封面、歌词的版权均归网易云音乐及其权利人所有。
> 本项目不存储、不分发任何音频文件；播放能力完全依赖用户自行部署的社区 API 服务。
> 如涉及版权问题，请联系删除。

## 开发状态

- [x] M1 应用骨架（Tauri 2 + React + TS + MUI MD3）
- [x] M2 接入网易云 API（api-enhanced，搜索 / 歌单 / 播放 / 歌词全链路）
- [x] M3 Apple Music 风格歌词页（动态取色背景、平滑滚动补间、翻译/罗马音行）
- [x] M4 二维码登录、个人歌单、每日推荐
- [x] M5 Windows 打包发布 + API 失效预案

macOS / Linux 版本将在 Windows 版稳定后跟进。

## 下载安装

Windows 安装包见 [Releases](https://github.com/xinjiu-qwq/cloudtune/releases)（v1.0.0 起内嵌 API 服务，安装即用）：

| 文件 | 说明 |
| --- | --- |
| `CloudTune_1.0.0_x64-setup.exe` | NSIS 安装向导（推荐，约 41 MB） |
| `CloudTune_1.0.0_x64_en-US.msi` | MSI 安装包（约 52 MB） |

## 技术栈

- **前端**：React 19 + TypeScript + Vite 7，MUI v7（Material Design 3 暗色主题），Zustand 状态管理
- **桌面壳**：Tauri 2（Rust），Media Session API 支持系统媒体控制
- **数据源**：[NeteaseCloudMusicApiEnhanced/api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) v4.40.1（git submodule，本地运行）

## 开发运行

前置：Node.js 18+、Rust、[Tauri 2 环境](https://v2.tauri.app/start/prerequisites/)。

```bash
# 1. 克隆（含子模块）
git clone --recurse-submodules https://github.com/xinjiu-qwq/cloudtune.git
cd cloudtune

# 2. 安装依赖
npm install
npm run api:install        # 安装 API 服务依赖

# 3. 启动 API 服务（终端 1，默认 http://localhost:3000）
npm run api

# 4. 启动应用（终端 2）
npm run tauri dev
```

API 地址可通过环境变量 `VITE_API_URL` 覆盖，指向你自己部署的服务。

### API 失效预案

社区 API 依赖对官方加密接口的逆向，**可能随官方升级随时失效**。详见 [docs/API-TROUBLESHOOTING.md](docs/API-TROUBLESHOOTING.md)，快速恢复：

1. `cd vendor/api-enhanced && git pull` 更新到上游最新修复；
2. 查看上游 [Issues](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced/issues) 确认已知问题；
3. 本项目通过 submodule 固定版本，不会被上游变更意外破坏；升级需手动执行。

## 构建发布（Windows）

```bash
# 1. 构建内嵌 API sidecar（首次约 2 分钟，需联网下载 Node.js 基础二进制）
bash scripts/build-sidecar.sh          # 或 scripts\build-sidecar.bat
# 产出 src-tauri/binaries/api-enhanced-x86_64-pc-windows-msvc.exe（约 110 MB，已 gitignore）

# 2. 打包应用
npm run tauri build
# 产出：src-tauri/target/release/bundle/
#   msi/CloudTune_1.0.0_x64_en-US.msi    (约 52 MB)
#   nsis/CloudTune_1.0.0_x64-setup.exe   (约 41 MB)
```

打包后的应用内嵌 api-enhanced：由 [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) 编译为单文件
可执行程序（含 Node.js 运行时与全部依赖），作为 Tauri sidecar 随应用启动/退出自动
拉起/回收，监听 `http://localhost:3000`，用户无需单独部署 API。
