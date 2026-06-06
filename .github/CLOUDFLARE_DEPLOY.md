# Cloudflare Workers 一键部署指南

## 方式一：使用 GitHub Actions 自动部署（推荐）

### 1. Fork 项目
点击右上角的 "Fork" 按钮，将项目复制到你的 GitHub 账号下。

### 2. 获取 Cloudflare 凭证

#### 获取 API Token
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → "我的个人资料" → "API Tokens"
3. 点击 "Create Token"
4. 选择 "Edit Cloudflare Workers" 模板
5. 权限设置：
   - Account > Workers Scripts > Edit
   - Account > Workers KV Storage > Edit
   - Zone > Workers Routes > Edit
6. 点击 "Continue to summary" → "Create Token"
7. **复制并保存好 Token（只显示一次！）**

#### 获取 Account ID
1. 在 Cloudflare Dashboard 中，点击右上角的账号名称
2. 复制 Account ID

### 3. 配置 GitHub Secrets

在你的 Fork 仓库中：
1. 点击 "Settings" → "Secrets and variables" → "Actions"
2. 点击 "New repository secret"
3. 添加以下 Secrets：

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | 上一步获取的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

### 4. 触发部署

有两种方式触发部署：

**方式 A：推送代码（推荐）**
```bash
git add .
git commit -m "Deploy to Cloudflare Workers"
git push
```

**方式 B：手动触发**
1. 进入你的仓库
2. 点击 "Actions"
3. 选择 "Deploy to Cloudflare Workers"
4. 点击 "Run workflow" → 选择分支 → 点击 "Run workflow"

---

## 方式二：使用 Wrangler CLI 手动部署

### 前置条件
- Node.js 20+
- 一个 Cloudflare 账号

### 部署步骤

1. **克隆项目**
```bash
git clone <你的仓库地址>
cd DailyHotApi
```

2. **安装依赖**
```bash
npm install
```

3. **登录 Cloudflare**
```bash
npx wrangler login
```

4. **创建 KV 命名空间**
```bash
npx wrangler kv namespace create DAILYHOT_CACHE
```

5. **更新 wrangler.toml**
将上一步输出的 KV Namespace ID 填入 `wrangler.toml`：
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "你的_KV_NAMESPACE_ID"
preview_id = "你的_KV_NAMESPACE_ID"
```

6. **部署**
```bash
npm run deploy:worker
```

---

## 环境变量配置

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables and Secrets 中添加以下变量：

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

## 自定义域名（可选）

### 1. 通过 wrangler.toml 配置
编辑 `wrangler.toml`，添加：
```toml
routes = [
  { pattern = "dailyhot.your-domain.com", zone_name = "your-domain.com" }
]
```

### 2. 通过 Cloudflare Dashboard 配置
1. 进入 Workers & Pages → 你的 Worker
2. 点击 "Triggers" → "Custom Domains"
3. 点击 "Add Custom Domain"
4. 输入你的域名，按提示操作

---

## 验证部署

部署完成后，访问你的 Worker URL，应该看到 DailyHotApi 的首页！

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

## 常见问题

### Q: 部署失败，提示 KV 错误
A: 确保你的 API Token 有 KV 存储权限，并且 wrangler.toml 中的 KV ID 正确。

### Q: 如何查看日志
A: 使用命令 `npx wrangler tail` 或在 Cloudflare Dashboard 中查看。

### Q: 如何更新部署
A: 推送代码到 main/master 分支，GitHub Actions 会自动部署。

### Q: 部署成本如何
A: Cloudflare Workers 免费版每天有 100,000 次请求额度，对于大多数场景完全够用！
