# PromptForge — Project Overview

> **Version:** 0.1.0 | **Author:** Charley Scholz, ELEV8 | **Co-authored:** Claude 4.6 Opus

---

## Why It Exists

Creatives working with AI image and video generation tools face a recurring problem: the gap between what they *imagine* and what they *type*. A filmmaker might think "moody shot of a city at night" but Midjourney needs `cinematic wide shot, rain-slicked streets, volumetric fog, neon reflections, Arri Alexa, anamorphic bokeh, Kodak Vision3 500T --ar 2.39:1 --v 6.1` to produce something worth using.

**PromptForge** bridges that gap. It takes any prompt — no matter how vague — and transforms it into a platform-optimized prompt through:

1. **AI-powered analysis** of what the user actually wants
2. **Directed Q&A** to fill in missing context
3. **Preset selections** for technical parameters (lighting, cameras, film stocks, etc.)
4. **Platform-specific formatting** that matches each tool's syntax and capabilities

The result: creatives focus on their vision, PromptForge handles the technical translation.

---

## How It Works

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript 5.7 (strict mode) |
| State | Zustand 5 |
| LLM | Claude Sonnet via `@anthropic-ai/sdk` |
| Styling | Tailwind CSS + Lucide React icons |
| Theme | Dark mode with amber accents |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD UI (React)                       │
│  PromptInput │ PresetPanel │ PlatformSelector │ PromptOutput │
└──────────────────────────┬──────────────────────────────────┘
                           │ Zustand Store
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   API ROUTE (POST /api/refine)                │
└──────────────────────────┬───────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       Refine Engine  Prompt Builder  Platform Adapters (8)
       (Claude LLM)   (assembly)     (formatting + params)
