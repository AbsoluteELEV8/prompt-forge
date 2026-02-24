# CLAUDE.md — PromptForge AI Assistant Guidelines

> **Read this file first every session.** Then read `tasks/todo.md`, `tasks/lessons.md`, and `.cursor/rules/`.

## Project Identity

**PromptForge** is a creative prompt engineering application that transforms vague end-user prompts into platform-optimized creative prompts through directed Q&A, dashboard controls, and preset libraries.

Target platforms: Midjourney, Stable Diffusion / ComfyUI, Runway, Kling, Adobe Firefly, Google Veo 3, Nano Banana, Grok Aurora (placeholder).

## Quick Facts

| Aspect | Value |
|--------|-------|
| **Framework** | Next.js 15 + React 19 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Runtime** | Node.js 22 |
| **Language** | TypeScript 5.9+ (strict mode) |
| **State** | Zustand |
| **Primary LLM** | Claude via `@anthropic-ai/sdk` |
| **Package Manager** | npm |

## Session Startup Protocol

1. Read this file (`CLAUDE.md`)
2. Read `tasks/todo.md` — current task state and priorities
3. Read `tasks/lessons.md` — patterns to avoid, corrections from past sessions
4. Scan `.cursor/rules/` — active enforcement rules
5. Identify the active task and resume or await instructions

## Things You MUST Do

- **TypeScript strict mode** — `strict: true` in tsconfig, no escape hatches
- **All presets live in `src/data/presets/`** — one JSON/TS file per category, never inline preset data in components
- **Platform adapters are plugin modules** — every adapter lives in `src/lib/platform-adapters/` and exports a `PlatformAdapter` interface
- **Every adapter implements `PlatformAdapter`** — no exceptions, no partial implementations
- **Import ordering** — React → Next.js → third-party → local modules → types
- **Error boundaries** — wrap major UI sections; refine engine must handle LLM errors gracefully
- **Functional components only** — no class components
- **Update `tasks/todo.md`** after completing task groups
- **Update `tasks/lessons.md`** after any user correction

## Things to NEVER Do

- **NEVER hardcode prompts** — all prompt templates go through the refine engine or preset system
- **NEVER put platform-specific logic outside adapters** — platform knowledge is encapsulated in `src/lib/platform-adapters/`
- **NEVER use `any` type** — use `unknown` + type narrowing if the type is truly dynamic
- **NEVER use `console.log` in production code** — use structured error handling or a logger utility
- **NEVER commit API keys** — `.env.local` is gitignored; use `.env.example` for shape
- **NEVER bypass the PlatformAdapter interface** — all platform output goes through an adapter
- **NEVER skip plan mode for multi-step tasks** — plan first, then build

## Common Tasks

### Add a New Platform Adapter

1. Create `src/lib/platform-adapters/<platform-name>.ts`
2. Implement the `PlatformAdapter` interface (see `.claude/skills/platform-adapters/SKILL.md`)
3. Register the adapter in `src/lib/platform-adapters/index.ts`
4. Add platform-specific presets if needed in `src/data/presets/`
5. Test: verify the adapter transforms a generic refined prompt into valid platform syntax

### Add a New Preset Category

1. Create `src/data/presets/<category>.ts` exporting a typed array of presets
2. Each preset must include: `id`, `label`, `description`, `tags`, `platformHints`
3. Register the category in the preset index
4. Add UI controls in the dashboard for the new category

### Modify the Refine Engine

1. The refine engine lives in `src/lib/refine-engine.ts`
2. It orchestrates: user input → context Q&A → preset injection → LLM call → structured output
3. System prompt templates are in `src/lib/prompts/`
4. Test changes by running a refinement cycle end-to-end before marking complete

## Architecture Overview

```
User Input (vague prompt)
    │
    ▼
┌─────────────────┐
│  Refine Engine   │ ← orchestrates the full pipeline
│                  │
│  1. Analyze      │ ← parse user intent, detect ambiguity
│  2. Q&A Flow     │ ← directed questions to gather context
│  3. Dashboard    │ ← user selects presets, adjusts controls
│  4. Build Prompt │ ← combine intent + context + presets
│  5. Adapt        │ ← platform adapter transforms output
└─────────────────┘
    │
    ▼
Platform-Optimized Prompt
    (Midjourney / SD / Runway / Kling / Firefly / Veo 3 / Nano Banana / Grok Aurora)
```

### Key Directories

```
src/
├── app/                    Next.js App Router pages and API routes
│   └── api/refine/         Refinement API endpoint
├── components/             React components
│   └── ui/                 shadcn/ui primitives
├── data/presets/            Preset libraries (style, lighting, camera, etc.)
├── lib/
│   ├── platform-adapters/  Platform-specific output formatters
│   ├── prompts/            LLM system prompt templates
│   └── refine-engine.ts    Core refinement orchestrator
└── store/                  Zustand state management
```

## AI Development Tooling

| Tool | Purpose |
|------|---------|
| **CLAUDE.md** | Project brain — read first every session |
| **`.cursor/rules/*.mdc`** | Auto-enforced coding and workflow rules |
| **`.claude/skills/*/SKILL.md`** | Domain expertise loaded on demand |
| **`.cursor/agents/*.md`** | Subagent definitions for delegated tasks |
| **`tasks/todo.md`** | Current task tracking with checkable items |
| **`tasks/lessons.md`** | Correction log — prevents repeat mistakes |

### Rule Files

| Rule | Scope |
|------|-------|
| `workflow-orchestration.mdc` | Planning, verification, task management |
| `coding-standards.mdc` | TypeScript, imports, naming, error handling |
| `frontend-patterns.mdc` | Next.js, shadcn/ui, Tailwind, a11y |
| `prompt-engineering.mdc` | Refine engine, adapters, presets, Q&A flows |

### Skills

| Skill | Trigger |
|-------|---------|
| `prompt-refinement` | Working on refine engine or prompt quality |
| `platform-adapters` | Adding or modifying platform adapters |

### Subagents

| Agent | Use When |
|-------|----------|
| `prompt-forge-agent` | Orchestrating prompt refinement tasks, testing prompt quality |

---

Author: Charley Scholz, ELEV8
Co-authored: Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
Last Updated: 2026-02-23
