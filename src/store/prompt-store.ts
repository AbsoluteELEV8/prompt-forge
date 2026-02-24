/**
 * @file prompt-store.ts
 * @description Zustand store for PromptForge — manages user input, preset selections, platform, and refinement state
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-24
 */

import { create } from 'zustand';
import type {
  PlatformId,
  Preset,
  PresetCategoryId,
  PresetSelection,
  Question,
} from '@/lib/types';

type CustomPresetsMap = Record<PresetCategoryId, Preset[]>;

interface PromptState {
  userPrompt: string;
  presetSelections: Required<PresetSelection>;
  customPresets: CustomPresetsMap;
  selectedPlatform: PlatformId;
  refinedPrompt: string | null;
  parameters: Record<string, unknown>;
  isRefining: boolean;
  error: string | null;
  questions: Question[];
  answers: Record<string, string>;

  setUserPrompt: (input: string) => void;
  togglePreset: (category: PresetCategoryId, presetId: string) => void;
  clearCategoryPresets: (category: PresetCategoryId) => void;
  addCustomPreset: (category: PresetCategoryId, text: string) => void;
  removeCustomPreset: (category: PresetCategoryId, presetId: string) => void;
  setSelectedPlatform: (platform: PlatformId) => void;
  forgePrompt: () => Promise<void>;
  setAnswer: (questionId: string, value: string) => void;
  applyAnswers: () => Promise<void>;
  reset: () => void;
}

const emptyPresets: Required<PresetSelection> = {
  aspectRatios: [],
  lighting: [],
  cameras: [],
  filmStocks: [],
  atmospheres: [],
  artStyles: [],
  compositions: [],
  colorPalettes: [],
};

const emptyCustomPresets: CustomPresetsMap = {
  aspectRatios: [],
  lighting: [],
  cameras: [],
  filmStocks: [],
  atmospheres: [],
  artStyles: [],
  compositions: [],
  colorPalettes: [],
};

let customIdCounter = 0;

const initialState = {
  userPrompt: '',
  presetSelections: { ...emptyPresets },
  customPresets: { ...emptyCustomPresets },
  selectedPlatform: 'midjourney' as PlatformId,
  refinedPrompt: null as string | null,
  parameters: {} as Record<string, unknown>,
  isRefining: false,
  error: null as string | null,
  questions: [] as Question[],
  answers: {} as Record<string, string>,
};

async function callRefineApi(state: {
  userPrompt: string;
  presetSelections: Required<PresetSelection>;
  customPresets: CustomPresetsMap;
  selectedPlatform: PlatformId;
  answers: Record<string, string>;
  questions: Question[];
}) {
  const textKeyedAnswers: Record<string, string> = {};
  for (const q of state.questions) {
    const answer = state.answers[q.id];
    if (answer?.trim()) {
      textKeyedAnswers[q.text] = answer;
    }
  }

  const response = await fetch('/api/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: state.userPrompt,
      presets: state.presetSelections,
      customPresets: state.customPresets,
      platform: state.selectedPlatform,
      answers: textKeyedAnswers,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      (errorBody as { error?: string }).error ??
        `Refinement failed (${response.status})`,
    );
  }

  return response.json();
}

export const usePromptStore = create<PromptState>((set, get) => ({
  ...initialState,

  setUserPrompt: (input) => set({ userPrompt: input }),

  togglePreset: (category, presetId) =>
    set((state) => {
      const current = state.presetSelections[category] ?? [];
      const isSelected = current.includes(presetId);
      return {
        presetSelections: {
          ...state.presetSelections,
          [category]: isSelected
            ? current.filter((id) => id !== presetId)
            : [...current, presetId],
        },
      };
    }),

  clearCategoryPresets: (category) =>
    set((state) => ({
      presetSelections: {
        ...state.presetSelections,
        [category]: [],
      },
    })),

  addCustomPreset: (category, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const id = `custom-${category}-${++customIdCounter}`;
    const isAspectRatio = category === 'aspectRatios';

    const preset: Preset = {
      id,
      label: trimmed,
      description: `Custom: ${trimmed}`,
      ...(isAspectRatio ? { value: trimmed } : { promptFragment: trimmed }),
    };

    set((state) => ({
      customPresets: {
        ...state.customPresets,
        [category]: [...state.customPresets[category], preset],
      },
      presetSelections: {
        ...state.presetSelections,
        [category]: [...state.presetSelections[category], id],
      },
    }));
  },

  removeCustomPreset: (category, presetId) =>
    set((state) => ({
      customPresets: {
        ...state.customPresets,
        [category]: state.customPresets[category].filter((p) => p.id !== presetId),
      },
      presetSelections: {
        ...state.presetSelections,
        [category]: state.presetSelections[category].filter((id) => id !== presetId),
      },
    })),

  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  forgePrompt: async () => {
    const state = get();

    if (!state.userPrompt.trim()) return;

    set({ isRefining: true, refinedPrompt: null, parameters: {}, questions: [], error: null });

    try {
      const result = await callRefineApi({ ...state, questions: [], answers: {} });

      if (result.questions?.length) {
        const questions: Question[] = result.questions.map(
          (text: string, i: number) => ({ id: `q-${i}`, text }),
        );
        set({ questions, answers: {}, isRefining: false });
      } else if (result.data) {
        set({
          refinedPrompt: result.data.prompt,
          parameters: result.data.parameters ?? {},
          isRefining: false,
        });
      } else {
        set({ isRefining: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isRefining: false, error: message });
    }
  },

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),

  applyAnswers: async () => {
    const state = get();

    set({ isRefining: true, error: null });

    try {
      const result = await callRefineApi(state);

      if (result.data) {
        set({
          refinedPrompt: result.data.prompt,
          parameters: result.data.parameters ?? {},
          questions: [],
          answers: {},
          isRefining: false,
        });
      } else {
        set({ isRefining: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isRefining: false, error: message });
    }
  },

  reset: () => set({
    ...initialState,
    presetSelections: { ...emptyPresets },
    customPresets: { ...emptyCustomPresets },
  }),
}));
