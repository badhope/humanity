# HumanOS Architecture

## Overview

HumanOS is a modular assessment platform designed to host multiple psychological and cognitive assessment modules. The architecture follows a plugin-based design with centralized content management, registry-driven routing, and strict separation between content data and presentation logic.

## Core Architecture Principles

1. **Registry-Driven**: All modules, assessments, and content are registered through centralized registries
2. **Family/Version System**: Assessments are organized by family (e.g., MBTI) with multiple versions (lite, standard, expert)
3. **Content/Code Separation**: Content (questions, dimensions, result profiles) lives in JSON files; code handles rendering and logic
4. **Validation First**: All content is validated before loading; invalid content fails fast with clear errors

## Module System

### Plugin Architecture

The platform uses a plugin-based architecture for extensibility:

```
src/shared/plugins/
├── questionRendererPlugin.ts    # Plugin registry for question types
├── resultBlockPlugin.ts         # Plugin registry for result blocks
└── defaultRenderers.tsx         # Built-in question renderers
```

#### Question Renderer Plugin

Question renderers handle the display and input of different question types:

```typescript
// Question type -> Renderer mapping
'single-choice' -> SingleChoiceRenderer
'multiple-choice' -> MultipleChoiceRenderer
'likert-5' -> LikertRenderer
'likert-7' -> LikertRenderer
'ranking' -> RankingRenderer
```

#### Result Block Plugin

Result blocks handle the display of different sections in results:

```typescript
// Result block types
'profile' -> ProfileResultBlock
'ai-report' -> AIReportBlock
'dimensions' -> DimensionsResultBlock
'recommendations' -> RecommendationsResultBlock
```

### Feature Gating

Each assessment module can be in one of three states:

- **active**: Fully functional, accessible to users
- **beta**: Functional but may have issues; shown with beta badge
- **preparing**: Not yet functional; shows preparing page
- **maintenance**: Temporarily unavailable; shows maintenance page
- **deprecated**: No longer supported; shows unavailable page

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Registry Layer                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Module    │  │   Family     │  │  Assessment   │  │
│  │  Registry   │  │   Registry   │  │   Registry    │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Content Service                        │
│  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │ loadAssessment() │  │ validateAssessmentSync()      │ │
│  │ - fetch JSON     │  │ - validate required fields    │ │
│  │ - cache result   │  │ - check dimension references  │ │
│  │ - return typed   │  │ - verify question counts     │ │
│  └──────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Quiz Flow                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │
│  │  Start  │───▶│ Questions │───▶│ Scoring │───▶│Result │ │
│  │         │    │          │    │         │    │       │ │
│  └─────────┘    └─────────┘    └─────────┘    └────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Registry Structure

### Module Registry (`public/assessments/module-registry.json`)

```json
{
  "version": "1.0.0",
  "modules": [
    {
      "id": "mbti",
      "name": "MBTI",
      "status": "active",
      "families": ["mbti"]
    }
  ]
}
```

### Family Registry (`public/assessments/family-registry.json`)

```json
{
  "version": "1.0.0",
  "families": [
    {
      "familyId": "mbti",
      "familyName": "MBTI 职业性格测试",
      "versions": [
        { "level": "lite", "status": "active" },
        { "level": "standard", "status": "active" },
        { "level": "expert", "status": "beta" }
      ]
    }
  ]
}
```

### Assessment Registry (`public/assessments/registry.json`)

```json
{
  "version": "2.0.0",
  "assessments": [
    {
      "id": "mbti-standard",
      "filePath": "assessments/personality/mbti/standard.json",
      "status": "active",
      "versionLevel": "standard"
    }
  ]
}
```

## Content Schema

### Assessment Definition

Each assessment JSON file must conform to this structure:

```typescript
interface AssessmentDefinition {
  id: string;                    // Unique identifier
  slug: string;                  // URL-friendly identifier
  familyId: string;              // Family this belongs to
  familyName: string;             // Display name of family
  category: AssessmentCategory;  // personality | psychology | cognition | ideology | career
  version: string;                // Semantic version
  versionLevel?: 'lite' | 'standard' | 'expert';
  name: string;                  // Display name
  description: string;           // Full description
  estimatedMinutes: number;      // Estimated completion time
  questionCount: number;         // Expected question count
  dimensions: Dimension[];        // Scoring dimensions
  questions: Question[];         // All questions
  scoring: ScoringDefinition;     // How to calculate scores
  resultProfiles: ResultProfile[]; // Possible results
  status: 'active' | 'beta' | 'deprecated';
  recommended?: boolean;
  tags?: string[];
}
```

### Question Structure

