'use client';

import { useId } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="relative cursor-pointer">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div
          className="h-7 w-7 rounded-md border border-zinc-600 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      </label>
      <span className="text-xs text-zinc-400 flex-1 min-w-0 truncate">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="w-[72px] rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
      />
    </div>
  );
}
