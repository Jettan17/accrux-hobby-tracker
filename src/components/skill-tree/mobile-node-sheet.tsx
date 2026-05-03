'use client';

import { X, Check, Undo2, Pencil, Trash2 } from 'lucide-react';
import type { SkillNode, NodeStatus } from '@/types';

interface MobileNodeSheetProps {
  node: SkillNode | null;
  status: NodeStatus;
  onClose: () => void;
  onToggleComplete: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

const VARIANT_LABELS: Record<string, string> = {
  'gas-giant': 'Milestone',
  moon: 'Sub-skill',
  asteroid: 'Task',
};

export function MobileNodeSheet({
  node,
  status,
  onClose,
  onToggleComplete,
  onEdit,
  onDelete,
}: MobileNodeSheetProps) {
  if (!node) return null;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl shadow-2xl animate-slide-up">
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-3" />

        <div className="px-5 pt-4 pb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white truncate">{node.label}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {VARIANT_LABELS[node.variant] ?? node.variant}
              {isLocked && ' — Locked'}
              {isCompleted && ' — Completed'}
            </p>
            {node.description && (
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{node.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-6 pt-2 flex flex-col gap-2">
          {!isLocked && (
            <button
              onClick={() => { onToggleComplete(node.id); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-zinc-800 text-left text-sm text-zinc-200 active:bg-zinc-700 transition-colors"
            >
              {isCompleted ? <Undo2 className="h-4 w-4 text-amber-400" /> : <Check className="h-4 w-4 text-emerald-400" />}
              {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            </button>
          )}

          <button
            onClick={() => { onEdit(node.id); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-zinc-800 text-left text-sm text-zinc-200 active:bg-zinc-700 transition-colors"
          >
            <Pencil className="h-4 w-4 text-blue-400" />
            Edit skill
          </button>

          <button
            onClick={() => { onDelete(node.id); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-zinc-800 text-left text-sm text-red-400 active:bg-zinc-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete skill
          </button>
        </div>
      </div>
    </>
  );
}
