# CampusLoop

校园闲置物品浏览与发布的前端演示应用（纯前端）。列表与公告以 Mock 为主，发布、收藏、草稿等数据写入浏览器 **localStorage**，刷新后部分状态会保留。

## 技术栈

- Vue 3、Vite 8、Vue Router 4、Pinia  
- Element Plus（中文、明暗主题）  
- Axios、SCSS  
- `unplugin-auto-import` / `unplugin-vue-components`（Element Plus 按需与自动导入）

## 功能概览

- 闲置列表：表格（`ElTableV2` 虚拟滚动）与卡片网格（窗口化渲染 + 图片懒加载）、筛选排序、条件同步 **URL**  
- 商品详情、发布、个人中心、交易指南、校园公告  
- 顶栏：公告未读角标、明暗模式（持久化）

## 本地运行

```bash
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## 环境变量

可选：在项目根目录创建 `.env` / `.env.local`，配置接口基地址（未配置时默认为 `/api`）：

```env
VITE_API_BASE=https://your-api.example.com
```

## 目录结构（简要）

```
src/
  api/          # Axios 实例与 campusApi（Mock 等）
  assets/       # 全局样式
  composables/  # 组合式函数（如卡片网格虚拟化）
  router/       # 路由与懒加载
  stores/       # Pinia 状态
  views/        # 页面视图
```

## 说明

本项目为 **演示用途**，未接真实后端；对接接口时可复用 `src/api/http.js` 与现有页面结构。
