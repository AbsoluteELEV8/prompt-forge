---
name: platform-adapters
description: Platform adapter creation and maintenance for PromptForge. Use when adding a new platform adapter, modifying platform-specific prompt formatting, or debugging adapter output.
---

# Platform Adapters Skill

## Overview

Platform adapters transform refined, platform-agnostic prompts into platform-native format. Each adapter encapsulates all knowledge about a specific platform's prompt syntax, parameters, constraints, and best practices.

## The PlatformAdapter TypeScript Interface

```typescript
interface PlatformAdapter {
  readonly id: string;
  readonly displayName: string;
  readonly category: 'image' | 'video' | 'edit';
  readonly capabilities: PlatformCapabilities;
  adapt(input: RefinedPrompt, options: AdapterOptions): PlatformOutput;
  validate(options: AdapterOptions): ValidationError[];
}

interface PlatformCapabilities {
  aspectRatios: string[];
  maxPromptLength: number;
  supportsNegativePrompt: boolean;
  supportsWeights: boolean;
  customParameters: ParameterDefinition[];
}

interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum';
  description: string;
  default: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface RefinedPrompt {
  text: string;
  intent: 'image' | 'video' | 'edit' | 'style-transfer';
  dimensions: Record<string, DimensionValue | null>;
  presetFragments: string[];
}

interface AdapterOptions {
  aspectRatio?: string;
  negativePrompt?: string;
  [key: string]: unknown;
}

interface PlatformOutput {
  prompt: string;
  negativePrompt: string | null;
  parameters: Record<string, string | number | boolean>;
  formatted: string;
  warnings: string[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

## Platform-Specific Prompt Format Rules

### Midjourney

**Category**: image
**Formatted output**: `/imagine prompt: <text> <parameters>`

| Parameter | Flag | Values | Default |
|-----------|------|--------|---------|
| Aspect ratio | `--ar` | Any ratio (e.g., `16:9`, `1:1`, `9:16`) | `1:1` |
| Version | `--v` | `5`, `5.1`, `5.2`, `6`, `6.1` | `6.1` |
| Stylize | `--s` | 0–1000 | 100 |
| Chaos | `--c` | 0–100 | 0 |
| Quality | `--q` | `.25`, `.5`, `1` | `1` |
| Style | `--style` | `raw` | none |
| Tile | `--tile` | boolean flag | off |
| No (negative) | `--no` | comma-separated terms | none |
| Seed | `--seed` | 0–4294967295 | random |

**Rules**:
- Parameters are appended after the prompt text, space-separated
- No positive prompt weight syntax (unlike SD)
- `--no` is used for negative concepts (replaces negative prompts)
- Multi-prompt syntax uses `::` separator with optional weights: `concept one::2 concept two::1`
- Maximum prompt length: ~6000 characters

**Example output**:
```
/imagine prompt: A weathered lighthouse on a rocky cliff overlooking a stormy sea, dramatic clouds, golden hour light breaking through, oil painting style with visible impasto brushwork --ar 16:9 --v 6.1 --s 350 --q 1
```

### Stable Diffusion / ComfyUI

**Category**: image
**Formatted output**: Positive prompt + separate negative prompt

| Feature | Syntax | Example |
|---------|--------|---------|
| Emphasis (increase weight) | `(term:weight)` | `(sunset:1.3)` |
| De-emphasis | `(term:weight)` where weight < 1 | `(blur:0.5)` |
| Alternate syntax emphasis | `((term))` = 1.21x | `((detailed eyes))` |
| BREAK | Forces attention split | `scene description BREAK quality tags` |
| LoRA | `<lora:name:weight>` | `<lora:add_detail:0.8>` |

**Negative prompt keywords** (common defaults):
```
(worst quality:1.4), (low quality:1.4), blurry, deformed, disfigured, extra limbs, bad anatomy, watermark, text, signature
```

**Rules**:
- Positive and negative prompts are separate fields
- Weight range: 0.1–2.0 (above 1.5 often causes artifacts)
- Quality boosters go at the end: `masterpiece, best quality, highly detailed`
- Aspect ratio is set via width/height resolution, not a flag
- Common resolutions: 512x512, 512x768, 768x512, 1024x1024 (SDXL)

### Runway

**Category**: video
**Formatted output**: Scene description + structured parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| Duration | 4s, 16s | 4s |
| Aspect ratio | 16:9, 9:16, 1:1 | 16:9 |
| Camera motion | Static, Pan L/R/U/D, Zoom In/Out, Orbit, Dolly | Static |
| Motion amount | 1–10 | 5 |
| Seed | integer | random |

**Rules**:
- Prompt is natural language describing the scene and desired motion
- Camera motion directives can be embedded in the prompt or set as parameters
- For Gen-3 Alpha: describe what happens frame-by-frame for best results
- First frame description is crucial — it sets the visual foundation
- Avoid conflicting motion directives

### Kling

**Category**: video
**Formatted output**: Prompt text + mode/parameter selection

| Parameter | Values | Default |
|-----------|--------|---------|
| Mode | Standard, Pro | Standard |
| Duration | 5s, 10s | 5s |
| Aspect ratio | 16:9, 9:16, 1:1 | 16:9 |
| Camera movement | Free, Fixed | Free |
| Negative prompt | supported | none |

**Rules**:
- Natural language prompt describing the scene
- Supports negative prompts for video (unlike some platforms)
- Camera movement descriptions should be explicit in the prompt
- Pro mode produces higher quality but takes longer

### Adobe Firefly

**Category**: image
**Formatted output**: Natural language prompt + style references

| Parameter | Values | Default |
|-----------|--------|---------|
| Aspect ratio | Square (1:1), Landscape (4:3), Portrait (3:4), Widescreen (16:9) | Square |
| Content type | Photo, Art | Art |
| Style | Multiple presets (Cyberpunk, Fantasy, Watercolor, etc.) | none |
| Effects | Color/Tone, Lighting, Composition presets | none |
| Match reference | Style reference image | none |

**Rules**:
- Prompts are natural language — no special syntax
- Style is selected via UI controls, not embedded in the prompt
- Adapter should separate prompt text from style/effect recommendations
- Commercial-safe output — Firefly is designed for commercial use
- Negative text prompts via "Avoid" field

### Google Veo 3

**Category**: video
**Formatted output**: Scene description + structured parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| Resolution | 720p, 1080p | 1080p |
| Duration | 4s, 6s, 8s | 8s |
| Audio | None, Generated, Dialogue | None |
| Reference images | Up to 4 images | none |
| Aspect ratio | 16:9, 9:16 | 16:9 |

**Rules**:
- Natural language prompt describing scene, action, and atmosphere
- **Audio directives**: include ambient sound or dialogue descriptions in the prompt when audio is enabled
- **Dialogue**: wrap spoken lines in quotes within the prompt; Veo 3 generates matching lip sync
- Reference images guide visual style — describe how the reference relates to the desired output
- Scene descriptions benefit from temporal language: "The camera slowly pans as..."
- Specify 720p for faster generation, 1080p for final quality

**Example output**:
```
Prompt: A street musician plays violin in a rainy European alley at dusk. Warm light spills from a café window. Passersby hold umbrellas. The camera slowly dollies forward. "Play something beautiful," whispers a child watching from a doorway.
Resolution: 1080p | Duration: 8s | Audio: Dialogue | Aspect: 16:9
```

### Nano Banana

**Category**: image / edit
**Formatted output**: Prompt + model/mode selection

| Parameter | Values | Default |
|-----------|--------|---------|
| Model | V1, Pro V2 | Pro V2 |
| Mode | Generate, Inpaint (mask-free), Style Transfer | Generate |
| Aspect ratio | 1:1, 16:9, 9:16, 4:3, 3:4 | 1:1 |
| Style intensity (transfer) | 0.1–1.0 | 0.7 |
| Inpaint target | Natural language description of what to change | none |

**Rules**:
- **V1**: Fast generation, good for iteration
- **Pro V2**: Higher quality, more coherent compositions
- **Mask-free inpainting**: Describe what to change in natural language instead of painting a mask — the model identifies the region automatically
- **Style transfer**: Provide a style reference description + intensity; the model applies the style to the source
- Prompts are natural language, no special syntax
- For inpainting: clearly describe both what exists and what should replace it

**Example output (mask-free inpaint)**:
```
Model: Pro V2 | Mode: Inpaint
Prompt: Replace the red car in the driveway with a vintage blue pickup truck
```

### Grok Aurora (Placeholder)

**Category**: image
**Formatted output**: Natural language prompt + aspect ratio

| Parameter | Values | Default |
|-----------|--------|---------|
| Aspect ratio | 3:2, 2:3, 1:1 | 1:1 |

**Rules**:
- Natural language prompts — no special syntax known yet
- Three fixed aspect ratio options
- This is a **placeholder adapter** — update as xAI publishes Aurora's API/prompt guide
- Keep the adapter minimal; don't speculate on undocumented features
- Flag output with a notice that formatting may change

**Example output**:
```
Prompt: A bioluminescent forest at midnight, ethereal blue and green light emanating from mushrooms and tree bark, fog drifting between ancient trees, dreamlike atmosphere
Aspect: 3:2
⚠ Grok Aurora adapter is provisional — verify output format against current platform docs.
```

## How to Add a New Adapter

### Step-by-step

1. **Create the file**: `src/lib/platform-adapters/<platform-id>.ts`
2. **Implement `PlatformAdapter`**: Fill in `id`, `displayName`, `category`, `capabilities`
3. **Write `adapt()`**: Transform `RefinedPrompt` → `PlatformOutput` using platform-specific rules
4. **Write `validate()`**: Check all `AdapterOptions` against `capabilities` constraints
5. **Register**: Add the adapter to the registry in `src/lib/platform-adapters/index.ts`
6. **Add presets** (optional): Create platform-specific preset hints in `src/data/presets/`
7. **Test**: Write tests covering:
   - Basic prompt transformation
   - Edge cases (empty prompt, max length, special characters)
   - All parameter combinations
   - Validation of out-of-range values

### Adapter Template

```typescript
import type { PlatformAdapter, RefinedPrompt, AdapterOptions, PlatformOutput, ValidationError } from './types';

