# 手边书房移动端发布路线

## 当前已完成：PWA 可安装版本

这一版已经加入 Web App Manifest、移动端浏览器元信息、应用图标和 Service Worker。部署到 GitHub Pages 后，可以先作为 PWA 使用：

1. 用手机浏览器打开线上地址。
2. 使用“邮箱 + 密码”注册或登录同一个账号，确认云端同步正常。
3. iPhone 在 Safari 里选择“分享” -> “添加到主屏幕”。
4. Android 在 Chrome 里选择“安装应用”或“添加到主屏幕”。

PWA 版本不需要应用商店审核，适合先快速内测。

## 使用方式

线上地址：

```text
https://huanruiyang.github.io/study-nook/
```

首次使用：

1. 打开网页，切到“注册”。
2. 输入邮箱和至少 6 位密码。
3. 进入书房后添加书籍、札记、摘录或灵感。
4. 在另一台手机或电脑打开同一地址，用同一邮箱和密码登录。
5. 登录后会自动拉取同一账号下的云端数据。

如果已经安装到手机主屏幕，但看到的仍然是旧验证码登录页，请完全关闭手机里的“手边书房”窗口后重新打开；仍未更新时，在浏览器里打开线上地址刷新一次，再重新从主屏幕进入。

## 下一步：打包 Android / iOS App

推荐用 Capacitor 包住当前 React/Vite 应用。它可以复用现有前端代码、Supabase 登录和云同步逻辑。

当前仓库已经加入 Android Capacitor 项目和 GitHub Actions 打包流程。推送到 `main` 后，GitHub 会运行 `Build Android APK` workflow，并生成一个调试安装包：

```text
study-nook-debug-apk / app-debug.apk
```

下载方式：

1. 打开 GitHub 仓库。
2. 进入 `Actions`。
3. 点击最新的 `Build Android APK` 运行记录。
4. 在页面底部 `Artifacts` 下载 `study-nook-debug-apk`。
5. 解压后得到 `app-debug.apk`。
6. 把 APK 发到安卓手机，允许“安装未知来源应用”后安装。

这个 APK 是调试版，适合自己测试，不适合作为正式上架包。正式发布需要生成 release APK/AAB 并签名。

后续需要在本机安装移动端工具链：

- Android：Android Studio、JDK、Android SDK
- iOS：macOS、Xcode、Apple Developer 账号

建议命令流程：

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npm install @capacitor/ios
npx cap init "手边书房" com.study.nook --web-dir=dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

之后可以用 Android Studio 或 Xcode 打开原生项目，生成安装包并上架。

## 微信小程序适配

微信小程序不能直接运行当前 DOM 版 React 页面，因此需要单独做一层适配。推荐路线是 Taro React：

1. 保留当前 Web 版本作为 H5/PWA/App 的主线。
2. 把类型、数据读写、Supabase 同步等通用逻辑逐步抽到可共享模块。
3. 新建 Taro 小程序壳，重写页面层和组件层。
4. 登录方式需要改成微信生态下的登录流程，后端再绑定 Supabase 用户或自建用户表。

小程序适配的主要风险：

- 不能直接使用浏览器 DOM API。
- `localStorage`、文件导入、下载、路由、弹窗等能力都要换成微信 API。
- 邮箱密码登录可以复用账号体系，但正式小程序最好接入微信登录并绑定 Supabase 用户。
- 上架需要微信小程序账号、备案/认证以及类目审核。

## 建议优先级

1. 先把 PWA 作为手机内测版跑通。
2. 确认核心流程：登录、导入、添加书、写批注、跨设备同步。
3. 再打 Android 安装包。
4. 最后做微信小程序适配，因为它不是简单打包，需要重写一部分前端。
