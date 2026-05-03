'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ThemeConfig } from '@/types';
import { PRESET_THEMES } from '@/lib/themes/presets';
import { PaletteEditor } from './palette-editor';
import { BackgroundEditor } from './background-editor';
import { ShapeEdgeEditor } from './shape-edge-editor';
import { ThemePreview } from './theme-preview';

interface ThemeEditorProps {
  themeConfig: ThemeConfig;
  onChange: (themeConfig: ThemeConfig) => void;
}

const PRESET_ENTRIES = Object.entries(PRESET_THEMES);

export function ThemeEditor({ themeConfig, onChange }: ThemeEditorProps) {
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-300">Theme</label>

      {/* Preset picker */}
      <div className="grid grid-cols-4 gap-2">
        {PRESET_ENTRIES.map(([key, theme]) => {
          const isSelected = theme.palette.primary === themeConfig.palette.primary
            && theme.edgeStyle === themeConfig.edgeStyle
            && theme.nodeShape === themeConfig.nodeShape;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(theme)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'border-white bg-zinc-800 text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <div
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: theme.palette.primary }}
              />
              <span className="capitalize truncate w-full text-center">
                {key.replace('-', ' ')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customize toggle */}
      <button
        type="button"
        onClick={() => setCustomizeOpen(!customizeOpen)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        {customizeOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Customize
      </button>

      {customizeOpen && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <ThemePreview themeConfig={themeConfig} />

          <PaletteEditor
            palette={themeConfig.palette}
            onChange={(palette) => onChange({ ...themeConfig, palette })}
          />

          <BackgroundEditor
            background={themeConfig.background}
            onChange={(background) => onChange({ ...themeConfig, background })}
          />

          <ShapeEdgeEditor
            nodeShape={themeConfig.nodeShape}
            edgeStyle={themeConfig.edgeStyle}
            onShapeChange={(nodeShape) => onChange({ ...themeConfig, nodeShape })}
            onEdgeChange={(edgeStyle) => onChange({ ...themeConfig, edgeStyle })}
          />
        </div>
      )}
    </div>
  );
}
