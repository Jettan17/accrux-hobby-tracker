'use client';

import type { BackgroundStyle } from '@/types';
import { ColorPicker } from './color-picker';

interface BackgroundEditorProps {
  background: BackgroundStyle;
  onChange: (background: BackgroundStyle) => void;
}

const BG_KINDS = [
  { value: 'solid' as const, label: 'Solid' },
  { value: 'gradient' as const, label: 'Gradient' },
] as const;

export function BackgroundEditor({ background, onChange }: BackgroundEditorProps) {
  return (
    <div>
      <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Background</h4>

      <div className="flex gap-1 mb-3">
        {BG_KINDS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (value === 'solid') {
                onChange({ kind: 'solid', color: background.kind === 'solid' ? background.color : '#0f0f0f' });
              } else {
                onChange({
                  kind: 'gradient',
                  colors: background.kind === 'gradient' ? background.colors : ['#1a1a2e', '#0f0f0f'],
                  angle: background.kind === 'gradient' ? background.angle : 180,
                });
              }
            }}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              background.kind === value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {background.kind === 'solid' && (
        <ColorPicker
          label="Color"
          value={background.color}
          onChange={(color) => onChange({ kind: 'solid', color })}
        />
      )}

      {background.kind === 'gradient' && (
        <div className="space-y-2">
          <ColorPicker
            label="Start"
            value={background.colors[0] ?? '#1a1a2e'}
            onChange={(color) =>
              onChange({
                kind: 'gradient',
                colors: [color, background.colors[1] ?? '#0f0f0f'],
                angle: background.angle,
              })
            }
          />
          <ColorPicker
            label="End"
            value={background.colors[1] ?? '#0f0f0f'}
            onChange={(color) =>
              onChange({
                kind: 'gradient',
                colors: [background.colors[0] ?? '#1a1a2e', color],
                angle: background.angle,
              })
            }
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={background.angle}
              onChange={(e) =>
                onChange({
                  kind: 'gradient',
                  colors: [...background.colors],
                  angle: Number(e.target.value),
                })
              }
              className="flex-1 accent-zinc-400"
            />
            <span className="text-xs text-zinc-500 w-8 text-right">{background.angle}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
