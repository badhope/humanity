# HumanOS Content System

## Overview

The HumanOS content system manages all assessment content (questions, dimensions, result profiles) through a centralized, validated, and version-controlled approach. Content lives in JSON files while code handles rendering and business logic.

## Design Principles

1. **Content/Code Separation**: All assessment content is pure data in JSON files
2. **Schema Validation**: Every piece of content is validated against a defined schema
3. **Registry-Driven**: All content is discoverable through centralized registries
4. **Fail-Fast**: Invalid content is rejected at load time with clear error messages
5. **Caching**: Loaded content is cached to avoid repeated fetches

## Content Organization

### Directory Structure

```
public/assessments/
├── registry.json           # Master assessment registry
├── family-registry.json    # Family/version registry
├── module-registry.json    # Module registry
├── personality/
│   └── mbti/
│       ├── lite.json       # MBTI Lite version
│       ├── standard.json   # MBTI Standard version
│       └── expert.json     # MBTI Expert version
├── psychology/
│   ├── resilience/
│   │   ├── lite.json
│   │   ├── standard.json
│   │   └── expert.json
│   └── stress-check.json   # Single-file assessment
├── cognition/
│   └── focus/
│       ├── lite.json
│       ├── standard.json
│       └── expert.json
├── ideology/
│   └── values/
│       ├── lite.json
│       ├── standard.json
│       └── expert.json
└── career/
    └── holland/
        ├── lite.json
        ├── standard.json
        └── expert.json
```

### File Naming Conventions

- Assessment files MUST end with `.json`
- Family directories use kebab-case: `mbti`, `resilience`, `focus-style`
- Version files use version level: `lite.json`, `standard.json`, `expert.json`
- Standalone assessments use descriptive names: `stress-check.json`, `values-spectrum.json`

## Schema Specification

### Assessment JSON Structure

