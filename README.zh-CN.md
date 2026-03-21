# HumanOS

<!-- badges -->
[![版本](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/HumanOS/HumanOS-1)
[![状态](https://img.shields.io/badge/status-platform%20stabilization-green.svg)](./docs/architecture.md)
[![类型](https://img.shields.io/badge/type-assessment%20platform-purple.svg)](./docs/content-system.md)
[![框架](https://img.shields.io/badge/framework-React%2018-61dafb.svg)](https://react.dev)
[![构建](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/HumanOS/HumanOS-1/actions)

[English](./README.md) | [中文](./README.zh-CN.md)

---

## ✨ 用科学的方式，探索真实的自己

> _一个专注于自我反思的避风港 — 完全运行在你的浏览器中。_

HumanOS 是一个**本地优先、模块化设计的人类测评平台**，致力于深度的自我探索。平台提供人格、心理、认知和职业等多个维度的测评——全程零数据收集、零追踪、完全隐私保护。

平台基于**注册中心驱动的插件架构**，使测评、题型和结果可视化的扩展变得轻而易举，同时保持企业级的稳定性。

---

## 🌟 平台亮点

| 特性 | 说明 |
|---------|-------------|
| 🔒 **完全隐私** | 所有数据始终保存在你的浏览器中，永不离开 |
| 🎨 **模块化设计** | 无需改动核心代码即可添加新测评 |
| ✅ **验证优先** | 每个题库都在构建时通过 Schema 验证 |
| 📦 **静态部署** | 可部署到任何平台，无需后端服务器 |
| 🧩 **插件架构** | 题型渲染器和结果区块均可扩展 |

---

## 🚀 快速开始

```bash
git clone https://github.com/HumanOS/HumanOS-1.git
cd HumanOS-1
npm install
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173) 开始你的探索之旅。

---

## 📦 当前测评模块

### ✅ 已投入生产

| 测评 | 分类 | 版本 | 说明 |
|------------|----------|----------|-------------|
| **MBTI** 职业性格测试 | personality | Lite · Standard · Expert | 完整的 16 型人格框架 |

### 🔧 验证中

| 测评 | 分类 | 版本 | 说明 |
|------------|----------|----------|-------------|
| 压力指数评估 | psychology | 单文件 | 快速压力水平评估 |
| 心理韧性评估 | psychology | Lite · Standard · Expert | 心理韧性测评 |
| 专注力与思维 | cognition | Lite · Standard · Expert | 认知能力评估 |
| 价值观光谱 | ideology | Lite · Standard · Expert | 个人价值观映射 |
| 霍兰德职业兴趣 | career | Lite · Standard · Expert | 职业兴趣测评 |

> **MBTI 是参考实现。** 它展示了平台的全部能力，并作为所有未来测评的模板。

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        HumanOS 平台                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │    模块      │  │     Family     │  │     Assessment       │  │
│  │   注册中心   │  │    注册中心    │  │      注册中心        │  │
│  │  (categories)│  │(family/level)  │  │   (individual.json) │  │
│  └──────────────┘  └────────────────┘  └──────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              内容服务层                                      │  │
│  │  loadAssessment() · validateAssessment() · getRegistry()   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   题目       │  │     测评     │  │    结果      │            │
│  │  渲染器      │  │    状态库   │  │    区块      │            │
│  │  (plugins)   │  │  (Zustand)  │  │  (plugins)   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           本地存储 (通过 Dexie 的 IndexedDB)                  │  │
│  │     结果 · 草稿 · Profile · 设置 (全部本地存储)               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 核心设计原则

### 1. 注册中心驱动架构
> **注册中心是唯一数据源。** 绝不硬编码内容路径。

```typescript
// ✅ 正确做法
const registry = await fetchAssessmentRegistry();
const assessment = registry.assessments.find(a => a.slug === slug);
const content = await loadAssessment(assessment.filePath);

// ❌ 永远不要这样做
const content = await fetch('/assessments/mbti/standard.json');
```

### 2. Family/Version 系统
每个测评都属于一个 **family**，拥有多个 **version level**：

| 级别 | 适用场景 | 题量 | 耗时 |
|-------|----------|------|------|
| **Lite** | 快速体验 | ~12 题 | ~5 分钟 |
| **Standard** | 推荐版本 | ~32 题 | ~15 分钟 |
| **Expert** | 深度分析 | ~64 题 | ~30 分钟 |

### 3. 内容/代码分离
- **内容**：JSON 文件，位于 `public/assessments/`
- **逻辑**：TypeScript/React，位于 `src/`
- **验证**：Zod Schema，构建时 + 运行时验证

### 4. 插件系统
通过注册中心实现可扩展性：
- `questionRendererPlugin.ts` → 题型渲染器
- `resultBlockPlugin.ts` → 结果展示区块

---

## 🔧 技术栈

| 层次 | 技术 |
|-------|------------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 3D 背景 | Three.js + React Three Fiber |
| Schema 验证 | Zod |
| 本地数据库 | Dexie (IndexedDB) |
| 内容格式 | JSON (Schema 验证) |

---

## 📁 项目结构

```
HumanOS-1/
├── public/
│   ├── assessments/              # 内容 JSON 文件
│   │   ├── registry.json         # 测评注册中心
│   │   ├── module-registry.json  # 分类注册中心
│   │   └── {category}/
│   │       └── {family}/
│   │           ├── lite.json
│   │           ├── standard.json
│   │           └── expert.json
│   └── manifest.json             # PWA 清单
├── src/
│   ├── components/
│   │   ├── atoms/               # Button, Card, Badge 等基础组件
│   │   ├── molecules/            # PageTransition, StatusPageTemplate
│   │   ├── blocks/               # 结果展示区块 (插件)
│   │   └── charts/               # 可视化组件
│   ├── features/
│   │   ├── assessment/           # 注册中心、内容加载、验证
│   │   ├── storage/              # Dexie 服务、数据管理
│   │   └── ai/                   # AI 集成层
│   ├── pages/                    # 路由页面
│   ├── shared/
│   │   ├── plugins/              # 插件注册中心
│   │   ├── schemas/              # Zod 验证 Schema
│   │   └── types/                # TypeScript 接口
│   ├── store/                    # Zustand 状态库
│   └── styles/                   # 全局样式、设计令牌
├── scripts/
│   └── validate-content.ts       # 内容验证脚本
├── docs/                         # 架构文档
│   ├── architecture.md           # 系统设计 (给 AI 和开发者)
│   ├── content-system.md         # Schema 规范 (给内容创作者)
│   ├── developer-guide.md        # 如何添加内容/功能
│   └── ai-handoff.md             # 项目状态和决策 (给 AI 代理)
└── e2e/                         # Playwright E2E 测试
```

---

## 📖 文档导航

| 文档 | 用途 | 受众 |
|----------|---------|----------|
| [architecture.md](./docs/architecture.md) | 系统设计、数据流、模块系统 | 架构师、AI 代理 |
| [content-system.md](./docs/content-system.md) | Schema 规范、验证规则、内容加载 | 内容创作者、AI 代理 |
| [developer-guide.md](./docs/developer-guide.md) | 添加内容/功能的分步指南 | 开发者 |
| [ai-handoff.md](./docs/ai-handoff.md) | 项目状态、决策、下一步 | AI 代理、未来维护者 |

---

## 🛠️ 开发命令

```bash
npm run dev           # 启动开发服务器
npm run build         # 生产构建
npm run validate      # 仅验证内容
npm run validate:build # 验证 + 构建
npm run typecheck     # TypeScript 检查
npm run lint          # ESLint
npm run format        # Prettier
```

---

## 🔮 产品路线图

| 阶段 | 重点 | 状态 |
|-------|-------|--------|
| **平台基础** | 插件系统、注册中心、MBTI 参考实现 | ✅ 已完成 |
| **内容扩展** | 激活所有测评、完成验证 | 🚧 进行中 |
| **持久化层** | 结果历史、分析、导出 | 📋 计划中 |
| **生态系统** | 远程内容、自定义测评、社区 | 📋 计划中 |

---

## 🤝 贡献指南

### 面向人类可读性的变更
- 遵循现有代码规范
- 在亮色和暗色主题下都测试
- 验证动画在 reduced-motion 设置下正常工作

### 面向机器/AI 的上下文
1. 首先阅读 [ai-handoff.md](./docs/ai-handoff.md)
2. 严格遵循架构原则
3. 绝不硬编码内容路径
4. 提交前始终验证内容

### 黄金法则
1. **修改内容后运行 `npm run validate`**
2. **部署前运行 `npm run validate:build`**
3. **保持 MBTI 正常运行** — 它是参考实现
4. **不确定时用 `--dry-run` 测试**

---

## 📋 给 AI 代理和交接者

如果你是一个继续这个项目的 AI 代理或开发者：

```markdown
1. 从这里开始 → 阅读 docs/ai-handoff.md
2. 架构设计 → 查看 docs/architecture.md
3. 添加内容 → 遵循 docs/developer-guide.md
4. 总是验证 → 修改后运行 npm run validate
5. 保护 MBTI → 不要破坏参考实现
```

---

## 📄 许可证

私有项目 — 版权所有。

---

## 📬 联系方式

如有问题，请参阅 [`docs/`](./docs/) 中的文档。

---

*最后更新：2026-03-21 | 版本 1.1.0*
