/**
 * @file types.ts
 * @description Shared TypeScript types for PromptForge engine, presets, and platform adapters
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

// ---------------------------------------------------------------------------
// Platform identifiers
// ---------------------------------------------------------------------------

export type PlatformId =
  | 'midjourney'
  | 'stable-diffusion'
  | 'runway'
  | 'kling'
  | 'firefly'
  | 'veo3'
  | 'nano-banana'
  | 'grok'
  | 'gemini';

export type PlatformType = 'image' | 'video' | 'both';

export interface Platform {
  id: PlatformId;
  name: string;
  type: PlatformType;
  description: string;
}

// ---------------------------------------------------------------------------
// Preset types
// ---------------------------------------------------------------------------

export interface Preset {
  id: string;
  label?: string;
  name?: string;
  promptFragment?: string;
  value?: string;
  description: string;
  [key: string]: unknown;
}

export type PresetCategoryId =
  | 'aspectRatios'
  | 'lighting'
  | 'cameras'
  | 'filmStocks'
  | 'atmospheres'
  | 'artStyles'
  | 'compositions'
  | 'colorPalettes';

export interface PresetCategory {
  id: PresetCategoryId;
  name: string;
  icon: string;
  presets: Preset[];
}

export interface PresetSelection {
  aspectRatios?: string[];
  lighting?: string[];
  cameras?: string[];
  filmStocks?: string[];
  atmospheres?: string[];
  artStyles?: string[];
  compositions?: string[];
  colorPalettes?: string[];
}

// ---------------------------------------------------------------------------
// Prompt analysis
// ---------------------------------------------------------------------------

export interface PromptAnalysis {
  intent: string;
  subject: string;
  style: string;
  mood: string;
  technicalDetails: string[];
  ambiguityScore: number;
}

// ---------------------------------------------------------------------------
// Platform adapter
// ---------------------------------------------------------------------------

export interface PlatformAdapter {
  id: PlatformId;
  name: string;
  description: string;
  type: PlatformType;
  supportedAspectRatios: string[];
  formatPrompt(basePrompt: string, presets: PresetSelection): string;
  buildParameters(presets: PresetSelection): Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Refinement pipeline
// ---------------------------------------------------------------------------

export interface RefineRequest {
  input: string;
  presets: PresetSelection;
  customPresets?: Partial<Record<PresetCategoryId, Preset[]>>;
  platform: PlatformId;
  answers?: Record<string, string>;
}

export interface RefinedPrompt {
  platform: PlatformId;
  prompt: string;
  negativePrompt?: string;
  parameters: Record<string, unknown>;
  metadata: {
    originalInput: string;
    presetsApplied: string[];
    refinementTimestamp: string;
    modelUsed: string;
  };
}

export interface RefineResponse {
  success: boolean;
  data?: RefinedPrompt;
  questions?: string[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Q&A question (used by the store and qa-section component)
// ---------------------------------------------------------------------------

export interface Question {
  id: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Aspect ratio preset (typed version)
// ---------------------------------------------------------------------------

export interface AspectRatioPreset extends Preset {
  value: string;
  platforms: PlatformId[];
}

// ---------------------------------------------------------------------------
// Lighting preset (typed version)
// ---------------------------------------------------------------------------

export interface LightingPreset extends Preset {
  promptFragment: string;
  mood: string;
  intensity: 'low' | 'medium' | 'high';
}

// ---------------------------------------------------------------------------
// Camera preset (typed version)
// ---------------------------------------------------------------------------

export interface CameraPreset extends Preset {
  promptFragment: string;
  focalLength: string | null;
  characteristics: string[];
}

// ---------------------------------------------------------------------------
// Film stock preset (typed version)
// ---------------------------------------------------------------------------

export interface FilmStockPreset extends Preset {
  promptFragment: string;
  iso: number | null;
  characteristics: {
    grain: string;
    colorProfile: string;
    contrastLevel: string;
  };
}

// ---------------------------------------------------------------------------
// Atmosphere preset (typed version)
// ---------------------------------------------------------------------------

export interface AtmospherePreset extends Preset {
  promptFragment: string;
  emotionalTone: string;
  visualCues: string[];
}

// ---------------------------------------------------------------------------
// Art style preset (typed version)
// ---------------------------------------------------------------------------

export interface ArtStylePreset extends Preset {
  promptFragment: string;
  characteristics: string[];
  references: string[];
}

// ---------------------------------------------------------------------------
// Composition preset (typed version)
// ---------------------------------------------------------------------------

export interface CompositionPreset extends Preset {
  promptFragment: string;
  usage: string;
}

// ---------------------------------------------------------------------------
// Color palette preset (typed version)
// ---------------------------------------------------------------------------

export interface ColorPalettePreset extends Preset {
  promptFragment: string;
  hexColors: string[];
  mood: string;
}
