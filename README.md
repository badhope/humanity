# HumanOS

<!-- badges -->
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/HumanOS/HumanOS-1)
[![Status](https://img.shields.io/badge/status-platform%20stabilization-green.svg)](./docs/architecture.md)
[![Type](https://img.shields.io/badge/type-assessment%20platform-purple.svg)](./docs/content-system.md)
[![Framework](https://img.shields.io/badge/framework-React%2018-61dafb.svg)](https://react.dev)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/HumanOS/HumanOS-1/actions)

[English](./README.md) | [中文](./README.zh-CN.md)

---

## ✨ Discover Yourself Through Science

> _A sanctuary for self-reflection, running entirely in your browser._

HumanOS is a **local-first, modular human assessment platform** designed for deep self-exploration. It offers personality, psychological, cognitive, and career assessments — all with zero data collection, zero tracking, and complete privacy.

Built on a **registry-driven plugin architecture**, HumanOS enables seamless expansion of assessments, question types, and result visualizations while maintaining enterprise-grade stability.

---

## 🌟 Platform Highlights

| Feature | Description |
|---------|-------------|
| 🔒 **Complete Privacy** | All data stays in your browser. Forever. |
| 🎨 **Modular by Design** | Add assessments without touching core logic. |
| ✅ **Validated Content** | Every question bank passes schema validation at build time. |
| 📦 **Static Deployment** | Deploy anywhere. No backend. No server. |
| 🧩 **Plugin Architecture** | Extensible question renderers and result blocks. |

---

## 🚀 Quick Start

```bash
git clone https://github.com/HumanOS/HumanOS-1.git
cd HumanOS-1
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to begin your journey.

---

## 📦 Current Assessments

### ✅ Production Ready

| Assessment | Category | Versions | Description |
|------------|----------|----------|-------------|
| **MBTI** Career Personality | personality | Lite · Standard · Expert | Full 16-type personality framework |

### 🔧 In Validation

| Assessment | Category | Versions | Description |
|------------|----------|----------|-------------|
| Stress Index | psychology | Single | Quick stress level evaluation |
| Resilience | psychology | Lite · Standard · Expert | Psychological resilience assessment |
| Focus & Thinking | cognition | Lite · Standard · Expert | Cognitive ability evaluation |
| Values Spectrum | ideology | Lite · Standard · Expert | Personal values mapping |
| Holland Career | career | Lite · Standard · Expert | Career interest inventory |

> **MBTI is the reference implementation.** It demonstrates the full platform capability and serves as the template for all future assessments.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HumanOS Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │    Module    │  │     Family     │  │     Assessment       │  │
│  │   Registry   │  │    Registry    │  │      Registry        │  │
│  │ (categories) │  │(family/level)  │  │   (individual.json)  │  │
│  └──────────────┘  └────────────────┘  └──────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Content Service Layer                          │  │
│  │  loadAssessment() · validateAssessment() · getRegistry()    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Question   │  │     Quiz     │  │    Result    │            │
│  │  Renderers   │  │    Store     │  │    Blocks    │            │
│  │  (plugins)   │  │  (Zustand)   │  │  (plugins)   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Local Storage (IndexedDB via Dexie)              │  │
│  │     Results · Drafts · Profile · Settings (all local)       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Design Principles

### 1. Registry-Driven Architecture
> **Registry is the single source of truth.** Never hardcode content paths.

```typescript
// ✅ Correct approach
const registry = await fetchAssessmentRegistry();
const assessment = registry.assessments.find(a => a.slug === slug);
const content = await loadAssessment(assessment.filePath);

// ❌ Never do this
const content = await fetch('/assessments/mbti/standard.json');
```

### 2. Family/Version System
Every assessment belongs to a **family** with multiple **version levels**:

| Level | Use Case | Question Count | Time |
|-------|----------|----------------|------|
| **Lite** | Quick taste | ~12 questions | ~5 min |
| **Standard** | Recommended | ~32 questions | ~15 min |
| **Expert** | Deep analysis | ~64 questions | ~30 min |

### 3. Content/Code Separation
- **Content**: JSON files in `public/assessments/`
- **Logic**: TypeScript/React in `src/`
- **Validation**: Zod schemas at build + runtime

### 4. Plugin System
Extensibility through registries:
- `questionRendererPlugin.ts` → Question type renderers
- `resultBlockPlugin.ts` → Result display blocks

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| State | Zustand |
| Styling | Tailwind CSS |
| 3D Background | Three.js + React Three Fiber |
| Validation | Zod |
| Local DB | Dexie (IndexedDB) |
| Content | JSON (schema-validated) |

---

## 📁 Project Structure

```
HumanOS-1/
├── public/
│   ├── assessments/              # Content JSON files
│   │   ├── registry.json         # Assessment registry
│   │   ├── module-registry.json  # Category registry
│   │   └── {category}/
│   │       └── {family}/
│   │           ├── lite.json
│   │           ├── standard.json
│   │           └── expert.json
│   └── manifest.json             # PWA manifest
├── src/
│   ├── components/
│   │   ├── atoms/               # Button, Card, Badge, etc.
│   │   ├── molecules/            # PageTransition, StatusPageTemplate
│   │   ├── blocks/               # Result display blocks (plugins)
│   │   └── charts/               # Visualization components
│   ├── features/
│   │   ├── assessment/           # Registry, content loading, validation
│   │   ├── storage/              # Dexie services, data management
│   │   └── ai/                   # AI integration layer
│   ├── pages/                    # Route pages
│   ├── shared/
│   │   ├── plugins/              # Plugin registries
│   │   ├── schemas/              # Zod validation schemas
│   │   └── types/                # TypeScript interfaces
│   ├── store/                    # Zustand stores
│   └── styles/                   # Global styles, design tokens
├── scripts/
│   └── validate-content.ts       # Content validation script
├── docs/                         # Architecture documentation
│   ├── architecture.md           # System design (for AI & developers)
│   ├── content-system.md         # Schema spec (for content creators)
│   ├── developer-guide.md        # How to add content/features
│   └── ai-handoff.md             # Project state & decisions (for AI agents)
└── e2e/                         # Playwright E2E tests
```

---

## 📖 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [architecture.md](./docs/architecture.md) | System design, data flow, registries | Architects, AI agents |
| [content-system.md](./docs/content-system.md) | Schema spec, validation rules, content loading | Content creators, AI agents |
| [developer-guide.md](./docs/developer-guide.md) | Step-by-step guides for adding content/features | Developers |
| [ai-handoff.md](./docs/ai-handoff.md) | Project state, decisions, next steps | AI agents, future maintainers |

---

## 🛠️ Development

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run validate      # Validate content only
npm run validate:build # Validate + build
npm run typecheck     # TypeScript checking
npm run lint          # ESLint
npm run format        # Prettier
```

---

## 🔮 Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Platform Foundation** | Plugin system, registries, MBTI reference | ✅ Complete |
| **Content Expansion** | Activate all assessments, complete validation | 🚧 In Progress |
| **Persistence Layer** | Results history, analytics, export | 📋 Planned |
| **Ecosystem** | Remote content, custom assessments, community | 📋 Planned |

---

## 🤝 Contributing

### For Human-Facing Changes
- Follow existing code conventions
- Test on both light and dark themes
- Verify animations work with reduced-motion settings

### For Machine/AI Context
1. Read [ai-handoff.md](./docs/ai-handoff.md) first
2. Follow architecture principles exactly
3. Never hardcode content paths
4. Always validate content before committing

### Golden Rules
1. **Run `npm run validate`** after any content changes
2. **Run `npm run validate:build`** before deployment
3. **Keep MBTI functional** — it is the reference implementation
4. **Test with `--dry-run`** if unsure

---

## 📋 For AI Agents & Handoff

If you are an AI agent or developer continuing this project:

```markdown
1. START HERE → Read docs/ai-handoff.md
2. Architecture → See docs/architecture.md
3. Adding Content → Follow docs/developer-guide.md
4. Validate Always → Run npm run validate after changes
5. Protect MBTI → Do not break the reference implementation
```

---

## 📄 License

Private project — all rights reserved.

---

## 📬 Contact

For questions, refer to the documentation in [`docs/`](./docs/).

---

*Last updated: 2026-03-21 | Version 1.1.0*
