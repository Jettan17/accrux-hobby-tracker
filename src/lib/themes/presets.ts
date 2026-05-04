import type { ThemeConfig } from '@/types';

export interface ThemePreset {
  name: string;
  config: ThemeConfig;
}

export const PRESET_THEMES: ThemePreset[] = [
  {
    name: 'Orange',
    config: {
      background: { kind: 'gradient', colors: ['#1a0e04', '#0f0a05'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#f97316',
        secondary: '#b45c12',
        accent: '#fb923c',
        background: '#1a0e04',
        surface: '#2a1a0a',
        text: '#fff2e6',
      },
    },
  },
  {
    name: 'Amber',
    config: {
      background: { kind: 'gradient', colors: ['#1a1306', '#0f0c04'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#f59e0b',
        secondary: '#b07408',
        accent: '#fbbf24',
        background: '#1a1306',
        surface: '#2a2210',
        text: '#fef3c7',
      },
    },
  },
  {
    name: 'Red',
    config: {
      background: { kind: 'gradient', colors: ['#1a0606', '#0f0404'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#dc2626',
        secondary: '#a11c1c',
        accent: '#ef4444',
        background: '#1a0606',
        surface: '#2a1010',
        text: '#fee2e2',
      },
    },
  },
  {
    name: 'Green',
    config: {
      background: { kind: 'gradient', colors: ['#041a0a', '#040f08'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#22c55e',
        secondary: '#188a42',
        accent: '#4ade80',
        background: '#041a0a',
        surface: '#0a2a14',
        text: '#dcfce7',
      },
    },
  },
  {
    name: 'Purple',
    config: {
      background: { kind: 'gradient', colors: ['#120720', '#0a0414'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#a855f7',
        secondary: '#7c3db5',
        accent: '#c084fc',
        background: '#120720',
        surface: '#1e1030',
        text: '#f3e8ff',
      },
    },
  },
  {
    name: 'Blue',
    config: {
      background: { kind: 'gradient', colors: ['#040e1a', '#04080f'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#3b82f6',
        secondary: '#2a5eb5',
        accent: '#60a5fa',
        background: '#040e1a',
        surface: '#0e1e30',
        text: '#dbeafe',
      },
    },
  },
  {
    name: 'Cyan',
    config: {
      background: { kind: 'gradient', colors: ['#041a1a', '#040f0f'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#06b6d4',
        secondary: '#05849a',
        accent: '#22d3ee',
        background: '#041a1a',
        surface: '#0a2a2a',
        text: '#ecfeff',
      },
    },
  },
  {
    name: 'Pink',
    config: {
      background: { kind: 'gradient', colors: ['#1a0410', '#0f040a'], angle: 180 },
      defaultNodeOverlay: { kind: 'none' },
      edgeStyle: 'constellation',
      palette: {
        primary: '#ec4899',
        secondary: '#ae3571',
        accent: '#f472b6',
        background: '#1a0410',
        surface: '#2a0e1e',
        text: '#fce7f3',
      },
    },
  },
];

export const DEFAULT_THEME = PRESET_THEMES[0].config;

export const BACKGROUND_IMAGE_PRESETS = [
  { name: 'Stars', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80' },
  { name: 'Nebula', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80' },
  { name: 'Galaxy', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80' },
  { name: 'Cosmos', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80' },
  { name: 'Aurora', url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1920&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { name: 'Mist', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80' },
  { name: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80' },
  { name: 'Snow', url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80' },
  { name: 'Desert', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80' },
  { name: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80' },
  { name: 'Moon', url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1920&q=80' },
  { name: 'Lake', url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1920&q=80' },
  { name: 'Lavender', url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80' },
];