```

### Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| **Refine Engine** | `src/lib/refine-engine.ts` | Calls Claude to analyze prompts, generate questions, and refine output |
| **Prompt Builder** | `src/lib/prompt-builder.ts` | Assembles base prompt from analysis + selected presets |
| **Platform Adapters** | `src/lib/platform-adapters/` | 8 plugin modules that format prompts for specific platforms |
| **Zustand Store** | `src/store/prompt-store.ts` | Client-side state: user input, presets, platform, Q&A, output |
| **Preset Data** | `src/data/presets/` | 8 JSON files with 60+ presets across categories |
| **Dashboard** | `src/components/` | 6 React components composing the full UI |

---

## End-to-End Workflow

### Step 1: User Input

The user types a prompt (e.g., *"a lonely astronaut on mars"*), selects presets from 8 categories (aspect ratio, lighting, camera, film stock, atmosphere, art style, composition, color palette), and picks a target platform.

### Step 2: Forge (First API Call)

Clicking **"Forge Prompt"** sends a POST to `/api/refine` with the raw input, selected presets, and platform.

The API route:
1. Calls `analyzePrompt()` — Claude analyzes the prompt and returns structured JSON: intent, subject, style, mood, technical details, and an **ambiguity score** (0-1)
2. Calls `generateQuestions()` — based on the analysis, generates targeted follow-up questions (e.g., *"What time of day? What emotional tone? Is this photorealistic or stylized?"*)
3. Returns the questions to the client

### Step 3: Q&A (Optional)

If the engine detected ambiguity, the UI shows a Q&A section. The user answers the clarifying questions. This is the "directed context" that turns a vague idea into a specific vision.

### Step 4: Refinement (Second API Call)

The user clicks **"Apply Answers & Re-forge"**. The API route now:
1. Re-analyzes the prompt (with answers as additional context)
2. Calls `buildPrompt()` — assembles a base prompt from the analysis + preset fragments
3. Passes the base prompt to the platform adapter's `formatPrompt()` — applies platform-specific syntax
4. Calls Claude again with a refinement system prompt — enhances the assembled prompt with creative detail
5. Calls the adapter's `buildParameters()` — generates platform-specific technical parameters
6. Returns the final `RefinedPrompt` with the formatted prompt, optional negative prompt, parameters, and metadata

### Step 5: Output

The refined prompt appears in the output panel. The user copies it and pastes it into their platform of choice.

---

## Practical Example

**User types:** `"a cat in space"`
**Selects:** Midjourney | 16:9 | Cinematic lighting | 35mm lens | Kodak Portra | Foggy atmosphere | Photorealistic | Rule of thirds | Cool palette

### Analysis Phase

Claude analyzes and returns:
```json
{
  "intent": "image generation",
  "subject": "cat in space",
  "style": "unspecified",
  "mood": "unspecified",
  "technicalDetails": [],
  "ambiguityScore": 0.8
}
```

### Q&A Phase

PromptForge asks:
- *"What kind of space environment? (space station interior, floating in orbit, planet surface)"*
- *"What's the emotional tone? (whimsical, lonely, epic, surreal)"*
- *"Is the cat wearing anything? (spacesuit, helmet, nothing)"*

User answers: *"floating in orbit near Earth"*, *"whimsical and wonder-filled"*, *"tiny spacesuit with helmet visor open"*

### Refinement Phase

The prompt builder assembles:
```
photorealistic photograph, cat in tiny spacesuit floating in orbit near Earth,
cinematic lighting, shot on 35mm lens, Kodak Portra 400 film stock,
atmospheric fog, rule of thirds composition, cool color palette
```

Claude refines this into:
```
A whimsical yet photorealistic photograph of a small orange tabby cat
floating weightlessly in low Earth orbit, wearing a miniature white spacesuit
with the helmet visor flipped open, whiskers drifting in zero gravity,
Earth's blue curve filling the lower third of the frame, cinematic golden-hour
sunlight filtering through the atmosphere's edge, shot on 35mm f/1.4 lens,
Kodak Portra 400 color science with creamy skin tones and gentle grain,
subtle atmospheric haze, cool teal and cobalt palette with warm amber highlights,
rule of thirds composition with the cat positioned at the upper-left power point
--ar 16:9 --v 6.1
```

### Output
```
Platform: Midjourney
Parameters: { v: "6.1", ar: "16:9" }
```

---

## Supported Platforms

| Platform | Type | Format Style | Key Parameters |
|----------|------|--------------|----------------|
| **Midjourney** | Image | Comma-separated + `--ar`, `--v` flags | Version 6.1, 13 aspect ratios |
| **Stable Diffusion** | Image | Positive/Negative prompt sections with weights | Resolution, steps (30), CFG scale (7.5), DPM++ 2M Karras sampler |
| **Runway Gen-3** | Video | `[Visual]`, `[Motion]`, `[Camera]` sections | Duration (10s), motion intensity, interpolation |
| **Kling AI** | Video | `Scene:`, `Motion:`, `Camera:` format | Duration (5s), creativity (0.5), camera control |
| **Adobe Firefly** | Image | Natural language (period-separated) | Content type, visual intensity, style strength |
| **Google Veo 3** | Video | `[Scene]`, `[Camera]`, `[Audio]` sections | 1080p, 24fps, 6s duration, audio generation |
| **Nano Banana** | Both | Natural language (period-separated) | Pro-v2 model, 2048x2048, generate/inpaint/outpaint modes |
| **Grok Aurora** | Image | Comma-separated (placeholder) | Photorealistic strength (API pending) |

Each adapter implements `formatPrompt()` for syntax formatting and `buildParameters()` for technical defaults.

---

## Preset Categories

| Category | Presets | What It Controls |
|----------|---------|------------------|
| **Aspect Ratio** | 7 (1:1, 16:9, 9:16, 4:3, 3:2, 21:9, 2:3) | Frame dimensions — filtered by platform support |
| **Lighting** | 13 (golden hour, studio, neon, natural, dramatic, backlit, volumetric, moonlight...) | Light source, mood, intensity |
| **Camera + Lens** | 12 (35mm, 50mm, 85mm, wide angle, macro, telephoto, fisheye, tilt-shift...) | Perspective, depth of field, focal characteristics |
| **Film Stock** | 7 (Portra 400, Ektar 100, HP5 Plus, Velvia 50, CineStill 800T, Tri-X 400, Superia 400) | Color science, grain, contrast |
| **Atmosphere** | 7 (foggy, rain, dusty, smoke, clear, snow, underwater) | Environmental mood and visual texture |
| **Art Style** | 8 (photorealistic, oil painting, watercolor, 3D render, anime, comic, pixel art, concept art) | Rendering approach |
| **Composition** | 8 (rule of thirds, centered, leading lines, close-up, bird's eye, worm's eye, Dutch angle, negative space) | Framing and layout |
| **Color Palette** | 8 (warm, cool, monochrome, pastel, neon, earth tones, B&W, vintage) | Color scheme and mood |

Each preset contains a `promptFragment` that gets merged into the final prompt. Aspect ratios use a `value` field with platform compatibility data.

---

## UI Components

| Component | File | Role |
|-----------|------|------|
| **Dashboard** | `dashboard.tsx` | Main layout orchestrator — header, sidebar, center panel |
| **PromptInput** | `prompt-input.tsx` | Auto-resizing textarea with character count (max 2000) |
| **PresetPanel** | `preset-panel.tsx` | Accordion-style selector with togglable chips per category |
| **PlatformSelector** | `platform-selector.tsx` | Horizontal badge bar with type indicators (Image/Video/Both) |
| **QASection** | `qa-section.tsx` | Collapsible Q&A panel — appears when engine detects ambiguity |
| **PromptOutput** | `prompt-output.tsx` | Displays refined prompt with copy-to-clipboard and parameter badges |

### Design

- Dark theme with amber (`#f59e0b`) accents
- Responsive: stacked on mobile, sidebar + center on desktop
- Sticky header with backdrop blur
- Loading spinners during API calls

