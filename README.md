# 人格测试咨询平台

这是一个基于Next.js的人格测试咨询应用，专注于帮助用户深入了解自己的性格特质。

## 功能特点

- **个性化洞察**: 精选的人格测试，帮助理解沟通和协作风格
- **成长追踪**: 监测自我认知随时间的演变
- **响应式设计**: 针对所有设备进行了优化
- **交互式UI**: 流畅的动画和引人入胜的用户体验
- **科学权威**: 基于权威心理学理论的人格测试

## 支持的人格测试

- **MBTI (迈尔斯-布里格斯性格类型指标)**: 通过四个维度了解性格偏好
- **Big Five (大五人格)**: 测量开放性、尽责性、外向性、宜人性和神经质
- **DISC (行为风格测评)**: 识别支配型、影响型、稳健型和谨慎型
- **Enneagram (九型人格)**: 发现核心动机和行为模式
- **EQ (情商评估)**: 评估情绪感知、理解、管理和运用能力

## 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: CSS Modules + Tailwind CSS
- **动画**: Framer Motion
- **部署**: Docker

## 开始使用

### 本地开发

1. 进入web应用目录:
   ```bash
   cd apps/web
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 运行开发服务器:
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### Docker

使用Docker Compose构建并运行容器:

```bash
docker-compose up --build
```

## 项目结构

- `apps/web/`: 主Next.js应用代码
  - `pages/`: Next.js页面和API路由
  - `components/`: UI组件
  - `styles/`: 全局和模块CSS文件
  - `data/`: 静态数据或内容
  - `lib/`: 共享库和工具
  - `contexts/`: React上下文
  - `utils/`: 工具函数

## 许可证

MIT
