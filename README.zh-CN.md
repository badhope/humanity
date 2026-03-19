# HumanOS

[English](./README.md) | 中文

---

## 项目名称

**HumanOS** - 自我探索测评平台

## 一句话简介

一个基于可扩展 JSON 题库系统的静态网页平台，提供人格、心理、认知与职业倾向等多元化测评服务。

## 当前版本

**v1.0.0** - MBTI MVP Release (2026-03-19)

## 当前产品策略

HumanOS 遵循**"单模块优先"**的开发策略：

1. **MBTI 是当前主要完整可用模块** - 提供从答题到结果的完整闭环体验
2. 其他模块正处于内容储备与逐步开放阶段
3. 每个模块遵循：内容基础 → 题库建设 → 结果页 → 分享/导出

这一策略确保每个测评类型都能提供精致、完整的体验，再逐步扩展到下一个模块。

---

## 已完成内容

| 功能 | 状态 | 说明 |
|------|------|------|
| MBTI 测评 | ✅ 已完成 | 从答题到详细结果的完整闭环 |
| 题库注册系统 | ✅ 已完成 | 基于 JSON 的动态加载系统 |
| 5 大测评分类 | ✅ 已完成 | 人格、心理、认知、价值观、职业 |
| 8 套题库 | ✅ 已完成 | 内容储备就绪，等待接入 |
| 本地数据存储 | ✅ 已完成 | 答题历史与设置的持久化 |
| GitHub Pages 部署 | ✅ 已完成 | 自动化 CI/CD 流水线 |
| HashRouter 配置 | ✅ 已完成 | 支持 GitHub Pages 子目录部署 |

---

## 当前开放状态

### 主打模块（完整可用）

| 测评 | 题数 | 状态 |
|------|------|------|
| MBTI 职业性格测试 | 40 | ✅ 完整可用 - 包含详细结果、维度分析、个性化建议 |

### 其他模块（可答题，结果页制作中）

| 测评 | 题数 | 状态 |
|------|------|------|
| 压力指数评估 | 12 | 🔧 可答题，结果页制作中 |
| 心理韧性评估 | 16 | 🔧 可答题，结果页制作中 |
| 逻辑思维评估 | 10 | 🔧 可答题，结果页制作中 |
| 注意力与思维风格 | 15 | 🔧 可答题，结果页制作中 |
| 价值观光谱 | 12 | 🔧 可答题，结果页制作中 |
| 霍兰德职业兴趣测试 | 18 | 🔧 可答题，结果页制作中 |
| 工作方式偏好 | 15 | 🔧 可答题，结果页制作中 |

---

## 核心功能

- **动态题库加载** - 基于 JSON 的可扩展题库系统
- **多种题型支持** - 单选、多选、Likert量表、排序
- **本地优先数据** - 所有数据存储在浏览器 localStorage 中（无需后端）
- **响应式设计** - 移动端友好，支持深色模式
- **3D 视觉体验** - Three.js 沉浸式背景效果
- **流畅动画** - Framer Motion 驱动的页面过渡
- **多维度分析图表** - 雷达图、柱状图、分布图可视化
- **分类组织** - 5 大测评分类体系

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 路由 | React Router v6 (HashRouter) |
| 状态管理 | Zustand |
| 数据库 | Dexie (IndexedDB 封装) |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion + GSAP + Three.js |
| 图表 | Recharts + D3.js + Chart.js |
| 图标 | Lucide React |
| UI 组件 | Radix UI 基础组件 |
| 部署 | GitHub Pages (静态部署) |

---

## 项目结构

