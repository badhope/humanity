# Humanity - 人类测评平台

[![GitHub Pages](https://img.shields.io/badge/部署-GitHub Pages-blue?style=flat-square)](https://badhope.github.io/humanity)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-blue?style=flat-square)](https://vitejs.dev/)

## 项目简介

Humanity 是一个专业的在线测评平台，专注于"与人相关"的各类测评内容，包括人格类型、心理特质、认知能力、价值观与职业倾向等。

当前已内置 **5 套 MVP 题库**：
- 🧠 MBTI 职业性格测试
- 💆 压力指数评估
- 🔬 逻辑思维评估
- ⚖️ 价值观光谱
- 💼 霍兰德职业兴趣测试

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v6
- **状态管理**: Zustand
- **本地数据库**: Dexie.js (IndexedDB)
- **样式**: Tailwind CSS
- **动画**: Framer Motion + GSAP + Three.js
- **图表**: Recharts + D3.js + Chart.js
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 `http://localhost:5173`

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览构建

```bash
npm run preview
```

## 部署到 GitHub Pages

项目已配置 GitHub Actions，push 到 `main` 分支后自动部署。

部署地址: https://badhope.github.io/humanity/

## 项目结构

```
src/
├── components/       # UI 组件
│   ├── 3d/          # Three.js 3D 背景
│   ├── atoms/       # 基础原子组件
│   ├── charts/      # 图表组件
│   └── molecules/   # 分子组件
├── features/        # 功能模块
│   ├── animation/   # 动画配置
│   ├── assessment/  # 测评引擎
│   ├── storage/     # 数据库
│   └── theme/       # 主题管理
├── pages/           # 页面
├── shared/          # 共享资源
│   ├── constants/   # 常量
│   ├── types/       # 类型定义
│   └── utils/       # 工具函数
├── store/           # Zustand 状态管理
└── styles/          # 全局样式

public/
└── assessments/    # 题库文件
    ├── registry.json       # 题库索引
    ├── personality/        # 人格类题库
    ├── psychology/         # 心理类题库
    ├── cognition/          # 认知类题库
    ├── ideology/           # 价值观类题库
    └── career/             # 职业类题库
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 平台介绍 |
| `/categories` | 测评分类 | 五大测评分类入口 |
| `/assessments/:category` | 测评列表 | 按分类查看可用测评 |
| `/quiz/:slug` | 答题页面 | 进行测评答题 |
| `/results/:assessmentId` | 结果页面 | 查看测评结果 |
| `/history` | 历史记录 | 测评历史 |
| `/profile` | 个人中心 | 用户设置 |

## 题库系统

### 题库结构

每套题库 JSON 包含以下核心字段：

```typescript
interface AssessmentDefinition {
  id: string;           // 唯一标识
  slug: string;         // URL 友好标识
  name: string;         // 题库名称
  category: string;     // 分类
  dimensions: [];       // 测评维度
  resultProfiles: [];   // 结果配置
  questions: [];        // 题目列表
}
```

### 添加新题库

1. 在 `public/assessments/<category>/` 下创建新的 `.json` 文件
2. 在 `registry.json` 中添加题库索引条目
3. 题库将自动出现在对应的分类列表中

### 题库格式示例

```json
{
  "id": "my-assessment",
  "slug": "my-assessment",
  "name": "我的测评",
  "category": "personality",
  "dimensions": [...],
  "resultProfiles": [...],
  "questions": [...]
}
```

## 功能特性

- ✨ 深色/浅色主题切换
- 🎨 动画强度可调节（支持减少动画模式）
- 📊 多维度测评结果分析
- 💾 本地历史记录存储
- 📱 响应式设计

## 开发指南

### 添加新题库

1. 复制 `public/assessments/` 下现有题库作为模板
2. 修改题目内容和配置
3. 更新 `registry.json` 添加索引
4. 题库自动可用

### 扩展题型

当前支持的题型：
- `single-choice` - 单选题
- `likert-5` - 五点量表

未来可扩展：
- 多选题
- 排序题
- 图形题

## License

MIT