```typescript
interface Question {
  id: string;
  text: string;
  type: 'single-choice' | 'multiple-choice' | 'likert-5' | 'likert-7' | 'ranking';
  options: QuestionOption[];
  dimension: string;             // References dimension.id
  reverse?: boolean;             // Reverse scoring
  weight?: number;               // Question weight
}
```

### Dimension Structure

```typescript
interface Dimension {
  id: string;
  name: string;
  description: string;
  weights?: Record<string, number>;  // For scoring
}
```

### Result Profile

```typescript
interface ResultProfile {
  id: string;
  name: string;
  description: string;
  scores?: Record<string, number | string>;   // For range-based results
  conditions?: Condition[];                     // For condition-based results
  type?: 'dominant' | 'secondary' | 'balanced' | 'varied';
  recommendations?: string[];
  tags?: string[];
  strengths?: string[];
  weaknesses?: string[];
  careers?: string[] | string;
  relationships?: string;
  growth?: string;
}
```

## Loader Architecture

### Content Service (`src/features/assessment/contentService.ts`)

The content service provides:

1. **loadAssessment(filePath)**: Load and validate an assessment JSON
2. **loadAssessmentSafe(filePath)**: Safe version returning result type
3. **validateAssessmentSync(data)**: Validate without loading
4. **loadFamily(familyId)**: Load family metadata

Features:
- Automatic caching of loaded assessments
- Clear error messages with error codes
- Validation before caching

### Registry Service (`src/features/assessment/registry.ts`)

The registry service provides:

1. **fetchAssessmentRegistry()**: Get all assessments
2. **fetchFamilyRegistry()**: Get all families
3. **getAssessmentVersions(familyId)**: Get versions for a family
4. **getRecommendedVersion(familyId)**: Get recommended version

## State Management

### Quiz Store (`src/stores/quizStore.ts`)

The quiz store manages the assessment flow:

```typescript
interface QuizState {
  status: 'idle' | 'loading' | 'ready' | 'in-progress' | 'completed' | 'error';
  currentQuestionIndex: number;
  answers: Record<string, number | number[]>;
  scores?: Record<string, number>;
  resultProfileId?: string;
  error?: string;
}
```

## Routing

### Assessment Routes

```
/                           # Home page
/assessment/:slug           # Assessment detail/selector
/quiz/:slug                 # Quiz taking flow
/quiz/:slug/intro           # Assessment intro/start
/quiz/:slug/questions       # Question flow
/quiz/:slug/loading         # Processing/results
/quiz/:slug/results         # Results display
/categories                 # Browse by category
/status                     # Platform status
```

### Status Pages

Based on assessment status, users see different pages:

- **active**: Normal quiz flow
- **beta**: Normal flow with beta badge
- **preparing**: PreparingPage with coming soon message
- **maintenance**: MaintenancePage with maintenance message
- **deprecated**: UnavailablePage with deprecated message

## Extension Points

### Adding a New Question Type

1. Create a renderer component in `src/components/questions/`
2. Register in `questionRendererPlugin.ts`:
   ```typescript
   registerQuestionRenderer('my-type', MyQuestionRenderer);
   ```
3. Use in assessment JSON: `{ "type": "my-type", ... }`

### Adding a New Result Block

1. Create a block component in `src/components/blocks/`
2. Register in `resultBlockPlugin.ts`:
   ```typescript
   registerResultBlock('my-block', MyResultBlock);
   ```
3. Use in result profiles JSON

### Adding a New Assessment Family

1. Create family entry in `family-registry.json`
2. Create assessment files in `public/assessments/{category}/{family}/`
3. Register assessments in `registry.json`
4. Add module entry if new module

## Environment Configuration

```typescript
// Vite environment
import.meta.env.BASE_URL      # Base path for GitHub Pages
import.meta.env.PROD          # Production mode flag
import.meta.env.DEV           # Development mode flag
```

## Key Files

| File | Purpose |
|------|---------|
| `src/features/assessment/registry.ts` | Registry data access |
| `src/features/assessment/contentService.ts` | Content loading & validation |
| `src/shared/plugins/questionRendererPlugin.ts` | Question renderer registry |
| `src/shared/plugins/resultBlockPlugin.ts` | Result block registry |
| `src/stores/quizStore.ts` | Quiz flow state |
| `scripts/validate-content.ts` | Build-time content validation |

## Future Extensions

Planned architecture enhancements:

1. **Remote Content**: Support loading content from external sources
2. **Content Versioning**: Built-in version management for content updates
3. **Analytics Integration**: Track assessment completion and scores
4. **User Progress**: Persistent user progress across sessions
5. **Custom Assessments**: User-created assessments with restricted publishing
