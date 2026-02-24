/**
 * @file presets.ts
 * @description Preset data for all 8 creative prompt categories
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PresetCategory } from '@/lib/types';

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'aspectRatios',
    name: 'Aspect Ratio',
    icon: '⬜',
    presets: [
      { id: 'ar-1-1', label: '1:1', value: '1:1', description: 'Square — social media posts, profile images' },
      { id: 'ar-16-9', label: '16:9', value: '16:9', description: 'Widescreen — cinematic, desktop wallpapers' },
      { id: 'ar-9-16', label: '9:16', value: '9:16', description: 'Vertical — phone wallpapers, stories, reels' },
      { id: 'ar-4-3', label: '4:3', value: '4:3', description: 'Classic — traditional photography, prints' },
      { id: 'ar-3-2', label: '3:2', value: '3:2', description: 'Standard photo — DSLR native ratio' },
      { id: 'ar-21-9', label: '21:9', value: '21:9', description: 'Ultra-wide — cinematic panoramas' },
      { id: 'ar-2-3', label: '2:3', value: '2:3', description: 'Portrait — magazine covers, posters' },
    ],
  },
  {
    id: 'lighting',
    name: 'Lighting',
    icon: '💡',
    presets: [
      { id: 'lt-golden', label: 'Golden Hour', value: 'golden hour lighting', description: 'Warm sunset/sunrise glow with long shadows' },
      { id: 'lt-studio', label: 'Studio', value: 'studio lighting', description: 'Controlled, professional three-point lighting' },
      { id: 'lt-neon', label: 'Neon', value: 'neon lighting', description: 'Vibrant cyberpunk-style neon glow' },
      { id: 'lt-natural', label: 'Natural', value: 'natural lighting', description: 'Soft, ambient daylight' },
      { id: 'lt-dramatic', label: 'Dramatic', value: 'dramatic chiaroscuro lighting', description: 'High contrast light and shadow — Caravaggio style' },
      { id: 'lt-backlit', label: 'Backlit', value: 'backlit silhouette', description: 'Subject illuminated from behind, rim light effect' },
      { id: 'lt-volumetric', label: 'Volumetric', value: 'volumetric lighting', description: 'God rays, visible light beams through atmosphere' },
      { id: 'lt-moonlight', label: 'Moonlight', value: 'soft moonlight', description: 'Cool, ethereal nighttime illumination' },
    ],
  },
  {
    id: 'cameras',
    name: 'Camera + Lens',
    icon: '📷',
    presets: [
      { id: 'cl-35mm', label: '35mm', value: '35mm lens', description: 'Versatile street photography focal length' },
      { id: 'cl-50mm', label: '50mm', value: '50mm lens', description: 'Natural perspective — the "nifty fifty"' },
      { id: 'cl-85mm', label: '85mm', value: '85mm portrait lens', description: 'Classic portrait lens with beautiful bokeh' },
      { id: 'cl-wide', label: 'Wide Angle', value: '24mm wide angle lens', description: 'Expansive field of view, architectural shots' },
      { id: 'cl-macro', label: 'Macro', value: 'macro lens extreme close-up', description: 'Extreme close-up detail photography' },
      { id: 'cl-tele', label: 'Telephoto', value: '200mm telephoto lens', description: 'Compressed perspective, distant subjects' },
      { id: 'cl-fisheye', label: 'Fisheye', value: 'fisheye lens distortion', description: 'Ultra-wide barrel distortion effect' },
      { id: 'cl-tiltshift', label: 'Tilt-Shift', value: 'tilt-shift lens miniature effect', description: 'Selective focus creating miniature effect' },
    ],
  },
  {
    id: 'filmStocks',
    name: 'Film Stock',
    icon: '🎞️',
    presets: [
      { id: 'fs-portra', label: 'Portra 400', value: 'Kodak Portra 400 film', description: 'Warm skin tones, fine grain — portrait favorite' },
      { id: 'fs-ektar', label: 'Ektar 100', value: 'Kodak Ektar 100 film', description: 'Vivid colors, ultra-fine grain, high saturation' },
      { id: 'fs-hp5', label: 'HP5 Plus', value: 'Ilford HP5 Plus black and white film', description: 'Classic B&W with rich tonal range' },
      { id: 'fs-velvia', label: 'Velvia 50', value: 'Fujifilm Velvia 50 slide film', description: 'Intense color saturation, landscape favorite' },
      { id: 'fs-cinestill', label: 'CineStill 800T', value: 'CineStill 800T tungsten film', description: 'Cinematic halation glow around highlights' },
      { id: 'fs-trix', label: 'Tri-X 400', value: 'Kodak Tri-X 400 black and white', description: 'Gritty B&W, classic photojournalism look' },
      { id: 'fs-superia', label: 'Superia 400', value: 'Fujifilm Superia 400', description: 'Cool greens, everyday color negative film' },
    ],
  },
  {
    id: 'atmospheres',
    name: 'Atmosphere',
    icon: '🌫️',
    presets: [
      { id: 'at-foggy', label: 'Foggy', value: 'foggy misty atmosphere', description: 'Dense fog creating depth and mystery' },
      { id: 'at-rain', label: 'Rainy', value: 'rainy wet reflections', description: 'Rain-soaked with reflective wet surfaces' },
      { id: 'at-dusty', label: 'Dusty', value: 'dusty hazy particles', description: 'Atmospheric dust particles catching light' },
      { id: 'at-smoke', label: 'Smoky', value: 'smoky atmospheric haze', description: 'Wisps of smoke adding texture and mood' },
      { id: 'at-clear', label: 'Crystal Clear', value: 'crystal clear atmosphere', description: 'Sharp visibility, vivid and clean' },
      { id: 'at-snow', label: 'Snowy', value: 'falling snow blizzard', description: 'Snowfall adding winter atmosphere' },
      { id: 'at-underwater', label: 'Underwater', value: 'underwater caustics', description: 'Submerged with light caustics and bubbles' },
    ],
  },
  {
    id: 'artStyles',
    name: 'Art Style',
    icon: '🎨',
    presets: [
      { id: 'as-photo', label: 'Photorealistic', value: 'photorealistic', description: 'Indistinguishable from a real photograph' },
      { id: 'as-oil', label: 'Oil Painting', value: 'oil painting style', description: 'Rich textures with visible brushstrokes' },
      { id: 'as-watercolor', label: 'Watercolor', value: 'watercolor painting', description: 'Soft, translucent washes of color' },
      { id: 'as-3d', label: '3D Render', value: '3D render octane', description: 'Clean CG render with global illumination' },
      { id: 'as-anime', label: 'Anime', value: 'anime art style', description: 'Japanese animation-inspired aesthetic' },
      { id: 'as-comic', label: 'Comic Book', value: 'comic book illustration', description: 'Bold lines, halftone dots, vivid panels' },
      { id: 'as-pixel', label: 'Pixel Art', value: 'pixel art retro', description: 'Retro 8-bit or 16-bit game aesthetic' },
      { id: 'as-concept', label: 'Concept Art', value: 'concept art illustration', description: 'Professional concept art for games and film' },
    ],
  },
  {
    id: 'compositions',
    name: 'Composition',
    icon: '📐',
    presets: [
      { id: 'cp-ruleofthirds', label: 'Rule of Thirds', value: 'rule of thirds composition', description: 'Subject placed at intersection points' },
      { id: 'cp-centered', label: 'Centered', value: 'centered symmetrical composition', description: 'Subject dead center, symmetrical balance' },
      { id: 'cp-leading', label: 'Leading Lines', value: 'leading lines composition', description: 'Lines drawing the eye to the subject' },
      { id: 'cp-closeup', label: 'Close-Up', value: 'extreme close-up', description: 'Tight framing on subject detail' },
      { id: 'cp-birds', label: "Bird's Eye", value: "bird's eye view overhead", description: 'Directly overhead, looking straight down' },
      { id: 'cp-worms', label: "Worm's Eye", value: "worm's eye view low angle", description: 'Looking up from ground level' },
      { id: 'cp-dutch', label: 'Dutch Angle', value: 'dutch angle tilted', description: 'Tilted camera for dynamic tension' },
      { id: 'cp-negative', label: 'Negative Space', value: 'negative space minimal composition', description: 'Large empty areas emphasizing the subject' },
    ],
  },
  {
    id: 'colorPalettes',
    name: 'Color Palette',
    icon: '🎭',
    presets: [
      { id: 'co-warm', label: 'Warm Tones', value: 'warm color palette reds oranges', description: 'Reds, oranges, and golds' },
      { id: 'co-cool', label: 'Cool Tones', value: 'cool color palette blues teals', description: 'Blues, teals, and purples' },
      { id: 'co-mono', label: 'Monochrome', value: 'monochrome single color', description: 'Single color in varying shades' },
      { id: 'co-pastel', label: 'Pastel', value: 'soft pastel colors', description: 'Soft, muted, light colors' },
      { id: 'co-neon', label: 'Neon', value: 'neon vibrant electric colors', description: 'Electric, high-saturation vibrant tones' },
      { id: 'co-earth', label: 'Earthy', value: 'earth tones natural browns greens', description: 'Natural browns, greens, and tans' },
      { id: 'co-bw', label: 'Black & White', value: 'black and white high contrast', description: 'No color — pure tonal contrast' },
      { id: 'co-vintage', label: 'Vintage', value: 'vintage muted desaturated', description: 'Faded, desaturated retro color grading' },
    ],
  },
];
