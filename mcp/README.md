# DailyHotApi MCP Server

Model Context Protocol (MCP) 服务器，为 DailyHotApi 提供工具，可通过 Claude Desktop 或 OpenClaw 访问 60+ 平台的热榜数据。

## 功能特性

- 列出所有可用的热榜平台
- 获取任意支持平台的热榜数据
- 内置 API 密钥认证
- 路由发现缓存（1小时）
- 可配置的 API 端点

## 快速部署

无需手动构建，直接使用 npx 运行：

```bash
npx -y @frankxia/dailyhot-mcp
```

或指定参数：

```bash
npx -y @frankxia/dailyhot-mcp --api-url http://localhost:6688 --api-key your-key
```

### 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--api-url` | DailyHotApi 服务器地址 | `http://localhost:6688` |
| `--api-key` | API 密钥 | (无) |
| `--port` | MCP 服务端口 | `3000` |

## 本地开发

```bash
cd mcp
npm install
npm run build
npm run dev
```

## 配置

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DAILYHOT_API_URL` | DailyHotApi 服务器地址 | `http://localhost:6688` |
| `DAILYHOT_API_KEY` | API 密钥 | (无) |

## 可用工具

### list_hot_platforms

列出所有可用的热榜平台。

**参数：**

- `api_key` (必填)：认证用 API 密钥

**返回：** 平台对象数组，包含 name、path、title、description。

### get_hot_list

获取指定平台的热榜数据。

**参数：**

- `api_key` (必填)：认证用 API 密钥
- `platform` (必填)：平台名称（如 bilibili、weibo、zhihu、github）
- `limit` (可选)：返回最大条目数（1-100）
- `no_cache` (可选)：跳过缓存获取最新数据

**返回：** 热榜数据，包含标题、总数和条目数组（标题、链接、热值等）。

## 支持平台

部分热门平台：

- `bilibili` - B站热门视频
- `weibo` - 微博热搜
- `zhihu` - 知乎热榜
- `douyin` - 抖音热点
- `baidu` - 百度热搜
- `github` - GitHub Trending
- `juejin` - 稀土掘金
- `v2ex` - V2EX
- `csdn` - CSDN排行榜
- `toutiao` - 今日头条
- 等等 40+ 平台...

使用 `list_hot_platforms` 获取完整列表。

## 客户端集成

### OpenClaw 集成

**配置文件路径：**

- **Linux**: `~/.openclaw/openclaw.json`
- **macOS**: `~/.openclaw/openclaw.json`
- **Windows**: `%USERPROFILE%\.openclaw\openclaw.json`

**配置示例：**

在 `mcp` 节点下添加：

```json
{
  "mcp": {
    "servers": {
      "dailyhot": {
        "command": "npx",
        "args": ["-y", "@frankxia/dailyhot-mcp"]
      },
      "env": {
        "DAILYHOT_API_URL": "http://localhost:6688",
        "DAILYHOT_API_KEY": ""
      }
    }
  }
}
```

验证：重启 OpenClaw 后提问"有哪些热榜平台？"

---

### OpenCode 集成

**配置文件路径：**

- **Linux**: `~/.config/opencode/opencode.json`
- **macOS**: `~/Library/Application Support/opencode/opencode.json`
- **Windows**: `%APPDATA%\opencode\opencode.json`

**配置示例：**

在 `mcp` 节点下添加：

```json
{
  "mcp": {
    "dailyhot": {
      "type": "local",
      "command": ["npx", "-y", "@frankxia/dailyhot-mcp"],
      "environment": {
        "DAILYHOT_API_URL": "http://localhost:6688",
        "DAILYHOT_API_KEY": ""
      }
    }
  }
}
```

验证：重启 OpenCode 后提问"有哪些热榜平台？"

---

### Claude Code 集成

Claude Code 是 VSCode 插件版本，配置文件位于 `~/.claude/settings.json`。

**配置文件路径：**

- **Linux/macOS**: `~/.claude/settings.json`
- **Windows**: `%USERPROFILE%\.claude\settings.json`

**配置示例：**

在 `mcpServers` 节点下添加：

```json
{
  "mcpServers": {
    "dailyhot": {
      "command": "npx",
      "args": ["-y", "@frankxia/dailyhot-mcp"],
      "env": {
        "DAILYHOT_API_URL": "http://localhost:6688",
        "DAILYHOT_API_KEY": "your-api-key"
      }
    }
  }
}
```

验证：重启 VSCode 后提问"有哪些热榜平台？"

---

