# 目录结构与 Netlify 部署迁移 - 2025-12-25

## 概述
将 Next.js 工程从仓库根目录下的 `app/` 迁移为标准化的 `apps/web/` 结构，并补齐 Netlify（serverless）部署所需的基础配置。

## 变更内容

### 1. 目录结构调整
- 将 `app/` 迁移为 `apps/web/`
- 新增 `apps/` 目录

### 2. Docker 本地部署路径修复
- 更新 `docker-compose.yml`：`build.context` 从 `./app` 改为 `./apps/web`

### 3. 忽略文件路径修复
- 更新仓库根 `.gitignore`：将 `app/node_modules/`、`app/.next/`、`app/out/` 替换为 `apps/web/node_modules/`、`apps/web/.next/`、`apps/web/out/`

### 4. 文档更新
- 更新 `README.md`：本地开发目录从 `cd app` 改为 `cd apps/web`，并同步更新项目结构说明

### 5. 脚本路径修复
- 更新 `apps/web/package.json`：`deploy` 脚本的 compose 文件路径从 `../docker-compose.yml` 改为 `../../docker-compose.yml`

### 6. Netlify 构建配置
- 新增仓库根 `netlify.toml`：指定 `apps/web` 为构建基目录，并启用 `@netlify/plugin-nextjs`
- 更新 `apps/web/next.config.mjs`：在 Netlify 环境下不再强制 `output: 'standalone'`

## 影响范围
- 本地开发：需要在 `apps/web` 目录内执行 `npm install` / `npm run dev`
- Docker：继续使用仓库根 `docker-compose.yml`
- Netlify：以仓库根配置为准，构建基目录为 `apps/web`
