# Cloudflare Workers 一键部署指南

## 📌 前置准备

1. **拥有 Cloudflare 账号** - [注册地址](https://dash.cloudflare.com/sign-up)
2. **创建 Cloudflare API Token**
   - 访问 [Cloudflare API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
   - 点击 "Create Token"
   - 选择 "Edit Cloudflare Workers" 模板
   - 权限设置:
     - `Account` → `Workers Scripts` → `Edit`
     - `Account` → `Workers KV Storage` → `Edit`
     - `Zone` → `Workers Routes` → `Edit`
   - 点击 "Continue to summary" → "Create Token"
   - **复制并保存 Token**（只显示一次！）

---

## 🚀 方式一：GitHub Actions 自动部署（推荐）

### 步骤 1：Fork 本项目

点击右上角的 "Fork" 按钮，将项目复制到你的 GitHub 账号下。

### 步骤 2：创建 KV 命名空间

在你的电脑上执行：

```bash
# 安装 wrangler（如果还没装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 KV 命名空间
wrangler kv:namespace:create DAILYHOT_CACHE
```

执行后会输出类似这样的内容：
```
✨ Success!
Namespace: DAILYHOT_CACHE
ID: your-kv-namespace-id-here
```

**复制这个 ID**，下一步需要。

### 步骤 3：配置 GitHub Variables 和 Secrets

在你的 Fork 仓库页面：

#### 配置 Variables（变量）
1. 点击 "Settings" → "Secrets and variables" → "Actions"
2. 切换到 "Variables" 标签页
3. 点击 "New repository variable"
4. 添加以下 Variable：

| Variable Name | Value |
|---------------|-------|
| `KV_NAMESPACE_ID` | 你在步骤 2 中获取的 KV 命名空间 ID |

#### 配置 Secrets（密钥）
1. 切换回 "Secrets" 标签页
2. 点击 "New repository secret"
3. 添加以下 Secret：

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | 你在前置准备中获取的 API Token |

### 步骤 4：触发部署

推送代码到 main/master 分支，或者：
1. 点击 "Actions"
2. 选择 "Deploy to Cloudflare Workers"
3. 点击 "Run workflow" → 选择分支 → 点击 "Run workflow"

### 完成！

部署成功后，你会在 Cloudflare Dashboard → Workers & Pages 看到你的 Worker。

---

## 💻 方式二：使用 Wrangler CLI 手动部署

### 步骤 1：克隆项目

```bash
git clone https://github.com/你的用户名/DailyHotApi.git
cd DailyHotApi
```

### 步骤 2：安装依赖

```bash
pnpm install
```

### 步骤 3：登录 Cloudflare

```bash
npx wrangler login
```

### 步骤 4：创建 KV 命名空间

```bash
npx wrangler kv:namespace:create DAILYHOT_CACHE
```

复制输出的 ID。

### 步骤 5：修改 wrangler.toml

将 KV 命名空间 ID 填入 `wrangler.toml`。

### 步骤 6：部署

```bash
npm run deploy:worker
# 或者
npx wrangler deploy
```

---

## ⚙️ 环境变量配置

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables and Secrets 添加：

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CACHE_TTL` | 缓存过期时间（秒） | `3600` | No |
| `REQUEST_TIMEOUT` | 请求超时时间（毫秒） | `6000` | No |
| `ALLOWED_DOMAIN` | CORS 允许的域名 | `*` | No |
| `ALLOWED_HOST` | 允许的主机 | `imsyy.top` | No |
| `RSS_MODE` | 是否启用 RSS 模式 | `false` | No |
| `FILTER_WEIBO_ADVERTISEMENT` | 是否过滤微博广告 | `false` | No |
| `ZHIHU_COOKIE` | 知乎 Cookie（可选） | - | No |

---

## 🌐 自定义域名（可选）

### 通过 wrangler.toml 配置

编辑 `wrangler.toml`，添加：

```toml
routes = [
  { pattern = "dailyhot.your-domain.com", zone_name = "your-domain.com" }
]
```

### 通过 Cloudflare Dashboard 配置

1. 进入 Workers & Pages → 你的 Worker
2. 点击 "Triggers" → "Custom Domains"
3. 点击 "Add Custom Domain"
4. 输入你的域名，按提示操作

---

## ✅ 验证部署

部署完成后，访问你的 Worker URL，应该能看到 DailyHotApi 的首页！

### 测试 API

```bash
# 获取所有热榜
curl https://your-worker.workers.dev/all

# 获取微博热榜
curl https://your-worker.workers.dev/weibo

# 获取知乎热榜
curl https://your-worker.workers.dev/zhihu
```

---

## ❓ 常见问题

### Q: 如何查看部署日志？

使用命令：
```bash
wrangler tail
```

或者在 Cloudflare Dashboard 查看。

### Q: 如何更新部署？

推送代码到 main/master 分支，GitHub Actions 会自动部署。

### Q: 部署成本如何？

Cloudflare Workers 免费版每天有 100,000 次请求额度，对于大多数场景完全够用！

### Q: 如何删除 Worker？

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Delete。

### Q: Variables 和 Secrets 有什么区别？

- **Variables** - 公开的变量，任何人可以在 Actions 日志中看到
- **Secrets** - 加密的密钥，不会在日志中显示

KV 命名空间 ID 不是敏感信息，所以用 Variables 即可。
