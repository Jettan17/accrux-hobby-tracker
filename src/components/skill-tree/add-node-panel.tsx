'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { NodeVariant } from '@/types';

interface AddNodePanelProps {
  onAdd: (label: string, variant: NodeVariant) => void;
}

const VARIANTS: Array<{ value: NodeVariant; label: string; description: string }> = [
  { value: 'gas-giant', label: 'Milestone', description: 'Major achievement' },
  { value: 'moon', label: 'Sub-skill', description: 'Supporting skill' },
  { value: 'asteroid', label: 'Task', description: 'Small step' },
];

export function AddNodePanel({ onAdd }: AddNodePanelProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [variant, setVariant] = useState<NodeVariant>('moon');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed, variant);
    setLabel('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add Skill
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-lg bg-zinc-900 border border-zinc-700 p-3 shadow-xl"
    >
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-zinc-400 mb-1">Skill name</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Linked Lists"
          autoFocus
          className="w-full rounded-md bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Type</label>
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as NodeVariant)}
          className="rounded-md bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-400"
        >
          {VARIANTS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!label.trim()}
        className="px-3 py-1.5 rounded-md bg-zinc-700 text-sm text-white hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Add
      </button>

      <button
        type="button"
        onClick={() => { setOpen(false); setLabel(''); }}
        className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
