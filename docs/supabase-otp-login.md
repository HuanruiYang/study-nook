# Supabase 邮箱验证码登录配置

前端已经使用邮箱验证码流程：

1. 用户输入邮箱。
2. Supabase 发送 6 位验证码。
3. 用户在登录页输入验证码。
4. 前端调用 `verifyOtp` 完成登录。

## GitHub Actions 环境变量

仓库 `Settings` -> `Secrets and variables` -> `Actions` -> `Repository secrets` 需要有：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## URL Configuration

Supabase 项目后台：

`Authentication` -> `URL Configuration`

建议填写：

```text
Site URL:
https://huanruiyang.github.io/study-nook/

Redirect URLs:
https://huanruiyang.github.io/study-nook/
```

虽然当前主流程已经改为输入验证码，但保留正确的 URL 配置可以兼容旧邮件链接和后续移动端回跳。

## 邮件模板

Supabase 项目后台：

`Authentication` -> `Emails` -> `Magic Link`

把模板内容改成显示 `{{ .Token }}`，不要只放 `{{ .ConfirmationURL }}`。

可用的简洁模板：

```html
<h2>手边书房验证码</h2>
<p>你的登录验证码是：</p>
<p style="font-size: 28px; letter-spacing: 6px; font-weight: 700;">{{ .Token }}</p>
<p>验证码将在几分钟后过期。如果不是你本人操作，可以忽略这封邮件。</p>
```

保存后，重新在网页里点击“发送验证码”。旧邮件不用再试。