```json
{
  "id": "mbti-standard",
  "slug": "mbti-standard",
  "familyId": "mbti",
  "familyName": "MBTI 职业性格测试",
  "category": "personality",
  "version": "1.0.0",
  "versionLevel": "standard",
  "name": "MBTI 标准版",
  "description": "MBTI标准版，完整覆盖四维度，结果稳定可靠",
  "shortDescription": "32题标准版MBTI性格测试",
  "estimatedMinutes": 15,
  "questionCount": 32,
  "difficulty": "easy",
  "tags": ["人格", "性格", "MBTI", "标准版"],
  "dimensions": [...],
  "questions": [...],
  "scoring": {...},
  "resultProfiles": [...],
  "status": "active",
  "recommended": true
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this assessment version |
| `slug` | string | URL-friendly identifier |
| `familyId` | string | ID of the family this belongs to |
| `familyName` | string | Display name of the family |
| `category` | enum | One of: personality, psychology, cognition, ideology, career |
| `version` | string | Semantic version string |
| `name` | string | Display name |
| `description` | string | Full description |
| `estimatedMinutes` | number | Estimated completion time in minutes |
| `questionCount` | number | Expected number of questions |
| `dimensions` | array | Array of Dimension objects |
| `questions` | array | Array of Question objects |
| `scoring` | object | Scoring configuration |
| `resultProfiles` | array | Array of ResultProfile objects (min 1) |
| `status` | enum | One of: active, beta, deprecated |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `versionLevel` | enum | One of: lite, standard, expert |
| `shortDescription` | string | Short description for cards |
| `difficulty` | enum | One of: easy, medium, hard |
| `recommended` | boolean | Whether to recommend this version |
| `tags` | array | Array of string tags |
| `author` | string | Content author |
| `language` | string | Language code (e.g., "zh-CN") |
| `lastUpdated` | string | ISO date string |

## Dimensions

Dimensions define the scoring axes of an assessment.

```json
{
  "id": "EI",
  "name": "能量倾向",
  "description": "外向(E) vs 内向(I)：您获取能量的方式",
  "weights": {
    "E": 1,
    "I": -1
  }
}
```

### Dimension Rules

- `id` MUST be unique within the assessment
- `id` MUST match references in questions (`question.dimension`)
- `id` MUST match keys in `resultProfiles.scores` (if using scores-based results)
- `id` MUST match keys in `resultProfiles.conditions.dimension` (if using conditions-based results)
- `name` and `description` are required for display

## Questions

Questions are the core content units of an assessment.

```json
{
  "id": "q1",
  "text": "在社交场合中，你通常会感到：",
  "type": "single-choice",
  "options": [
    { "id": "q1_a", "text": "精力充沛，想要与更多人交流", "value": 1 },
    { "id": "q1_b", "text": "有些疲惫，需要时间独处来恢复精力", "value": -1 }
  ],
  "dimension": "EI",
  "reverse": false,
  "weight": 1
}
```

### Question Types

| Type | Description | Options Required |
|------|-------------|------------------|
| `single-choice` | Select one option | min 2 |
| `multiple-choice` | Select multiple options | min 2 |
| `likert-5` | 5-point Likert scale | exactly 5 |
| `likert-7` | 7-point Likert scale | exactly 7 |
| `ranking` | Rank options in order | min 3 |

### Question Rules

- `id` MUST be unique within the assessment
- `text` MUST be non-empty
- `type` MUST be a valid question type
- `options` MUST have at least 2 items
- `dimension` MUST reference an existing dimension `id`
- `value` in options should be numeric for scoring

## Scoring Configuration

```json
{
  "type": "weighted",
  "dimensionScores": {
    "EI": {
      "weights": { "E": 1, "I": -1 }
    },
    "SN": {
      "weights": { "S": -1, "N": 1 }
    }
  },
  "normalize": true,
  "minScore": -32,
  "maxScore": 32
}
```

### Scoring Types

| Type | Description |
|------|-------------|
| `sum` | Simple sum of option values |
| `weighted` | Weighted sum using dimension weights |
| `formula` | Custom formula (future support) |

## Result Profiles

Result profiles define possible outcomes. Two patterns are supported:

### Pattern 1: Scores-Based

Used when results are determined by score ranges:

```json
{
  "id": "optimal",
  "name": "压力舒适区",
  "description": "您目前处于良好的压力平衡状态...",
  "scores": {
    "stressLoad": 1.5,
    "emotionalStrain": 2.0,
    "recoveryCapacity": 3.5
  },
  "recommendations": ["保持当前的生活方式"]
}
```

### Pattern 2: Conditions-Based

Used when results are determined by complex conditions (like MBTI):

```json
{
  "id": "INTJ",
  "name": "建筑师",
  "description": "您是一位富有想象力和战略思维的人...",
  "conditions": [
    { "dimension": "EI", "operator": "lt", "value": 0 },
    { "dimension": "SN", "operator": "gt", "value": 0 },
    { "dimension": "TF", "operator": "gt", "value": 0 },
    { "dimension": "JP", "operator": "gt", "value": 0 }
  ],
  "strengths": ["逻辑思维清晰", "战略规划能力强"],
  "weaknesses": ["可能显得冷漠", "过度批判"],
  "careers": ["战略咨询师", "金融分析师"],
  "relationships": "您在关系中寻求深度和理解...",
  "growth": "建议您多参与社交活动..."
}
```

### Condition Operators

| Operator | Description |
|----------|-------------|
| `lt` | Less than |
| `gt` | Greater than |
| `lte` | Less than or equal |
| `gte` | Greater than or equal |
| `eq` | Equal |

### Result Profile Rules

- MUST have at least one result profile
- `id` MUST be unique within the assessment
- Must have either `scores` OR `conditions` (or both)
- Extended fields (`strengths`, `weaknesses`, `careers`, etc.) are optional

## Version Levels

### Lite

- Quick assessment for initial exploration
- Typically 8-12 questions
- Estimated time: 3-5 minutes
- Usually `recommended: false`

### Standard

- Full assessment with balanced coverage
- Typically 20-40 questions
- Estimated time: 10-20 minutes
- Usually `recommended: true`

### Expert

- Comprehensive assessment for detailed analysis
- Typically 50-100 questions
- Estimated time: 25-45 minutes
- Often `status: beta`

## Status Lifecycle

```
preparing → beta → active → deprecated
                ↘ maintenance ↗
