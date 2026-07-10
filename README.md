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

## 问题总结

记录开发与使用过程中遇到的关键问题及解决方案。

### 示例 1：本地开发完后请求接口提示跨域请求（CORS）失败

**问题描述**：前端调用 Worker API 时浏览器报跨域错误。

**原因**：Worker 响应头未添加 `Access-Control-Allow-Origin`。

**解决方案**：在 Worker 的 `fetch` 事件处理中添加 CORS 头。

### 示例 2：部署到cloudeFlare后，接口不通

**问题描述**：部署到 Cloudflare Pages 后后，接口不通失败，提示1301访问超时。

**原因**：网络不通，需要科学上网；。

**解决方案**：针对国内很少使用科学上网的方式访问网站；所以使用通的域名进行转接下。


## 最终成果
**前端项目地址**：https://github.com/zhouqi-7/cloudeflarefrontend

**后端项目地址**：https://github.com/zhouqi-7/cloudeflareback

**访问地址**：https://www.wasaihou666.kdns.fr/
