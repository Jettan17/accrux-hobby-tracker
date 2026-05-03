'use client';

import type { ColorPalette } from '@/types';
import { ColorPicker } from './color-picker';

interface PaletteEditorProps {
  palette: ColorPalette;
  onChange: (palette: ColorPalette) => void;
}

const PALETTE_FIELDS: Array<{ key: keyof ColorPalette; label: string }> = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text' },
];

export function PaletteEditor({ palette, onChange }: PaletteEditorProps) {
  function update(key: keyof ColorPalette, value: string) {
    onChange({ ...palette, [key]: value });
  }

  return (
    <div>
      <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Colors</h4>
      <div className="grid grid-cols-2 gap-2">
        {PALETTE_FIELDS.map(({ key, label }) => (
          <ColorPicker
            key={key}
            label={label}
            value={palette[key]}
            onChange={(v) => update(key, v)}
          />
        ))}
      </div>
    </div>
  );
}
