# Worker API 验证工具（前端）

基于 Vue 3 + Vite 的独立前端项目，用于向 Cloudflare Worker API 发送请求并验证返回数据。

## 目录结构

```
frontend/
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── index.html            # Vite 入口
├── src/
│   ├── main.ts           # 应用入口
│   ├── App.vue           # 根布局
│   ├── types.ts          # 类型定义
│   ├── composables/
│   │   └── useApiTest.ts # 核心逻辑（请求、断言、历史）
│   └── components/
│       ├── RequestPanel.vue   # URL 输入 + 预设按钮
│       ├── ResponsePanel.vue  # 原始数据 / 验证结果 / 类型推断
│       └── HistoryPanel.vue   # 请求历史
```

## 环境变量

| 变量 | 开发环境 | 生产环境 |
|------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8787` | Worker 部署后的 URL |

## 本地开发

需要同时启动前端和 Worker 两个服务：

```bash
# 终端 1 — 启动 Worker API
cd ../my-worker
npx wrangler dev

# 终端 2 — 启动前端页面
cd frontend
npm run dev
# 默认 http://localhost:3000
```

## 构建与部署

```bash
# 1. 构建
npm run build     # 产物在 dist/ 目录

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy dist

# 或通过 Cloudflare Dashboard 连接 Git 仓库自动部署
```

### 部署前注意事项

编辑 `.env.production`，将 `VITE_API_BASE_URL` 改为 Worker 实际的部署地址：

```
VITE_API_BASE_URL=https://my-worker.<你的子域名>.workers.dev
```