```
HumanOS/
├── public/
│   └── assessments/              # 测评题库目录
│       ├── registry.json         # 题库中央注册表
│       ├── personality/
│       │   └── mbti-basic.json   # MBTI 题库（40 题）
│       ├── psychology/
│       │   ├── stress-check.json      # 压力评估
│       │   └── resilience-basic.json  # 心理韧性
│       ├── cognition/
│       │   ├── logic-lite.json        # 逻辑思维
│       │   └── focus-style.json       # 注意力风格
│       ├── ideology/
│       │   └── values-spectrum.json  # 价值观光谱
│       └── career/
│           ├── holland-basic.json     # 霍兰德职业兴趣
│           └── work-style-basic.json  # 工作方式偏好
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   └── ImmersiveBackground.tsx    # Three.js 3D 背景
│   │   ├── atoms/                         # 基础原子组件
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── Progress.tsx
│   │   ├── charts/                        # 图表组件
│   │   │   ├── BarAnalysisChart.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   └── RadarChartCard.tsx
│   │   └── molecules/                     # 分子组件
│   │       ├── AssessmentCard.tsx
│   │       ├── CategoryCard.tsx
│   │       └── PageTransition.tsx
│   ├── features/
│   │   └── assessment/
│   │       ├── engine.ts       # 通用测评引擎
│   │       ├── registry.ts     # 题库注册与加载
│   │       └── scoring.ts      # MBTI 专用评分
│   ├── pages/
│   │   ├── AssessmentList.tsx   # 测评列表页
│   │   ├── Categories.tsx      # 测评分类页
│   │   ├── Home.tsx            # 首页
│   │   ├── Maintenance.tsx     # 维护中页面
│   │   ├── NotFound.tsx        # 404 页面
│   │   ├── Profile.tsx         # 个人中心
│   │   ├── Quiz.tsx             # 答题页面
│   │   └── Results.tsx          # MBTI 结果页面
│   ├── shared/
│   │   ├── constants/          # 分类常量定义
│   │   ├── types/              # TypeScript 类型定义
│   │   │   └── assessment.ts   # 测评类型定义
│   │   └── utils/              # 工具函数
│   ├── store/
│   │   ├── quizStore.ts        # 答题状态管理
│   │   └── settingsStore.ts     # 设置状态管理
│   ├── App.tsx                  # 根组件
│   └── main.tsx                 # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── index.html
├── package.json
└── vite.config.ts
```

---

## 题库系统说明

### 题库架构

每套测评都是一个独立的 JSON 文件，包含：

- **元数据** - id、slug、name、version、author
- **维度定义** - 评分维度及其描述
- **题目列表** - 题目内容、选项、评分值
- **结果画像** - 结果类型及其匹配条件
- **评分规则** - 权重与归一化配置

### registry.json 结构

```json
{
  "version": "1.0.0",
  "assessments": [
    {
      "id": "mbti-basic",
      "slug": "mbti-basic",
      "name": "MBTI 职业性格测试",
      "category": "personality",
      "filePath": "assessments/personality/mbti-basic.json",
      "status": "active"
    }
  ]
}
```

### 题目 JSON 结构

```json
{
  "id": "mbti-q1",
  "text": "在社交场合中，您通常会：",
  "type": "single-choice",
  "dimension": "EI",
  "options": [
    { "id": "A", "text": "主动与陌生人交谈", "value": 3 },
    { "id": "B", "text": "与熟悉的人聊天", "value": 1 },
    { "id": "C", "text": "观察别人，等待别人来接近", "value": -1 },
    { "id": "D", "text": "一个人安静地待着", "value": -3 }
  ]
}
```

### 新增题库步骤

1. 在 `public/assessments/<category>/` 下创建 JSON 文件
2. 定义 dimensions、questions、resultProfiles
3. 在 `registry.json` 中添加条目
4. 更新 `AssessmentList.tsx` 中的 `COMPLETED_MODULES` 数组以启用访问
5. 实现结果页或使用维护中占位页

---

## 本地数据与存储设计

### 存储策略

| 数据类型 | 存储方式 | Key 模式 |
|----------|----------|----------|
| 答题结果 | localStorage | `quiz_result_{assessmentId}` |
| 用户设置 | Zustand + localStorage | `humanity_settings` |
| 答题草稿 | localStorage | `quiz_draft_{assessmentId}` |

### 数据流程

1. 用户开始答题 → `quizStore` 初始化
2. 答案保存到 `quizStore`（内存）
3. 答题完成 → 结果保存到 localStorage
4. 结果页从 localStorage 读取数据展示
5. 个人中心页从 localStorage 读取历史记录

