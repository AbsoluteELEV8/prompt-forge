/**
 * @file route.ts
 * @description Next.js API route for prompt refinement — POST handler that orchestrates the refine engine
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import { NextRequest, NextResponse } from 'next/server';
import type { RefineRequest, RefineResponse, PlatformId } from '@/lib/types';
import { analyzePrompt, generateQuestions, refinePrompt } from '@/lib/refine-engine';

const VALID_PLATFORMS: PlatformId[] = [
  'midjourney',
  'stable-diffusion',
  'runway',
  'kling',
  'firefly',
  'veo3',
  'nano-banana',
  'grok',
];

function isValidPlatform(value: unknown): value is PlatformId {
  return typeof value === 'string' && VALID_PLATFORMS.includes(value as PlatformId);
}

export async function POST(request: NextRequest): Promise<NextResponse<RefineResponse>> {
  try {
    const body = (await request.json()) as Partial<RefineRequest>;

    if (!body.input || typeof body.input !== 'string' || !body.input.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing or empty "input" field' },
        { status: 400 },
      );
    }

    if (!isValidPlatform(body.platform)) {
      return NextResponse.json(
        { success: false, error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` },
        { status: 400 },
      );
    }

    const presets = body.presets ?? {};
    const answers = body.answers ?? {};

    const needsQuestions = !answers || Object.keys(answers).length === 0;

    if (needsQuestions) {
      const analysis = await analyzePrompt(body.input);
      const questions = generateQuestions(analysis);

      if (questions.length > 0) {
        return NextResponse.json({
          success: true,
          questions,
        });
      }
    }

    const refined = await refinePrompt(
      body.input,
      presets,
      body.platform,
      answers,
    );

    return NextResponse.json({
      success: true,
      data: refined,
    });
  } catch (error) {
    console.error('Refine API error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    const isAuthError = message.includes('ANTHROPIC_API_KEY');
    const status = isAuthError ? 503 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
