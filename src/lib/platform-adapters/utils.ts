/**
 * @file utils.ts
 * @description Shared utilities for platform adapters — preset resolution and aspect ratio matching
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PresetSelection, Preset } from '../types';

import aspectRatioData from '@/data/presets/aspect-ratios.json';
import lightingData from '@/data/presets/lighting.json';
import camerasData from '@/data/presets/cameras.json';
import filmStocksData from '@/data/presets/film-stocks.json';
import atmospheresData from '@/data/presets/atmospheres.json';
import artStylesData from '@/data/presets/art-styles.json';
import compositionsData from '@/data/presets/compositions.json';
import colorPalettesData from '@/data/presets/color-palettes.json';

type PresetDataset = { presets: Preset[] };

const CATEGORY_DATA: Record<string, PresetDataset> = {
  lighting: lightingData as PresetDataset,
  cameras: camerasData as PresetDataset,
  filmStocks: filmStocksData as PresetDataset,
  atmospheres: atmospheresData as PresetDataset,
  artStyles: artStylesData as PresetDataset,
  compositions: compositionsData as PresetDataset,
  colorPalettes: colorPalettesData as PresetDataset,
};

function findPresetById(category: string, id: string): Preset | undefined {
  const dataset = CATEGORY_DATA[category];
  if (!dataset) return undefined;
  return dataset.presets.find((p) => p.id === id);
}

/**
 * Collects all promptFragment values from selected presets across every category
 * (except aspectRatios which use `value` instead of `promptFragment`).
 */
export function resolvePresetFragments(presets: PresetSelection): string[] {
  const fragments: string[] = [];

  const categoriesWithFragments: (keyof PresetSelection)[] = [
    'lighting',
    'cameras',
    'filmStocks',
    'atmospheres',
    'artStyles',
    'compositions',
    'colorPalettes',
  ];

  for (const category of categoriesWithFragments) {
    const selectedIds = presets[category];
    if (!selectedIds?.length) continue;

    for (const id of selectedIds) {
      const preset = findPresetById(category, id);
      if (preset?.promptFragment && typeof preset.promptFragment === 'string') {
        fragments.push(preset.promptFragment);
      }
    }
  }

  return fragments;
}

/**
 * Resolves the first selected aspect ratio that the target platform supports.
 * Falls back to `null` if none match.
 */
export function resolveAspectRatio(
  presets: PresetSelection,
  supported: string[],
): string | null {
  const selectedIds = presets.aspectRatios;
  if (!selectedIds?.length) return null;

  const arPresets = (aspectRatioData as PresetDataset).presets;

  for (const id of selectedIds) {
    const preset = arPresets.find((p) => p.id === id);
    const value = preset?.value;
    if (typeof value === 'string' && supported.includes(value)) {
      return value;
    }
  }

  return null;
}
