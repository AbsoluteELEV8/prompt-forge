/**
 * @file refine-engine.ts
 * @description Core prompt refinement engine — uses Claude to analyze, question, and refine creative prompts
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  PromptAnalysis,
  PresetSelection,
  PlatformId,
  RefinedPrompt,
} from './types';
import { buildPrompt } from './prompt-builder';

const ANALYSIS_SYSTEM_PROMPT = `You are PromptForge's creative prompt analysis engine. Your role is to deeply analyze a user's raw creative prompt input and extract structured insights.

Given a raw prompt, you must return a JSON object with these exact fields:
- intent: A one-sentence summary of what the user wants to create
- subject: The primary subject or focus of the image/video
- style: The artistic style implied or explicitly stated
- mood: The emotional tone or atmosphere the user seems to want
- technicalDetails: An array of any specific technical requirements mentioned (camera angles, lighting, etc.)
- ambiguityScore: A number from 0 to 1 where 0 = perfectly clear and 1 = extremely vague

Be generous in interpretation — infer style and mood from context clues even if not explicitly stated. If the prompt is very vague (e.g. "a cat"), still provide your best guesses for all fields.

Return ONLY valid JSON, no markdown fences or extra text.`;

const QUESTIONS_TEMPLATES: Record<string, (analysis: PromptAnalysis) => string | null> = {
  vagueness: (a) =>
    a.ambiguityScore > 0.5
      ? `Your prompt "${a.subject}" is quite open-ended. Can you describe the specific scene, setting, or context you envision?`
      : null,
  style: (a) =>
    !a.style || a.style === 'unspecified'
      ? `What visual style are you going for? (e.g., photorealistic, painterly, anime, cinematic)`
      : null,
  mood: (a) =>
    !a.mood || a.mood === 'unspecified'
      ? `What mood or feeling should the image evoke? (e.g., peaceful, dramatic, eerie, joyful)`
      : null,
  context: (a) =>
    a.ambiguityScore > 0.3
      ? `Is there a specific time of day, season, or environment you want for this scene?`
      : null,
  purpose: () =>
    `What will this be used for? (social media, print, wallpaper, portfolio, etc.)`,
};

const REFINEMENT_SYSTEM_PROMPT = `You are PromptForge, an elite creative prompt engineering expert. You transform rough creative ideas into beautifully crafted, platform-optimized prompts for AI image and video generation.

Your expertise spans:
- Photography (lenses, lighting, film stocks, composition)
- Cinematography (camera movement, framing, color grading)
- Fine art (painting styles, art movements, artistic techniques)
- Digital art (rendering styles, 3D aesthetics, graphic design)

When refining a prompt, you:
1. Preserve the user's core creative vision — never override their intent
2. Enrich with vivid, specific visual language
3. Layer in technical details that enhance the result (lighting, composition, color)
4. Structure the prompt for the specific target platform's strengths
5. Add sensory details that AI generators respond well to

Return ONLY the refined prompt text — no explanations, no markdown, no labels.
The prompt should be a single cohesive paragraph (or the platform-appropriate format) ready to paste directly into the generator.`;

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

export async function analyzePrompt(input: string): Promise<PromptAnalysis> {
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this creative prompt and return structured JSON:\n\n"${input}"`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from analysis model');
  }

  const parsed = JSON.parse(textBlock.text) as PromptAnalysis;

  return {
    intent: parsed.intent ?? input,
    subject: parsed.subject ?? 'unspecified',
    style: parsed.style ?? 'unspecified',
    mood: parsed.mood ?? 'unspecified',
    technicalDetails: Array.isArray(parsed.technicalDetails)
      ? parsed.technicalDetails
      : [],
    ambiguityScore:
      typeof parsed.ambiguityScore === 'number'
        ? Math.max(0, Math.min(1, parsed.ambiguityScore))
        : 0.5,
  };
}

export function generateQuestions(analysis: PromptAnalysis): string[] {
  const questions: string[] = [];

  for (const generator of Object.values(QUESTIONS_TEMPLATES)) {
    const q = generator(analysis);
    if (q) questions.push(q);
  }

  return questions;
}

export async function refinePrompt(
  input: string,
  presets: PresetSelection,
  platform: PlatformId,
  answers?: Record<string, string>,
): Promise<RefinedPrompt> {
  const analysis = await analyzePrompt(input);
  const assembledPrompt = buildPrompt(analysis, presets, platform);

  const client = getAnthropicClient();

  const contextParts: string[] = [
    `Original user input: "${input}"`,
    `Target platform: ${platform}`,
    `Assembled prompt with presets: "${assembledPrompt}"`,
  ];

  if (answers && Object.keys(answers).length > 0) {
    contextParts.push(
      `Additional context from user:\n${Object.entries(answers)
        .map(([q, a]) => `Q: ${q}\nA: ${a}`)
        .join('\n\n')}`,
    );
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: REFINEMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Refine and enhance this creative prompt for ${platform}:\n\n${contextParts.join('\n\n')}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from refinement model');
  }

  const { getAdapter } = await import('./platform-adapters');
  const adapter = getAdapter(platform);
  const parameters = adapter.buildParameters(presets);

  const presetsApplied: string[] = [];
  for (const [category, ids] of Object.entries(presets)) {
    if (Array.isArray(ids)) {
      for (const id of ids) {
        presetsApplied.push(`${category}:${id}`);
      }
    }
  }

  return {
    platform,
    prompt: textBlock.text.trim(),
    parameters,
    metadata: {
      originalInput: input,
      presetsApplied,
      refinementTimestamp: new Date().toISOString(),
      modelUsed: 'claude-sonnet-4-20250514',
    },
  };
}