```

### Status Meanings

| Status | Meaning | User Experience |
|--------|---------|----------------|
| `preparing` | Not yet functional | Shows "Coming Soon" page |
| `beta` | Functional but testing | Normal flow with beta badge |
| `active` | Ready for production | Full access |
| `maintenance` | Temporarily unavailable | Shows maintenance message |
| `deprecated` | No longer supported | Shows unavailable page |

### Status Rules

- `preparing` assessments MUST have questions array (can be empty) but SHOULD NOT be accessible
- `beta` assessments MUST have complete questions and result profiles
- `active` assessments MUST be fully functional with all required fields
- `deprecated` assessments should remain in registry for historical reference

## Validation Rules

### Pre-Load Validation (Build Time)

Run `npm run validate` to check:

1. **Registry Consistency**
   - All `filePath` entries exist
   - All `familyId` references are valid
   - All `versionLevel` values are correct

2. **Content Schema**
   - Required fields present
   - Field types correct
   - Arrays have minimum required length

3. **Cross-Reference Integrity**
   - `question.dimension` references existing dimension
   - `resultProfile.conditions[*].dimension` references existing dimension
   - `resultProfile.scores` keys match dimensions

4. **Content Completeness**
   - `questionCount` matches `questions.length`
   - All questions have required options
   - All result profiles have either scores or conditions

### Runtime Validation (Content Service)

The `contentService` validates on every load:

1. Required fields presence
2. Type correctness
3. Dimension reference validity
4. Score calculation readiness

## Registry Specifications

### Assessment Registry (`registry.json`)

```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-03-21",
  "assessments": [
    {
      "id": "mbti-standard",
      "slug": "mbti-standard",
      "familyId": "mbti",
      "familyName": "MBTI 职业性格测试",
      "category": "personality",
      "name": "MBTI 标准版",
      "description": "...",
      "shortDescription": "...",
      "estimatedMinutes": 15,
      "questionCount": 32,
      "difficulty": "easy",
      "tags": [...],
      "filePath": "assessments/personality/mbti/standard.json",
      "version": "1.0.0",
      "status": "active",
      "versionLevel": "standard",
      "recommended": true
    }
  ]
}
```

### Family Registry (`family-registry.json`)

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-21",
  "families": [
    {
      "familyId": "mbti",
      "familyName": "MBTI 职业性格测试",
      "category": "personality",
      "description": "...",
      "shortDescription": "...",
      "icon": "mbti-icon",
      "color": "#4F46E5",
      "versions": [
        {
          "level": "lite",
          "name": "MBTI 简单版",
          "description": "12道题快速体验",
          "estimatedMinutes": 5,
          "questionCount": 12,
          "recommended": false,
          "status": "active"
        }
      ],
      "tags": ["人格", "性格", "职业"]
    }
  ]
}
```

## Loading Content

### Using Content Service

```typescript
import { loadAssessment, loadAssessmentSafe, loadFamily } from '@/features/assessment/contentService';

// Direct load (throws on error)
const assessment = await loadAssessment('assessments/personality/mbti/standard.json');

// Safe load (returns result type)
const result = await loadAssessmentSafe('assessments/personality/mbti/standard.json');
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error, result.code);
}

// Load family metadata
const family = await loadFamily('mbti');
```

### Using Registry Service

```typescript
import { fetchAssessmentRegistry, getRecommendedVersion } from '@/features/assessment/registry';

// Get all assessments
const registry = await fetchAssessmentRegistry();
const assessments = registry.assessments;

// Get recommended version for a family
const recommended = await getRecommendedVersion('mbti');
```

## Adding New Content

### Step 1: Create Family Entry

Add entry to `family-registry.json`:

```json
{
  "familyId": "new-assessment",
  "familyName": "新测评",
  "versions": [
    {
      "level": "lite",
      "name": "新测评简化版",
      "status": "preparing"
    }
  ]
}
```

### Step 2: Create Assessment File

Create `public/assessments/{category}/new-assessment/lite.json`:

```json
{
  "id": "new-assessment-lite",
  "slug": "new-assessment-lite",
  "familyId": "new-assessment",
  "familyName": "新测评",
  "category": "personality",
  "version": "1.0.0",
  "versionLevel": "lite",
  "name": "新测评简化版",
  "description": "...",
  "estimatedMinutes": 5,
  "questionCount": 10,
  "dimensions": [...],
  "questions": [...],
  "scoring": {...},
  "resultProfiles": [...],
  "status": "preparing"
}
```

### Step 3: Register Assessment

Add to `registry.json`:

```json
{
  "id": "new-assessment-lite",
  "filePath": "assessments/personality/new-assessment/lite.json",
  "status": "preparing",
  "versionLevel": "lite"
}
```

### Step 4: Validate

Run `npm run validate` to check for issues.

### Step 5: Activate

When ready, update `status` from `preparing` to `active` (or `beta`) in both the JSON file and registry.

## Validation Commands

```bash
# Run content validation
npm run validate

# Validate and build (for CI/CD)
npm run validate:build
```

## Best Practices

1. **Always run validation** before committing new content
2. **Use consistent IDs** across files (familyId, dimension ids)
3. **Keep questions focused** - one dimension per question
4. **Provide complete result profiles** - at least 3-5 for most assessments
5. **Test with active status** only after full validation passes
6. **Use beta status** for new versions before marking active
