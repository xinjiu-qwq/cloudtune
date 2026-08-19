# API 失效预案与故障排查

CloudTune 的播放、搜索、登录等能力全部依赖 [NeteaseCloudMusicApiEnhanced/api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)（对网易云官方接口的社区逆向实现）。**该服务可能随官方加密升级随时失效**，这是第三方客户端的固有约束。本文档说明失效时的排查与恢复步骤。

## 症状判断

| 现象 | 可能原因 |
|---|---|
| 首页提示"无法连接网易云 API 服务" | API 服务未启动或端口被占用 |
| 搜索/歌单返回 code 非 200 | 上游接口加密变更，需升级 submodule |
| 登录二维码无法生成 | `login/qr/*` 接口变更 |
| 歌曲全部提示"需要 VIP 或已下架" | 部分属正常（fee=1 歌曲匿名不可播），若全部如此则播放接口失效 |

## 恢复步骤

```bash
# 1. 确认本地服务在跑
curl http://localhost:3000/

# 2. 更新到上游最新修复
cd vendor/api-enhanced
git pull origin main
cd ../..
npm run api:install

# 3. 重启 API 服务
npm run api
```

## 版本管理约定

- `vendor/api-enhanced` 以 git submodule 固定在特定 commit（当前 v4.40.1），上游变更不会意外破坏构建。
- 升级是**手动决策**：先阅读上游 CHANGELOG/Issues，确认修复内容后再 `git pull` 并提交新的 submodule 指针。
- 若上游长期无人维护，备选方案：切换到其他活跃维护的 NeteaseCloudMusicApi 分支（接口大体兼容，仅需调整 `src/api/` 层少量字段）。

## 长期风险声明

- 本项目不托管、不缓存任何音频，失效后客户端不会"变砖"，只是失去在线数据源。
- 请勿将本项目用于商业分发。接口逆向与内容版权存在双重法律风险，仅供个人学习研究。
