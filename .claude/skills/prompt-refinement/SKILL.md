---
name: prompt-refinement
description: Core prompt refinement logic for PromptForge. Use when working on the refine engine, improving prompt quality, designing Q&A flows, or modifying LLM system prompts.
---

# Prompt Refinement Skill

## Overview

This skill covers the core logic for transforming vague user prompts into detailed, platform-optimized creative prompts. It is the intellectual engine behind PromptForge.

## Analyzing Vague User Prompts

### Intent Detection

When a user submits a prompt, the first step is classifying intent:

| Signal | Detected Intent |
|--------|----------------|
| Nouns describing scenes, objects, people | Image generation |
| Motion verbs, "video of", "clip showing" | Video generation |
| "Change", "remove", "replace", "edit" | Image editing |
| "In the style of", "make it look like" | Style transfer |

### Ambiguity Gap Analysis

Score each dimension of the prompt from 0 (absent) to 3 (fully specified):

| Dimension | Score 0 (Missing) | Score 3 (Complete) |
|-----------|-------------------|-------------------|
| **Subject** | No clear subject | "A weathered lighthouse on a rocky cliff" |
| **Style** | No style cues | "Watercolor illustration with visible brushstrokes" |
| **Mood/Tone** | No emotional direction | "Melancholic, overcast, isolated" |
| **Composition** | No spatial guidance | "Wide-angle view, subject centered, rule of thirds" |
| **Color** | No color direction | "Desaturated blues and warm amber highlights" |
| **Technical** | No params specified | "16:9, high detail, photorealistic rendering" |

Dimensions scoring 0-1 become Q&A candidates. Prioritize by impact on output quality.

### Common Vague Prompt Patterns

| Vague Input | What's Missing | Refinement Strategy |
|------------|---------------|-------------------|
| "a cat" | Everything except subject | Ask about style, setting, mood, composition |
| "sunset painting" | Medium, style specifics, composition | Ask about art style, color palette, viewpoint |
| "cool robot" | Specificity, context, style, purpose | Ask about robot type, environment, art direction |
| "make it better" | Source reference, improvement goals | Ask what "better" means — more detail? different style? |

## Context Extraction Through Directed Q&A

### Question Generation Strategy

1. **Parse the input** — extract all explicit information (nouns, adjectives, style keywords)
2. **Map to dimensions** — assign extracted info to the 6 dimensions above
3. **Identify gaps** — dimensions with score 0-1 are gaps
4. **Rank gaps** — subject > style > mood > composition > color > technical
5. **Generate questions** — max 5, each targeting a gap, with curated suggestions

### Question Quality Criteria

Good questions:
- Are specific: "What art style?" not "Tell me more"
- Provide inspiring suggestions the user can click
- Include a free-text escape for experienced users
- Respect the user's time — never ask what's already implied

### Example Q&A Round

**User input**: "a dragon"

**Generated questions**:
1. "What kind of dragon? → Eastern/serpentine, Western/winged, Mechanical/steampunk, Cute/cartoon, [Custom]"
2. "What setting or environment? → Mountain peak, Underground cavern, Stormy sky, Ancient ruins, [Custom]"
3. "What art style? → Photorealistic, Digital painting, Watercolor, Anime, Pixel art, [Custom]"
4. "What mood or atmosphere? → Epic/powerful, Mysterious, Peaceful, Menacing, Whimsical, [Custom]"

**User answers**: Western/winged, Stormy sky, Digital painting, Epic/powerful

**Resulting context object**:
```json
{
  "subject": { "value": "Western dragon with large wings", "source": "qa" },
  "setting": { "value": "stormy sky with lightning", "source": "qa" },
  "style": { "value": "digital painting", "source": "qa" },
  "mood": { "value": "epic, powerful", "source": "qa" },
  "color": { "value": null, "source": "gap" },
  "technical": { "value": null, "source": "gap" }
}
```

## Combining User Intent with Preset Selections

### Merge Priority (highest to lowest)

