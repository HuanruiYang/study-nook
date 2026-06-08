# 手边书房

一个用 React + TypeScript + Vite 制作的个人阅读档案网页。可以记录书架、读后感、书摘、灵感碎片和年度阅读地图。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址，例如：

```text
http://localhost:5173
```

## 线上打开，不用 npm dev

项目已经配置为静态部署版本。上传 GitHub 后可以用 GitHub Pages 或 Vercel 直接打开网页，不需要每次运行 `npm run dev`。

### 方式一：GitHub Pages

1. 新建 GitHub 仓库。
2. 上传项目源码，但不要上传 `node_modules`、`dist`、`.env.local`、`screenshots`。
3. 进入仓库的 `Settings`。
4. 点击左侧 `Pages`。
5. 在 `Build and deployment` 里选择 `GitHub Actions`。
6. 推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动构建并发布。
7. 部署完成后，GitHub 会给出一个网页链接。

### 方式二：Vercel

1. 将项目上传到 GitHub。
2. 在 Vercel 导入这个仓库。
3. Framework 选择 `Vite`。
4. Build Command 使用默认的 `npm run build`。
5. Output Directory 使用默认的 `dist`。
6. 点击 Deploy。

## 数据存档说明

当前项目支持两种模式：

### 演示/本地存档模式

如果没有配置 Supabase，或设置：

```text
VITE_DEV_MODE=true
```

网页会自动进入演示模式。输入任意邮箱即可进入，数据保存在当前浏览器的 `localStorage` 里。

这种方式适合课程展示和个人本机使用，但换电脑、换浏览器后数据不会自动同步。

### 云端存档模式

如果要真正做到账号登录后线上存档，需要配置 Supabase：

```text
VITE_SUPABASE_URL=你的 Supabase 项目地址
VITE_SUPABASE_ANON_KEY=你的 Supabase anon key
VITE_DEV_MODE=false
```

注意：当前页面的数据读写仍以 `localStorage` 为主。Supabase 登录已经接入，但云端数据库读写需要继续补充数据表和数据层逻辑。

## 不要上传到 GitHub 的内容

```text
node_modules
dist
.env.local
screenshots
```

`.env.local` 里可能包含 Supabase 配置，不建议公开上传。可以上传 `.env.example` 作为示例。