### 无后端

这是一个纯静态应用。所有数据都保存在用户的浏览器中。目前没有：
- 用户认证系统
- 云端同步功能
- 服务端数据处理
- 数据与特定浏览器/设备绑定

---

## 当前用户流程

```
首页 → 分类页 → 测评列表 → 答题页 → 结果页
                              ↓
                         个人中心（历史记录）
```

### 可用路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 平台介绍、开始测评入口 |
| `/categories` | 分类页 | 5 大测评分类入口 |
| `/assessments/:category` | 测评列表 | 按分类查看可用测评 |
| `/quiz/:assessmentId` | 答题页 | 进行测评答题 |
| `/results/:assessmentId` | 结果页 | MBTI 完整结果页（其他模块显示完成提示） |
| `/profile` | 个人中心 | 历史记录、设置 |
| `/maintenance` | 维护页 | 模块维护中提示 |

---

## 开发注意事项

### 关键实现细节

- **HashRouter**: 必需，用于 GitHub Pages 子目录部署（`/humanity/`）
- **动态加载**: 题库通过 fetch 在运行时动态加载
- **类型安全**: 完整的 TypeScript 类型覆盖
- **响应式**: Tailwind CSS 移动优先方案
- **深色模式**: 系统偏好检测 + 手动切换

### 题库加载流程

```
fetchAssessmentBySlug(slug)
  → getAssessmentBySlug(slug) [从 registry 获取]
  → fetchAssessmentDefinition(filePath) [fetch JSON]
  → AssessmentDefinition [类型化返回]
```

### 评分架构

- **通用引擎**: `engine.ts` - 维度评分计算
- **MBTI 专用**: `scoring.ts` - MBTI 类型推导与画像匹配
- **可扩展**: 可按测评类型添加新的评分方法

---

## 后续开发路线图

### 第一阶段：完成当前模块（进行中）

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P0 | 通用结果页 | 🔧 进行中 |
| P0 | 个人中心历史集成 | 🔧 进行中 |
| P1 | 各模块独立结果页 | 📋 计划中 |
| P1 | 答题草稿自动保存 | 📋 计划中 |

### 第二阶段：功能扩展

| 优先级 | 功能 | 状态 |
|--------|------|------|
| P2 | 数据中心/历史管理 | 📋 计划中 |
| P2 | 设置中心（主题、语言、字体） | 📋 计划中 |
| P2 | 答题进度持久化 | 📋 计划中 |
| P2 | 分享功能 | 📋 计划中 |

### 第三阶段：高级功能

| 优先级 | 功能 | 状态 |
|--------|------|------|
| P3 | AI 报告解读 | 📋 计划中 |
| P3 | PDF 导出 | 📋 计划中 |
| P3 | 海报生成 | 📋 计划中 |
| P3 | 历史趋势图表 | 📋 计划中 |
| P3 | 用户系统与云同步 | 📋 未来 |

---

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/badhope/humanity.git
cd humanity

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run format` | 使用 Prettier 格式化代码 |

---

## 构建与部署

### 生产构建

```bash
npm run build
```

产物输出到 `dist/` 目录。

### 部署到 GitHub Pages

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发：
   - 运行 `npm run build`
   - 部署到 `https://badhope.github.io/humanity/`

**注意**：项目使用 HashRouter，所有路由在 `/humanity/` 子目录下正常工作。

---

## 已知限制

### 当前限制

1. **结果页仅支持 MBTI**：`/results/:assessmentId` 目前仅 MBTI 有完整结果，其他测评答题完成后显示"测评完成"提示
2. **仅本地存储**：历史记录与浏览器/设备绑定，无云端同步
3. **无用户系统**：纯静态应用，无登录注册功能
4. **无 AI 分析**：报告为预定义，非 AI 生成
5. **无导出功能**：暂无 PDF、海报、分享等功能

### 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 环境说明

- 纯前端静态站点
- 无需后端服务器
- 无需数据库服务器
- 所有数据存储在浏览器 localStorage 中

---

## 开源许可

MIT License - 详见 [LICENSE](LICENSE) 文件。