export const newPlatformAdapter: PlatformAdapter = {
  id: 'new-platform',
  displayName: 'New Platform',
  category: 'image',

  capabilities: {
    aspectRatios: ['1:1', '16:9', '9:16'],
    maxPromptLength: 1000,
    supportsNegativePrompt: false,
    supportsWeights: false,
    customParameters: [],
  },

  adapt(input: RefinedPrompt, options: AdapterOptions): PlatformOutput {
    const warnings: string[] = [];
    let prompt = input.text;

    if (prompt.length > this.capabilities.maxPromptLength) {
      prompt = prompt.slice(0, this.capabilities.maxPromptLength);
      warnings.push(`Prompt truncated to ${this.capabilities.maxPromptLength} characters`);
    }

    const aspectRatio = options.aspectRatio ?? '1:1';

    return {
      prompt,
      negativePrompt: null,
      parameters: { aspectRatio },
      formatted: `${prompt}\nAspect: ${aspectRatio}`,
      warnings,
    };
  },

  validate(options: AdapterOptions): ValidationError[] {
    const errors: ValidationError[] = [];

    if (options.aspectRatio && !this.capabilities.aspectRatios.includes(options.aspectRatio)) {
      errors.push({
        field: 'aspectRatio',
        message: `Unsupported aspect ratio: ${options.aspectRatio}. Valid: ${this.capabilities.aspectRatios.join(', ')}`,
        severity: 'error',
      });
    }

    return errors;
  },
};
```

## Testing Requirements

### Minimum Coverage Per Adapter

| Test Case | What It Validates |
|-----------|------------------|
| Basic transformation | `adapt()` produces valid `PlatformOutput` for a simple input |
| Empty prompt | Graceful handling of empty or whitespace-only input |
| Max length | Prompt is truncated with a warning when exceeding `maxPromptLength` |
| All aspect ratios | Each supported ratio produces correct output |
| Negative prompt | Negative prompt is formatted correctly (or `null` if unsupported) |
| Parameter validation | `validate()` catches out-of-range values |
| Special characters | Quotes, newlines, unicode in prompts don't break formatting |
| Formatted output | `formatted` field is copy-paste ready for the actual platform |

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { midjourneyAdapter } from './midjourney';

describe('Midjourney Adapter', () => {
  const baseInput: RefinedPrompt = {
    text: 'A red fox in a snowy forest',
    intent: 'image',
    dimensions: {},
    presetFragments: [],
  };

  it('produces valid formatted output', () => {
    const result = midjourneyAdapter.adapt(baseInput, { aspectRatio: '16:9' });
    expect(result.formatted).toContain('/imagine prompt:');
    expect(result.formatted).toContain('--ar 16:9');
  });

  it('rejects invalid aspect ratio', () => {
    const errors = midjourneyAdapter.validate({ aspectRatio: 'invalid' });
    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe('error');
  });
});
```

---

Author: Charley Scholz, ELEV8
Co-authored: Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
Last Updated: 2026-02-23