---

## Application State (Zustand Store)

```
userPrompt          → Raw text input from the user
presetSelections    → 8 arrays (one per category) of selected preset IDs
selectedPlatform    → Current target platform ID (default: midjourney)
refinedPrompt       → Final output string (null until forged)
parameters          → Platform-specific parameter object
isRefining          → Loading flag during API calls
error               → Error message string (null when clean)
questions           → Array of {id, text} from the analysis phase
answers             → Map of questionId → user's answer text
```

**Key actions:** `forgePrompt()` (initial call), `applyAnswers()` (re-forge with Q&A), `togglePreset()`, `reset()`

---

## API Contract

**Endpoint:** `POST /api/refine`

**Request:**
```json
{
  "input": "a cat in space",
  "platform": "midjourney",
  "presets": { "lighting": ["lt-golden"], "cameras": ["cl-35mm"] },
  "answers": { "What environment?": "floating in orbit" }
}
```

**Response (questions flow):**
```json
{
  "success": true,
  "questions": ["What kind of space environment?", "What emotional tone?"]
}
```

**Response (refinement success):**
```json
{
  "success": true,
  "data": {
    "platform": "midjourney",
    "prompt": "A whimsical photograph of a cat...",
    "negativePrompt": null,
    "parameters": { "v": "6.1", "ar": "16:9" },
    "metadata": {
      "originalInput": "a cat in space",
      "presetsApplied": ["lt-golden", "cl-35mm"],
      "refinementTimestamp": "2026-02-24T...",
      "modelUsed": "claude-sonnet-4-20250514"
    }
  }
}
```

---

## File Structure

```
prompt-forge/
├── src/
│   ├── app/
│   │   ├── api/refine/route.ts          # POST endpoint — analysis + refinement
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Home page → Dashboard
│   ├── components/
│   │   ├── dashboard.tsx                # Main layout orchestrator
│   │   ├── prompt-input.tsx             # Textarea with character count
│   │   ├── preset-panel.tsx             # Accordion preset selectors
│   │   ├── platform-selector.tsx        # Platform badge bar
│   │   ├── qa-section.tsx               # Follow-up Q&A panel
│   │   └── prompt-output.tsx            # Refined prompt display + copy
│   ├── data/
│   │   ├── platforms.ts                 # 8 platform definitions
│   │   ├── presets.ts                   # Category definitions (simplified)
│   │   └── presets/                     # 8 JSON files with full preset data
│   │       ├── aspect-ratios.json
│   │       ├── lighting.json
│   │       ├── cameras.json
│   │       ├── film-stocks.json
│   │       ├── atmospheres.json
│   │       ├── art-styles.json
│   │       ├── compositions.json
│   │       └── color-palettes.json
│   ├── lib/
│   │   ├── types.ts                     # All shared TypeScript types
│   │   ├── refine-engine.ts             # Claude-powered analysis + refinement
│   │   ├── prompt-builder.ts            # Base prompt assembly
│   │   ├── utils.ts                     # cn(), copyToClipboard(), formatPlatformName()
│   │   └── platform-adapters/
│   │       ├── index.ts                 # Adapter registry (getAdapter, getAllAdapters)
│   │       ├── utils.ts                 # resolvePresetFragments, resolveAspectRatio
│   │       ├── midjourney.ts            # --ar, --v flag syntax
│   │       ├── stable-diffusion.ts      # Positive/Negative with weights
│   │       ├── runway.ts               # [Visual]/[Motion]/[Camera] sections
│   │       ├── kling.ts                # Scene:/Motion:/Camera: format
│   │       ├── firefly.ts              # Natural language format
│   │       ├── veo3.ts                 # [Scene]/[Camera]/[Audio] sections
│   │       ├── nano-banana.ts          # Natural language + editing modes
│   │       └── grok.ts                 # Placeholder (API pending)
│   └── store/
│       └── prompt-store.ts              # Zustand store (state + actions)
├── package.json
├── README.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── CHANGELOG.md
└── PROJECT_OVERVIEW.md                  # ← You are here
```

---

## Setup & Configuration

```bash
git clone https://github.com/AbsoluteELEV8/prompt-forge.git
cd prompt-forge
npm install
cp .env.example .env
# Set ANTHROPIC_API_KEY in .env
npm run dev
# Open http://localhost:3000
```

**Required:** `ANTHROPIC_API_KEY` — used by the refine engine for Claude API calls.

---

**Author:** Charley Scholz, ELEV8
**Co-authored:** Claude 4.6 Opus (AI), Cursor (IDE)
**Last Updated:** 2026-02-24
