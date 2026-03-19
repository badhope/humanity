# HumanOS

English | [中文](./README.zh-CN.md)

---

## Project Name

**HumanOS** - A Self-Discovery Assessment Platform

## One-line Introduction

A static web platform for personality, psychological, cognitive, and career assessment with an extensible JSON-based question bank system.

## Current Version

**v1.0.0** - MBTI MVP Release (2026-03-19)

## Current Product Strategy

HumanOS follows a **"single-module-first"** development approach:

1. **MBTI is the primary fully available module** - provides complete answer-to-result闭环 (closed-loop) experience
2. Other modules are in content preparation and gradual rollout phase
3. Each module follows: content foundation → question bank → result page → sharing/export

This strategy ensures a polished, complete experience for each assessment type before moving to the next.

---

## What is Currently Completed

| Feature | Status | Description |
|---------|--------|-------------|
| MBTI Assessment | ✅ Complete | Full closed-loop from quiz to detailed results |
| Assessment Registry | ✅ Complete | JSON-based dynamic loading system |
| 5 Assessment Categories | ✅ Complete | Personality, Psychology, Cognition, Ideology, Career |
| 8 Question Banks | ✅ Complete | Content储备 (storage), ready for integration |
| Local Storage | ✅ Complete | Quiz history and settings persistence |
| GitHub Pages Deployment | ✅ Complete | Automated CI/CD pipeline |
| HashRouter Configuration | ✅ Complete | SPA routing for GitHub Pages subdirectory |

---

## What is Currently Available

### Primary Module (Fully Functional)

| Assessment | Questions | Status |
|------------|-----------|--------|
| MBTI Career Personality Test | 40 | ✅ Complete - Full results, dimension analysis, recommendations |

### Secondary Modules (Answerable, Reports in Progress)

| Assessment | Questions | Status |
|------------|-----------|--------|
| Stress Check | 12 | 🔧 Answerable, report page under construction |
| Resilience Assessment | 16 | 🔧 Answerable, report page under construction |
| Logic Assessment | 10 | 🔧 Answerable, report page under construction |
| Focus & Thinking Style | 15 | 🔧 Answerable, report page under construction |
| Values Spectrum | 12 | 🔧 Answerable, report page under construction |
| Holland Career Interest | 18 | 🔧 Answerable, report page under construction |
| Work Style Preference | 15 | 🔧 Answerable, report page under construction |

---

## Core Features

- **Dynamic Assessment Loading** - Extensible JSON-based question bank system
- **Multiple Assessment Types** - Single-choice, multiple-choice, Likert scale, ranking
- **Local-First Data** - All data stored in browser localStorage (no backend required)
- **Responsive Design** - Mobile-friendly with dark mode support
- **3D Visual Experience** - Three.js immersive background effects
- **Smooth Animations** - Framer Motion powered transitions
- **Multi-Dimensional Analysis** - Radar charts, bar charts, distribution visualization
- **Category-Based Organization** - 5 major assessment categories

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router v6 (HashRouter) |
| State Management | Zustand |
| Database | Dexie (IndexedDB wrapper) |
| Styling | Tailwind CSS |
| Animations | Framer Motion + GSAP + Three.js |
| Charts | Recharts + D3.js + Chart.js |
| Icons | Lucide React |
| UI Components | Radix UI primitives |
| Deployment | GitHub Pages (Static) |

---

## Project Structure

```
humanity/
├── public/
│   └── assessments/              # Assessment question bank
│       ├── registry.json         # Central registry index
│       ├── personality/
│       │   └── mbti-basic.json   # MBTI question bank (40 questions)
│       ├── psychology/
│       │   ├── stress-check.json
│       │   └── resilience-basic.json
│       ├── cognition/
│       │   ├── logic-lite.json
│       │   └── focus-style.json
│       ├── ideology/
│       │   └── values-spectrum.json
│       └── career/
│           ├── holland-basic.json
│           └── work-style-basic.json
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   └── ImmersiveBackground.tsx    # Three.js 3D background
│   │   ├── atoms/                         # Base components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── Progress.tsx
│   │   ├── charts/                        # Chart components
│   │   │   ├── BarAnalysisChart.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   └── RadarChartCard.tsx
│   │   └── molecules/                     # Composite components
│   │       ├── AssessmentCard.tsx
│   │       ├── CategoryCard.tsx
│   │       └── PageTransition.tsx
│   ├── features/
│   │   └── assessment/
│   │       ├── engine.ts       # Generic assessment engine
│   │       ├── registry.ts     # Question bank registration & loading
│   │       └── scoring.ts      # MBTI scoring logic
│   ├── pages/
│   │   ├── AssessmentList.tsx   # Assessment listing page
│   │   ├── Categories.tsx      # Category overview page
│   │   ├── Home.tsx            # Homepage
│   │   ├── Maintenance.tsx     # Under maintenance page
│   │   ├── NotFound.tsx        # 404 page
│   │   ├── Profile.tsx         # User profile & history
│   │   ├── Quiz.tsx             # Quiz taking page
│   │   └── Results.tsx          # MBTI results page
│   ├── shared/
│   │   ├── constants/          # Category definitions
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── assessment.ts   # Assessment type definitions
│   │   └── utils/              # Utility functions
│   ├── store/
│   │   ├── quizStore.ts        # Quiz state management
│   │   └── settingsStore.ts    # Settings state management
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── index.html
├── package.json
└── vite.config.ts
```

---

## Assessment Content System

### Question Bank Architecture

Each assessment is a self-contained JSON file containing:

- **Metadata** - id, slug, name, version, author
- **Dimensions** - Scoring dimensions with descriptions
- **Questions** - Question items with options and scoring values
- **Result Profiles** - Result types with matching conditions
- **Scoring Rules** - Weight and normalization configuration

