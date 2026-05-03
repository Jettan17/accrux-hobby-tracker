'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SkillNode, NodeVariant } from '@/types';

interface NodeDetailPanelProps {
  node: SkillNode | null;
  onClose: () => void;
  onSave: (id: string, updates: { label: string; description: string; variant: NodeVariant }) => void;
}

const VARIANTS: Array<{ value: NodeVariant; label: string }> = [
  { value: 'gas-giant', label: 'Milestone (Gas Giant)' },
  { value: 'moon', label: 'Sub-skill (Moon)' },
  { value: 'asteroid', label: 'Task (Asteroid)' },
];

export function NodeDetailPanel({ node, onClose, onSave }: NodeDetailPanelProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [variant, setVariant] = useState<NodeVariant>('moon');

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setDescription(node.description);
      setVariant(node.variant);
    }
  }, [node]);

  if (!node) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave(node!.id, { label: trimmed, description: description.trim(), variant });
    onClose();
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-72 bg-zinc-900 border-l border-zinc-700 p-4 z-50 overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Edit Skill</h3>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-md bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description..."
            className="w-full rounded-md bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Type</label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as NodeVariant)}
            className="w-full rounded-md bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-400"
          >
            {VARIANTS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={!label.trim()}
            className="flex-1 px-3 py-1.5 rounded-md bg-zinc-700 text-sm text-white hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
