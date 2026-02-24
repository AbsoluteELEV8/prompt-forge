# PromptForge Architecture

This document describes the system architecture, data flow, and module design of PromptForge.

---

## System Overview

PromptForge is a creative prompt engineering dashboard that transforms vague user input into platform-optimized prompts for AI image and video generators. The system uses Claude for analysis and refinement, a plugin-style platform adapter layer for formatting, and a Zustand-managed React frontend for the user interface.

**Data flow (high level):**

```
User Input → Refine Engine (Claude) → Context Q&A → Preset Merge → Platform Adapter → Formatted Output
```

---

## Core Modules

### 1. Refine Engine (`src/lib/refine-engine.ts`)

The Refine Engine is the LLM-powered core that:

- **Analyzes** raw prompts via `analyzePrompt()` — returns structured `PromptAnalysis` (intent, subject, style, mood, technicalDetails, ambiguityScore)
- **Generates questions** via `generateQuestions()` — produces directed Q&A when the prompt is vague (style, mood, context, purpose)
- **Refines prompts** via `refinePrompt()` — enriches the prompt with vivid visual language, merges presets, and delegates final formatting to the platform adapter

Uses Anthropic Claude (`claude-sonnet-4-20250514`) with two system prompts: one for analysis (JSON output) and one for refinement (plain text output).

### 2. Prompt Builder (`src/lib/prompt-builder.ts`)

Assembles the base prompt before platform-specific formatting:

- `buildBasePrompt(analysis)` — combines subject, intent, style, mood, and technical details into a comma-separated string
- `buildPrompt(analysis, presets, platform)` — calls the platform adapter's `formatPrompt()` with the base prompt and preset selections

### 3. Platform Adapters (`src/lib/platform-adapters/`)

Plugin-style modules that implement the `PlatformAdapter` interface. Each adapter:

- Formats the prompt for the platform's syntax (e.g., Midjourney `--ar`, `--v`; Stable Diffusion negative prompts)
- Builds platform-specific parameters (aspect ratio, model version, etc.)
- Resolves preset fragments via shared `utils.ts` (`resolvePresetFragments`, `resolveAspectRatio`)

Adapters are registered in `index.ts` and retrieved via `getAdapter(platform)`.

### 4. Zustand Store (`src/store/prompt-store.ts`)

Client-side state management:

- **State**: `userPrompt`, `presetSelections`, `selectedPlatform`, `refinedPrompt`, `parameters`, `isRefining`, `error`, `questions`, `answers`
- **Actions**: `setUserPrompt`, `togglePreset`, `clearCategoryPresets`, `setSelectedPlatform`, `forgePrompt`, `setAnswer`, `applyAnswers`, `reset`
- **API integration**: `forgePrompt` and `applyAnswers` call `/api/refine`; if the API returns questions, the store updates `questions` and waits for `applyAnswers` with user answers

### 5. Dashboard UI (`src/components/`)

- **dashboard.tsx** — Main layout, orchestrates child components
- **prompt-input.tsx** — Text input for raw prompt
- **preset-panel.tsx** — Category accordions with preset chips
- **qa-section.tsx** — Renders follow-up questions and answer inputs
- **platform-selector.tsx** — Platform picker
- **prompt-output.tsx** — Displays refined prompt and copy-to-clipboard

---

## Platform Adapter Plugin Architecture

### Interface

```ts
interface PlatformAdapter {
  id: PlatformId;
  name: string;
  description: string;
  type: 'image' | 'video' | 'both';
  supportedAspectRatios: string[];
  formatPrompt(basePrompt: string, presets: PresetSelection): string;
  buildParameters(presets: PresetSelection): Record<string, unknown>;
}
```

### Registry

Adapters are stored in `adapterMap: Record<PlatformId, PlatformAdapter>` in `index.ts`. Exports:

- `getAdapter(platform)` — returns adapter for a given platform
- `getAllAdapters()` — returns all adapters
- `adapterMap` — raw map for iteration

