# Supabase 邮箱密码登录配置

前端已经改为邮箱 + 密码登录：

1. 新用户选择“注册”，输入邮箱和至少 6 位密码。
2. 老用户选择“登录”，输入同一邮箱和密码。
3. 登录成功后，数据继续按 Supabase `user.id` 做多端同步。

## GitHub Actions 环境变量

仓库 `Settings` -> `Secrets and variables` -> `Actions` -> `Repository secrets` 需要有：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Supabase Auth 设置

Supabase 项目后台：

`Authentication` -> `Providers` -> `Email`

建议设置：

```text
Email provider:
Enabled

Confirm email:
Disabled
```

关闭 `Confirm email` 后，注册账号不需要发送确认邮件，因此不依赖 SMTP，也不会再遇到 magic link 邮件发送失败的问题。

## 同步说明

多端同步不依赖登录方式。只要两台设备登录同一个 Supabase 账号，应用拿到的 `user.id` 就相同，书目、札记、摘录和灵感会同步到同一份云端数据。
