'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ThemeConfig } from '@/types';
import { PRESET_THEMES } from '@/lib/themes/presets';
import { PaletteEditor } from './palette-editor';
import { BackgroundEditor } from './background-editor';

interface ThemeEditorProps {
  themeConfig: ThemeConfig;
  onChange: (themeConfig: ThemeConfig) => void;
}

export function ThemeEditor({ themeConfig, onChange }: ThemeEditorProps) {
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-300">Color</label>

      <div className="flex flex-wrap gap-2">
        {PRESET_THEMES.map((preset) => {
          const isSelected = preset.config.palette.primary === themeConfig.palette.primary;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.config)}
              title={preset.name}
              className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-zinc-700 hover:border-zinc-500 hover:scale-105'
              }`}
              style={{ backgroundColor: preset.config.palette.primary }}
            />
          );
        })}
      </div>

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
          <PaletteEditor
            palette={themeConfig.palette}
            onChange={(palette) => onChange({ ...themeConfig, palette })}
          />

          <BackgroundEditor
            background={themeConfig.background}
            onChange={(background) => onChange({ ...themeConfig, background })}
          />

          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Edge Style</h4>
            <div className="grid grid-cols-2 gap-1">
              {EDGE_STYLES.map(({ value, label, preview }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ ...themeConfig, edgeStyle: value })}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    themeConfig.edgeStyle === value
                      ? 'bg-zinc-700 text-white border border-zinc-500'
                      : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-widest">{preview}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EDGE_STYLES = [
  { value: 'constellation' as const, label: 'Constellation', preview: '· · · ·' },
  { value: 'solid' as const, label: 'Solid', preview: '————' },
  { value: 'rope' as const, label: 'Rope', preview: '–·–·–' },
  { value: 'branch' as const, label: 'Branch', preview: '━━━━' },
];
