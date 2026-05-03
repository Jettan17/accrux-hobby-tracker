import type { ThemeConfig } from '@/types';

export const PRESET_THEMES: Record<string, ThemeConfig> = {
  programming: {
    background: { kind: 'gradient', colors: ['#1a1a2e', '#0f0f0f'], angle: 180 },
    nodeShape: 'hexagon',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'code-2' },
    edgeStyle: 'solid',
    palette: {
      primary: '#f97316',
      secondary: '#6b7280',
      accent: '#fb923c',
      background: '#1a1a2e',
      surface: '#2a2a3e',
      text: '#f5f5f5',
    },
  },

  languages: {
    background: { kind: 'gradient', colors: ['#1c1917', '#292524'], angle: 135 },
    nodeShape: 'hexagon',
    defaultNodeOverlay: { kind: 'glyph', character: '文' },
    edgeStyle: 'solid',
    palette: {
      primary: '#f59e0b',
      secondary: '#d6d3d1',
      accent: '#fbbf24',
      background: '#1c1917',
      surface: '#2c2926',
      text: '#fef3c7',
    },
  },

  climbing: {
    background: { kind: 'solid', color: '#1a1510' },
    nodeShape: 'irregular',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'mountain' },
    edgeStyle: 'rope',
    palette: {
      primary: '#ea580c',
      secondary: '#a16207',
      accent: '#fb923c',
      background: '#1a1510',
      surface: '#2a2520',
      text: '#fed7aa',
    },
  },

  'video-editing': {
    background: { kind: 'gradient', colors: ['#0f0720', '#1a0a30'], angle: 160 },
    nodeShape: 'circle',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'film' },
    edgeStyle: 'solid',
    palette: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#e879f9',
      background: '#0f0720',
      surface: '#1f1730',
      text: '#f0e6ff',
    },
  },

  gym: {
    background: { kind: 'solid', color: '#0a0a0a' },
    nodeShape: 'irregular',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'dumbbell' },
    edgeStyle: 'solid',
    palette: {
      primary: '#dc2626',
      secondary: '#71717a',
      accent: '#ef4444',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#e4e4e7',
    },
  },

  'game-development': {
    background: { kind: 'gradient', colors: ['#021a0a', '#0a1a10'], angle: 170 },
    nodeShape: 'hexagon',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'gamepad-2' },
    edgeStyle: 'constellation',
    palette: {
      primary: '#22c55e',
      secondary: '#14b8a6',
      accent: '#4ade80',
      background: '#021a0a',
      surface: '#0a2a1a',
      text: '#dcfce7',
    },
  },

  driving: {
    background: { kind: 'gradient', colors: ['#111114', '#1e1e24'], angle: 180 },
    nodeShape: 'circle',
    defaultNodeOverlay: { kind: 'icon', lucideIconName: 'car' },
    edgeStyle: 'solid',
    palette: {
      primary: '#f59e0b',
      secondary: '#6b7280',
      accent: '#fbbf24',
      background: '#111114',
      surface: '#1e1e24',
      text: '#f5f5f5',
    },
  },
};

export const DEFAULT_PRESET = 'programming';
