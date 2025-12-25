# Supabase Serverless 持久化迁移 - 2025-12-25

## 概述
将原先依赖本地文件系统（`fs` + `data/*.json`）的持久化层迁移为 Supabase Postgres，以支持 Netlify serverless 环境下的稳定运行。

## 代码变更

### 1) 新增服务端 Supabase Client
- 新增 `apps/web/lib/supabaseServer.ts`
  - 使用 `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  - 仅供服务端（API routes）使用，不应暴露到浏览器端

### 2) assessments / submissions 数据迁移
- 更新 `apps/web/lib/dataStore.ts`
  - 不再使用 `fs` 读写本地 JSON
  - 新增基于 Supabase 的读写方法：
    - `listAssessments()` / `getAssessmentById()` / `createAssessment()` / `upsertAssessment()` / `deleteAssessmentById()`
    - `listSubmissions()` / `getSubmissionById()` / `createSubmission()`
  - 新增 `ensureBundledAssessmentsSeeded()`：当数据库为空时，将仓库内 `data/*.json` 合并后写入 `assessments` 表（便于冷启动与迁移）

### 3) profiles（用户资料）迁移
- 更新 `apps/web/lib/userStore.ts`
  - 不再使用 `fs` 读写 `users.json`
  - 改为写入 `profiles` 表，`data` 字段保存 `User` 对象（jsonb）

### 4) API routes 切换为 Supabase
- 更新：
  - `apps/web/pages/api/assessments/index.ts`
  - `apps/web/pages/api/assessments/[id].ts`
  - `apps/web/pages/api/submissions/index.ts`
  - `apps/web/pages/api/submissions/[id].ts`

### 5) 依赖更新
- 更新 `apps/web/package.json`
  - 新增依赖：`@supabase/supabase-js`

## Supabase 建表 SQL（在 Supabase SQL Editor 执行）

```sql
create table if not exists public.assessments (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists assessments_id_idx on public.assessments (id);

create table if not exists public.submissions (
  id text primary key,
  assessment_id text not null references public.assessments(id) on delete restrict,
  user_id text null,
  respondent jsonb not null,
  answers jsonb not null,
  result_summary text not null,
  detailed_result jsonb null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists submissions_assessment_id_idx on public.submissions (assessment_id);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
```

## 环境变量
在 Netlify（或本地）设置：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 安全说明
当前实现使用 `service_role_key` 以便后端直接读写表；后续建议迁移到 **Supabase Auth + RLS**，并在服务端仅执行“必要最小权限”的操作。
