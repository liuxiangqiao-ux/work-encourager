# 上班鼓励器（Work Encourager）

同款「牛马鼓励器」—— 一个常驻桌面角落的实时计薪小组件：看着自己的工资一秒一秒涨，上班更有劲。

![平台](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue)

## 功能

- 💰 **今日已赚**：按秒实时跳动的大数字（日薪 = 月薪 ÷ 21.75，法定月计薪天数）
- 📈 **大涨红 / 护眼绿** 两种数字配色
- ⏱ **下班倒计时** + 上班进度条
- 🗓 **发薪日倒计时**
- 🖱 无边框透明小窗，可随意拖动，支持置顶与透明度调节
- ⚙ 设置页：月薪、上下班时间、工作日、发薪日

## 运行与打包

```bash
npm install

# 浏览器预览（无需 Electron）
npm run dev            # 打开 http://localhost:7100

# 桌面运行
npm run desktop

# 打包 Windows（.exe 安装包 + .zip 绿色版）
npm run build:win

# 打包 macOS（.dmg，需要在 Mac 上执行，或用 GitHub Actions）
npm run build:mac
```

## 下载安装包（Win / Mac 双版本）

仓库内置 GitHub Actions 工作流（`.github/workflows/build.yml`），推送到 main 分支即自动构建：

- **Windows**：NSIS 安装包 `.exe` + 免安装绿色版 `.zip`
- **macOS**：`.dmg`（Apple Silicon）

构建完成后在 **Actions → 构建安装包 → 最新一次运行 → Artifacts** 中下载。

> Mac 打开未签名应用提示「已损坏」时，在终端执行：
> `xattr -cr /Applications/上班鼓励器.app`
