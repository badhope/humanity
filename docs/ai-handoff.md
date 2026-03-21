# HumanOS AI Handoff Document

## For AI Agents Continuing Development

This document provides critical context for AI agents continuing development on HumanOS. Read this BEFORE making any changes.

## Project Status

HumanOS is a **modular assessment platform** currently in active development. The platform is shifting from ad-hoc assessment implementations to a **registry-driven, plugin-based architecture**.

### Current Completion State

**Completed:**
- Core platform architecture (plugin system, registry system, content service)
- MBTI assessment as the reference implementation (fully functional)
- Basic routing and page structure
- Plugin registries for question renderers and result blocks
- Content validation system (Zod schemas + validation script)
- Content loading service with caching
- Documentation structure

**In Progress:**
- Stabilizing all assessment content (JSON files)
- Expanding assessment catalog
- Adding more question types and result blocks

**Planned:**
- User progress persistence
- Analytics integration
- Remote content support
- Custom assessment creation

## Architecture Decisions (DO NOT CHANGE)

### 1. Registry-Driven Architecture

ALL content MUST be registered. Never hardcode content paths.

**Correct:**
```typescript
const registry = await fetchAssessmentRegistry();
const assessment = registry.assessments.find(a => a.slug === slug);
const content = await loadAssessment(assessment.filePath);
```

**WRONG - Never do this:**
```typescript
const content = await fetch('/assessments/mbti/standard.json');
```

### 2. Family/Version System

Assessments are organized into families with multiple versions:

- **Family**: The assessment type (e.g., "MBTI", "Resilience")
- **Version Level**: `lite` (quick), `standard` (recommended), `expert` (comprehensive)

This applies to ALL assessments, not just MBTI.

### 3. Content/Code Separation

Content lives in JSON files only. Code handles rendering and logic. Never embed content in TypeScript/React files.

### 4. Plugin System

Extensibility through registries:
- `questionRendererPlugin.ts` - Question type renderers
- `resultBlockPlugin.ts` - Result display blocks

To add new types, register in the plugin, don't hardcode in pages.

### 5. Centralized Content Loading

Use `contentService.ts` for ALL content loading. It provides:
- Caching
- Validation
- Error handling

## Critical Implementation Rules

### MUST DO

1. **Always run `npm run validate`** after modifying any JSON content
2. **Always run `npm run validate:build`** before deployment
3. **Always use `contentService`** for loading assessments
4. **Always use registry functions** for discovering assessments
5. **Always follow the schema** when creating new assessment JSON
6. **Keep MBTI working** - it is the reference implementation

### NEVER DO

1. **NEVER** directly `fetch()` JSON files in page components
2. **NEVER** hardcode assessment file paths in page code
3. **NEVER** skip validation before deployment
4. **NEVER** mark an assessment `active` if it fails validation
5. **NEVER** modify MBTI JSON files unless fixing bugs
6. **NEVER** bypass the plugin system for question rendering
7. **NEVER** create new question type logic outside the plugin system

## Current Module/Family/Assessment Status

### Active (Fully Functional)

| Assessment | Family | Versions |
|------------|--------|----------|
| MBTI | mbti | lite (active), standard (active), expert (beta) |

### Preparing (Not Yet Accessible)

| Assessment | Family | Status |
|------------|--------|--------|
| Resilience | resilience | lite, standard, expert |
| Stress Check | stress | single file |
| Focus | focus | lite, standard, expert |
| Values | values | lite, standard, expert |
| Holland Career | holland | lite, standard, expert |

### Content Issues (Known)

Several JSON files have validation errors:
- Syntax errors (missing commas)
- Missing required fields (`familyId`, `familyName`)
- Inconsistent schema (old format vs new format)

Run `npm run validate` to see all issues. These need fixing before those assessments can be activated.

## Key Files to Know

### Content Loading
- `src/features/assessment/contentService.ts` - Load & validate content
- `src/features/assessment/registry.ts` - Registry access

### Plugin System
- `src/shared/plugins/questionRendererPlugin.ts` - Question renderers
- `src/shared/plugins/resultBlockPlugin.ts` - Result blocks

### Validation
- `scripts/validate-content.ts` - Content validation script
- `src/shared/schemas/assessmentSchemas.ts` - Zod schemas

### State
- `src/stores/quizStore.ts` - Quiz flow state

### Documentation
- `docs/architecture.md` - Architecture details
- `docs/content-system.md` - Content schema & loading
- `docs/developer-guide.md` - How to add content/features

## Recommended Development Order

### Phase 1: Fix Current Issues

1. Fix JSON syntax errors in existing assessment files
2. Run `npm run validate` to verify all content is valid
3. Fix any registry inconsistencies

### Phase 2: Stabilize Platform

1. Ensure all registry entries point to valid files
2. Ensure all active assessments pass validation
3. Ensure MBTI continues working throughout changes

### Phase 3: Expand Content

1. Activate Resilience assessment (after fixing JSON)
2. Add more question types
3. Add more result block types

### Phase 4: Enhance Features

1. User progress persistence
2. Analytics integration
3. Better result visualization

## What NOT to Touch First

1. **DO NOT** modify MBTI JSON files unless specifically fixing bugs
2. **DO NOT** change the plugin registration system
3. **DO NOT** refactor the registry system
4. **DO NOT** add complex features (auth, user accounts, etc.)
5. **DO NOT** change the routing structure
6. **DO NOT** add new assessment categories without updating registries

## Common Pitfalls

### Pitfall 1: Direct Fetching

**Wrong:**
```typescript
const res = await fetch('/assessments/mbti/standard.json');
const data = await res.json();
```

**Right:**
```typescript
import { loadAssessment } from '@/features/assessment/contentService';
const data = await loadAssessment('assessments/personality/mbti/standard.json');
```

### Pitfall 2: Hardcoded Paths

**Wrong:**
```typescript
const path = '/assessments/' + slug + '/' + version + '.json';
```

**Right:**
```typescript
const registry = await fetchAssessmentRegistry();
const item = registry.assessments.find(a => a.slug === slug);
const data = await loadAssessment(item.filePath);
```

### Pitfall 3: Skipping Validation

**Wrong:**
1. Create new assessment JSON
2. Mark as `active`
3. Deploy

**Right:**
1. Create new assessment JSON
2. Mark as `preparing`
3. Run `npm run validate`
4. Fix errors
5. Change to `beta`
6. Test thoroughly
7. Change to `active`
8. Run `npm run validate:build` before deploy

## Environment Variables

- `import.meta.env.BASE_URL` - Base path for GitHub Pages deployment
- `import.meta.env.PROD` - Production mode flag
- `import.meta.env.DEV` - Development mode flag

## Build & Deploy Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run validate     # Validate content only
npm run validate:build  # Validate and build
npm run typecheck    # Type checking
npm run lint         # Linting
```

## Getting Help

If you're unsure about something:

1. Read `docs/architecture.md` for architecture context
2. Read `docs/content-system.md` for content loading context
3. Read `docs/developer-guide.md` for implementation patterns
4. Look at MBTI implementation as reference
5. Run `npm run validate` to see current issues

## Final Reminders

- MBTI is the reference - keep it working
- Validation is mandatory - never skip it
- Registry is the source of truth - always use it
- Plugin system is the extension point - use it, don't bypass it
- Content in JSON, code in TypeScript/React - keep them separate

Good luck with the development!