1. **Explicit user text** — anything the user typed directly always wins
2. **Q&A answers** — user-selected or free-text answers from the Q&A flow
3. **Active presets** — dashboard selections (style, lighting, camera, etc.)
4. **Platform defaults** — sensible defaults from the selected platform adapter

### Conflict Resolution

- If the user typed "watercolor" but selected a "photorealistic" preset → user text wins
- If a Q&A answer contradicts a preset → Q&A answer wins (more recent intent signal)
- If two presets conflict (e.g., "warm lighting" + "cool blue palette") → surface a warning, let the user decide
- Platform constraints override all (e.g., if the platform max is 500 chars, truncate gracefully)

### Context Assembly

```typescript
interface RefinementContext {
  rawInput: string;
  intent: 'image' | 'video' | 'edit' | 'style-transfer';
  qaAnswers: QAAnswer[];
  activePresets: Preset[];
  platformId: string;
  dimensions: {
    subject: DimensionValue | null;
    style: DimensionValue | null;
    mood: DimensionValue | null;
    composition: DimensionValue | null;
    color: DimensionValue | null;
    technical: DimensionValue | null;
  };
}

interface DimensionValue {
  value: string;
  source: 'user-input' | 'qa' | 'preset' | 'default';
  confidence: number;
}
```

## LLM System Prompt Template

The refine engine calls Claude once per refinement cycle. The system prompt must:

1. Establish the role: "You are a creative prompt engineer specializing in AI-generated media"
2. Provide the assembled context as structured input
3. Instruct the format: output a single refined prompt in natural language (platform-agnostic)
4. Set quality constraints: detailed but not verbose, evocative but not purple prose

### Template Structure

```
SYSTEM:
You are a creative prompt engineer. Your task is to transform the user's
creative intent into a detailed, evocative prompt optimized for AI generation.

INPUT CONTEXT:
- Original request: {rawInput}
- Detected intent: {intent}
- Subject: {dimensions.subject}
- Style: {dimensions.style}
- Mood: {dimensions.mood}
- Composition: {dimensions.composition}
- Color palette: {dimensions.color}
- Technical: {dimensions.technical}
- Active presets: {presetFragments joined}

INSTRUCTIONS:
1. Synthesize all context into a single coherent prompt
2. Fill remaining gaps with tasteful creative choices that complement the stated intent
3. Use vivid, specific language — replace vague words with concrete descriptors
4. Structure: subject → setting → style → mood → composition → technical details
5. Keep it under {maxLength} words
6. Do NOT include platform-specific syntax (no --ar, no weights, no parameters)
7. Output ONLY the refined prompt text, nothing else

USER:
Refine this creative prompt.
```

### Template Variables

- `{rawInput}` — the user's original text, unmodified
- `{intent}` — detected intent category
- `{dimensions.*}` — each dimension value or "not specified"
- `{presetFragments}` — comma-joined prompt fragments from active presets
- `{maxLength}` — word count limit (default 150, adjustable per platform)

## Quality Criteria for Refined Prompts

A refined prompt is **good** when it:

| Criterion | Test |
|-----------|------|
| **Specific** | Contains concrete nouns and precise adjectives, not vague abstractions |
| **Coherent** | All elements work together — style, mood, subject, setting are harmonious |
| **Complete** | Addresses all 6 dimensions with at least implicit information |
| **Concise** | No redundant adjectives, no filler phrases, no repeated concepts |
| **Platform-agnostic** | No syntax artifacts — pure natural language that any adapter can transform |
| **Evocative** | Reads like art direction, not a database query |
| **Faithful** | Preserves the user's original intent — refinement enhances, never replaces |

### Anti-Patterns to Reject

- Generic filler: "beautiful", "amazing", "stunning" without specificity
- Contradictions: "bright, dark, moody yet cheerful"
- Keyword stuffing: listing unrelated styles/artists hoping for better output
- Over-specification: so many constraints that the generator has no creative room
- Truncation damage: cutting mid-thought because of length limits

---

Author: Charley Scholz, ELEV8
Co-authored: Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
Last Updated: 2026-02-23
