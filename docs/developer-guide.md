# HumanOS Developer Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Content Validation

```bash
npm run validate
```

### Validate and Build

```bash
npm run validate:build
```

## Project Structure

```
HumanOS-1/
├── public/
│   └── assessments/          # Assessment content JSON files
│       ├── registry.json       # Assessment registry
│       ├── family-registry.json # Family registry
│       └── module-registry.json # Module registry
├── src/
│   ├── components/            # React components
│   │   ├── questions/         # Question renderer components
│   │   └── blocks/            # Result block components
│   ├── features/              # Feature modules
│   │   └── assessment/        # Assessment feature
│   │       ├── registry.ts    # Registry access
│   │       ├── contentService.ts # Content loading & validation
│   │       └── moduleService.ts # Module service
│   ├── pages/                 # Page components
│   ├── shared/                # Shared utilities
│   │   ├── plugins/           # Plugin registries
│   │   ├── schemas/           # Zod schemas
│   │   └── types/             # TypeScript types
│   └── stores/                # State stores
├── scripts/
│   └── validate-content.ts    # Content validation script
└── docs/                     # Documentation
```

## Core Concepts

### 1. Module, Family, Assessment

HumanOS organizes content in three levels:

- **Module**: A collection of related assessment families (e.g., "MBTI" module)
- **Family**: A specific assessment type with multiple versions (e.g., "MBTI" family)
- **Assessment**: A specific version of a family (e.g., "MBTI Standard v1.0")

### 2. Assessment States

Each assessment has a status:

- `preparing`: Not accessible, shows coming soon
- `beta`: Functional but testing, shows beta badge
- `active`: Fully functional
- `maintenance`: Temporarily unavailable
- `deprecated`: No longer supported

### 3. Content Loading

Always use `contentService` for loading assessment content:

```typescript
import { loadAssessment } from '@/features/assessment/contentService';

const assessment = await loadAssessment('assessments/personality/mbti/standard.json');
```

Never directly fetch JSON files from pages.

## Adding a New Assessment

### Step 1: Add Family to Family Registry

Edit `public/assessments/family-registry.json`:

```json
{
  "familyId": "my-assessment",
  "familyName": "我的测评",
  "versions": [
    {
      "level": "lite",
      "name": "我的测评简化版",
      "status": "preparing"
    }
  ]
}
```

### Step 2: Create Assessment JSON File

Create `public/assessments/{category}/my-assessment/lite.json`:

```json
{
  "id": "my-assessment-lite",
  "slug": "my-assessment-lite",
  "familyId": "my-assessment",
  "familyName": "我的测评",
  "category": "personality",
  "version": "1.0.0",
  "versionLevel": "lite",
  "name": "我的测评简化版",
  "description": "描述...",
  "estimatedMinutes": 5,
  "questionCount": 10,
  "dimensions": [
    { "id": "dim1", "name": "维度一", "description": "..." }
  ],
  "questions": [
    {
      "id": "q1",
      "text": "问题文本",
      "type": "single-choice",
      "options": [
        { "id": "q1_a", "text": "选项A", "value": 1 },
        { "id": "q1_b", "text": "选项B", "value": -1 }
      ],
      "dimension": "dim1"
    }
  ],
  "scoring": {
    "type": "weighted",
    "dimensionScores": {
      "dim1": { "weights": { "A": 1, "B": -1 } }
    }
  },
  "resultProfiles": [
    {
      "id": "result1",
      "name": "结果一",
      "description": "结果描述...",
      "scores": { "dim1": 1 }
    }
  ],
  "status": "preparing"
}
```

### Step 3: Add to Assessment Registry

Edit `public/assessments/registry.json`:

```json
{
  "id": "my-assessment-lite",
  "filePath": "assessments/personality/my-assessment/lite.json",
  "status": "preparing",
  "versionLevel": "lite"
}
```

### Step 4: Validate

```bash
npm run validate
```

Fix any errors reported.

### Step 5: Activate

When ready, change `status` from `preparing` to `beta` (or `active`) in both files.

## Adding a New Question Type

### Step 1: Create Renderer Component

Create `src/components/questions/MyQuestionRenderer.tsx`:

```typescript
import type { QuestionRendererProps } from '@/shared/plugins/questionRendererPlugin';

export function MyQuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  return (
    <div className="my-question">
      <p>{question.text}</p>
      {/* Render options */}
    </div>
  );
}
```

### Step 2: Register Renderer

Edit `src/shared/plugins/questionRendererPlugin.ts`:

```typescript
import { MyQuestionRenderer } from '@/components/questions/MyQuestionRenderer';

export function initializeQuestionRenderers() {
  registerQuestionRenderer('my-type', MyQuestionRenderer);
}
```

### Step 3: Use in Content

Now use `"type": "my-type"` in your assessment JSON questions.

## Adding a New Result Block

### Step 1: Create Block Component

Create `src/components/blocks/MyResultBlock.tsx`:

```typescript
import type { ResultBlockProps } from '@/shared/plugins/resultBlockPlugin';

export function MyResultBlock({ result, profile }: ResultBlockProps) {
  return (
    <div className="my-result-block">
      {/* Render result content */}
    </div>
  );
}
```

### Step 2: Register Block

Edit `src/shared/plugins/resultBlockPlugin.ts`:

```typescript
import { MyResultBlock } from '@/components/blocks/MyResultBlock';

export function initializeResultBlocks() {
  registerResultBlock('my-block', MyResultBlock);
}
```

## Common Tasks

### Accessing Current Assessment Data

```typescript
import { useQuizStore } from '@/stores/quizStore';

function MyComponent() {
  const { assessment, answers } = useQuizStore();
  // Use assessment and answers
}
```

### Navigating to Quiz

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(`/quiz/${slug}`);
```

### Checking Assessment Status

```typescript
import { getAssessmentStatus } from '@/features/assessment/registry';

const status = await getAssessmentStatus('mbti-standard');
if (status === 'active') {
  // Normal flow
} else if (status === 'beta') {
  // Show beta badge
}
```

## Troubleshooting

### "Cannot find module" errors

Run `npm run typecheck` to identify type issues.

### Validation errors

Run `npm run validate` to see content issues.

### Build failures

1. Run `npm run lint` to check for linting errors
2. Run `npm run typecheck` to check for type errors
3. Check the validation script: `npm run validate`

## Best Practices

1. **Always validate content** before committing
2. **Use contentService** for all content loading
3. **Follow naming conventions** for files and IDs
4. **Keep questions focused** on single dimensions
5. **Test beta assessments** before marking active
6. **Document new features** in the relevant doc files