### Adding a New Adapter

1. Create `src/lib/platform-adapters/<platform-id>.ts`
2. Implement `PlatformAdapter` (use `resolvePresetFragments` and `resolveAspectRatio` from `utils.ts`)
3. Import and add to `adapterMap` in `index.ts`
4. Add platform to `src/data/platforms.ts` and `PlatformId` in `src/lib/types.ts`

---

## Data Flow (Detailed)

1. **User Input** — User types a raw prompt and optionally selects presets and platform.
2. **Forge** — User clicks "Forge" → `forgePrompt()` calls `POST /api/refine` with `{ input, presets, platform }`.
3. **Refine Engine (Claude)** — API calls `analyzePrompt(input)` → gets `PromptAnalysis`.
4. **Questions** — If no answers provided, `generateQuestions(analysis)` runs. If questions exist, API returns `{ success: true, questions }` and the UI shows the Q&A section.
5. **Apply Answers** — User fills answers → `applyAnswers()` calls `POST /api/refine` with `{ input, presets, platform, answers }`.
6. **Refinement** — API calls `refinePrompt(input, presets, platform, answers)`:
   - `analyzePrompt(input)` (again)
   - `buildPrompt(analysis, presets, platform)` → base prompt + adapter formatting
   - Claude refines with context (original input, platform, assembled prompt, answers)
   - Adapter `buildParameters(presets)` → platform params
7. **Output** — API returns `{ success: true, data: RefinedPrompt }`; store updates `refinedPrompt` and `parameters`; UI shows output with copy button.

---

## API Routes

### `POST /api/refine`

**Request body:**

```ts
{
  input: string;        // Required — raw user prompt
  presets: PresetSelection;
  platform: PlatformId;
  answers?: Record<string, string>;  // Q&A answers when re-calling after questions
}
```

**Response (questions flow):**

```ts
{ success: true, questions: string[] }
```

**Response (refinement success):**

```ts
{
  success: true,
  data: {
    platform: PlatformId;
    prompt: string;
    negativePrompt?: string;
    parameters: Record<string, unknown>;
    metadata: { originalInput, presetsApplied, refinementTimestamp, modelUsed };
  }
}
```

**Error response:**

```ts
{ success: false, error: string }
```

---

## State Management (Zustand Store Shape)

```ts
interface PromptState {
  userPrompt: string;
  presetSelections: Required<PresetSelection>;  // All 8 categories, arrays of preset IDs
  selectedPlatform: PlatformId;
  refinedPrompt: string | null;
  parameters: Record<string, unknown>;
  isRefining: boolean;
  error: string | null;
  questions: Question[];
  answers: Record<string, string>;
  // ... actions
}
```

`PresetSelection` keys: `aspectRatios`, `lighting`, `cameras`, `filmStocks`, `atmospheres`, `artStyles`, `compositions`, `colorPalettes`.

---

## Preset Data Structure

```ts
interface Preset {
  id: string;
  label?: string;
  name?: string;
  promptFragment?: string;
  value?: string;
  description: string;
  [key: string]: unknown;
}

interface PresetCategory {
  id: PresetCategoryId;
  name: string;
  icon: string;
  presets: Preset[];
}
```

Presets are defined in `src/data/presets.ts` as `PRESET_CATEGORIES`. The `value` or `promptFragment` field is used by adapters when resolving preset fragments.

---

## Frontend Component Hierarchy

```
page.tsx (App)
└── layout.tsx
    └── dashboard.tsx
        ├── prompt-input.tsx
        ├── preset-panel.tsx
        ├── qa-section.tsx (conditional — when questions exist)
        ├── platform-selector.tsx
        └── prompt-output.tsx (conditional — when refinedPrompt exists)
```

All components consume `usePromptStore()` for state and actions.

---

Author: Charley Scholz, ELEV8  
Co-authored: Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)  
Last Updated: 2026-02-23
