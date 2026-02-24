# PromptForge — Transform any idea into a platform-perfect creative prompt

[![Version](https://img.shields.io/badge/version-0.1.0-amber)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

PromptForge transforms vague creative prompts into optimized, platform-specific prompts for 8 leading AI image and video generation tools. Powered by Claude, it analyzes your intent, gathers context through directed Q&A, merges your preset choices, and outputs copy-ready prompts tailored to each platform's syntax.

---

## What It Does

Enter a rough idea like *"a cat in a forest"* — PromptForge will:

1. **Analyze** your prompt using Claude to extract intent, subject, style, mood, and technical details
2. **Ask** targeted follow-up questions when the prompt is vague (e.g., style, mood, context)
3. **Merge** your preset selections (lighting, composition, film stock, etc.) into the final prompt
4. **Format** the output for the platform you choose (Midjourney, Stable Diffusion, Runway, etc.)
5. **Output** a polished prompt ready to paste into any supported AI generator

---

## Supported Platforms

| Platform | Type | Description |
|----------|------|-------------|
| **Midjourney** | Image | Premium AI image generation via Discord |
| **Stable Diffusion / ComfyUI** | Image | Open-source image generation |
| **Runway** | Video | AI video generation and editing |
| **Kling** | Video | Advanced AI video synthesis |
| **Adobe Firefly** | Image | Adobe's generative AI |
| **Google Veo 3** | Video | Google's video generation model |
| **Nano Banana** | Both | Image generation + editing suite |
| **Grok Aurora** | Image | xAI's image generation model (placeholder) |

---

## Features

- **LLM-powered prompt refinement** — Claude analyzes and enriches prompts with vivid, specific visual language
- **8 preset categories** — 100+ presets across Aspect Ratio, Lighting, Camera + Lens, Film Stock, Atmosphere, Art Style, Composition, Color Palette
- **Directed Q&A** — Context gathering when prompts are vague (style, mood, time of day, purpose)
- **Platform-specific formatting** — Each platform adapts its own syntax (e.g., Midjourney `--ar`, `--v`; Stable Diffusion negative prompts)
- **Beautiful dark-mode dashboard** — Amber forge theme with responsive layout

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=sk-ant-...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture Overview

```
User Input → Refine Engine (Claude) → Context Q&A → Preset Merge → Platform Adapter → Formatted Output
```

- **Refine Engine**: Uses Claude to analyze prompts and generate structured insights + refinement
- **Prompt Builder**: Assembles base prompt from analysis + presets
- **Platform Adapters**: Plugin-style modules that format prompts and build parameters per platform
- **Zustand Store**: Client-side state for prompt input, presets, platform selection, and refinement flow
- **Dashboard UI**: React components for input, preset selection, Q&A, platform selector, and output

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

---

## Preset Categories

| Category | Icon | Sample Presets |
|----------|------|----------------|
| **Aspect Ratio** | ⬜ | 1:1, 16:9, 9:16, 4:3, 3:2, 21:9, 2:3 |
| **Lighting** | 💡 | Golden Hour, Studio, Neon, Dramatic, Volumetric, Moonlight |
| **Camera + Lens** | 📷 | 35mm, 50mm, 85mm, Wide Angle, Macro, Fisheye, Tilt-Shift |
| **Film Stock** | 🎞️ | Portra 400, Ektar 100, HP5 Plus, Velvia 50, CineStill 800T |
| **Atmosphere** | 🌫️ | Foggy, Rainy, Dusty, Smoky, Crystal Clear, Snowy, Underwater |
| **Art Style** | 🎨 | Photorealistic, Oil Painting, Watercolor, 3D Render, Anime, Pixel Art |
| **Composition** | 📐 | Rule of Thirds, Centered, Leading Lines, Bird's Eye, Dutch Angle |
| **Color Palette** | 🎭 | Warm Tones, Cool Tones, Monochrome, Pastel, Neon, Earthy, B&W |

---

## Adding a New Platform Adapter

1. Create `src/lib/platform-adapters/<platform-id>.ts`
2. Implement the `PlatformAdapter` interface:
   - `id`, `name`, `description`, `type`, `supportedAspectRatios`
   - `formatPrompt(basePrompt, presets)` — returns formatted prompt string
   - `buildParameters(presets)` — returns platform-specific parameters

3. Register in `src/lib/platform-adapters/index.ts`:
   ```ts
   import { myPlatformAdapter } from './my-platform';
   adapterMap['my-platform'] = myPlatformAdapter;
   ```

4. Add platform to `src/data/platforms.ts` and `PlatformId` in `src/lib/types.ts`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full adapter interface.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| State | Zustand 5 |
| LLM | Anthropic Claude (claude-sonnet-4-20250514) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

---

## Project Structure

```
prompt-forge/
├── src/
│   ├── app/
│   │   ├── api/refine/route.ts    # API route for refinement
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── dashboard.tsx
│   │   ├── prompt-input.tsx
│   │   ├── preset-panel.tsx
│   │   ├── qa-section.tsx
│   │   ├── platform-selector.tsx
│   │   └── prompt-output.tsx
│   ├── data/
│   │   ├── presets.ts
│   │   └── platforms.ts
│   ├── lib/
│   │   ├── platform-adapters/
│   │   │   ├── index.ts
│   │   │   ├── utils.ts
│   │   │   ├── midjourney.ts
│   │   │   ├── stable-diffusion.ts
│   │   │   ├── runway.ts
│   │   │   ├── kling.ts
│   │   │   ├── firefly.ts
│   │   │   ├── veo3.ts
│   │   │   ├── nano-banana.ts
│   │   │   └── grok.ts
│   │   ├── prompt-builder.ts
│   │   ├── refine-engine.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── store/
│       └── prompt-store.ts
├── .cursor/
├── .claude/
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## License

MIT

---

## Author

- **Charley Scholz** — ELEV8

---

Author: Charley Scholz, ELEV8  
Co-authored: Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)  
Last Updated: 2026-02-23