### registry.json Structure

```json
{
  "version": "1.0.0",
  "assessments": [
    {
      "id": "mbti-basic",
      "slug": "mbti-basic",
      "name": "MBTI Career Personality Test",
      "category": "personality",
      "filePath": "assessments/personality/mbti-basic.json",
      "status": "active"
    }
  ]
}
```

### Question JSON Structure

```json
{
  "id": "mbti-q1",
  "text": "In social situations, you typically:",
  "type": "single-choice",
  "dimension": "EI",
  "options": [
    { "id": "A", "text": "Initiate conversations with strangers", "value": 3 },
    { "id": "B", "text": "Chat with familiar people", "value": 1 },
    { "id": "C", "text": "Observe others, wait to be approached", "value": -1 },
    { "id": "D", "text": "Enjoy quiet solitude", "value": -3 }
  ]
}
```

### Adding a New Assessment

1. Create JSON file in `public/assessments/<category>/`
2. Define dimensions, questions, result profiles
3. Add entry to `registry.json`
4. Update `COMPLETED_MODULES` in `AssessmentList.tsx` to enable access
5. Implement result page or use maintenance placeholder

---

## Local Data & Storage Design

### Storage Strategy

| Data Type | Storage Method | Key Pattern |
|-----------|---------------|-------------|
| Quiz Results | localStorage | `quiz_result_{assessmentId}` |
| User Settings | Zustand + localStorage | `humanOS_settings` |
| Answer Drafts | localStorage | `quiz_draft_{assessmentId}` |

### Data Flow

1. User starts quiz → `quizStore` initializes
2. Answers saved to `quizStore` (memory)
3. On quiz completion → results saved to localStorage
4. Results page reads from localStorage for display
5. Profile page reads history from localStorage

### No Backend

This is a purely static application. All data persists in the user's browser. There is:
- No user authentication
- No cloud sync
- No server-side processing
- Data is tied to the specific browser/device

---

## Current User Flow

```
Home → Categories → Assessment List → Quiz → Results
                              ↓
                         Profile (History)
```

### Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Platform intro, start assessment |
| `/categories` | Categories | 5 assessment categories |
| `/assessments/:category` | Assessment List | Available assessments |
| `/quiz/:assessmentId` | Quiz | Take assessment |
| `/results/:assessmentId` | Results | Full MBTI results (others: completion message) |
| `/profile` | Profile | History & settings |
| `/maintenance` | Maintenance | Module under construction |

---

## Development Notes

### Key Implementation Details

- **HashRouter**: Required for GitHub Pages subdirectory deployment (`/HumanOS/`)
- **Dynamic Imports**: Question banks loaded at runtime via fetch
- **Type Safety**: Full TypeScript coverage for assessment types
- **Responsive**: Tailwind CSS with mobile-first approach
- **Dark Mode**: System preference detection + manual toggle

### Registry Loading Flow

```
fetchAssessmentBySlug(slug)
  → getAssessmentBySlug(slug) [from registry]
  → fetchAssessmentDefinition(filePath) [fetch JSON]
  → AssessmentDefinition [typed response]
```

### Scoring Architecture

- **Generic Engine**: `engine.ts` - dimension score calculation
- **MBTI Specific**: `scoring.ts` - MBTI type derivation and profile matching
- **Extensible**: New scoring methods can be added per assessment type

---

## Roadmap / Next Steps

### Phase 1: Complete Current Modules (In Progress)

| Priority | Task | Status |
|----------|------|--------|
| P0 | Universal results page | 🔧 In Progress |
| P0 | Profile history integration | 🔧 In Progress |
| P1 | Individual module result pages | 📋 Planned |
| P1 | Quiz draft auto-save | 📋 Planned |

### Phase 2: Feature Expansion

| Priority | Feature | Status |
|----------|---------|--------|
| P2 | Data center / history management | 📋 Planned |
| P2 | Settings center (theme, language, font) | 📋 Planned |
| P2 | Quiz progress persistence | 📋 Planned |
| P2 | Share functionality | 📋 Planned |

### Phase 3: Advanced Features

| Priority | Feature | Status |
|----------|---------|--------|
| P3 | AI-powered report analysis | 📋 Planned |
| P3 | PDF export | 📋 Planned |
| P3 | Poster generation | 📋 Planned |
| P3 | Historical trend charts | 📋 Planned |
| P3 | User accounts & cloud sync | 📋 Future |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone repository
git clone https://github.com/badhope/humanity.git
cd humanity

# Install dependencies
npm install

# Start development server
npm run dev
```

Access at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |
| `npm run format` | Format code with Prettier |

---

## Build & Deploy

### Production Build

```bash
npm run build
```

Output is in `dist/` directory.

### Deploy to GitHub Pages

1. Push to `main` branch
2. GitHub Actions automatically:
   - Runs `npm run build`
   - Deploys to GitHub Pages at `https://badhope.github.io/humanity/`

**Note**: The site uses HashRouter. All routes work under `/humanity/` subdirectory.

---

## Notes & Limitations

### Current Limitations

1. **Results page is MBTI-specific**: `/results/:assessmentId` shows full results only for MBTI. Other assessments show a "completed" message.
2. **Local storage only**: History is tied to browser/device. No cloud sync.
3. **No user accounts**: Pure static app without authentication.
4. **No AI analysis**: Reports are pre-defined, not AI-generated.
5. **No export**: No PDF, poster, or sharing features yet.

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Environment

- This is a frontend-only static site
- No backend server required
- No database server required
- All data persists in browser localStorage

---

## License

MIT License - See [LICENSE](LICENSE) for details.
