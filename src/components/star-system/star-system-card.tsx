'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { StarSystem } from '@/types';
import { useAppStore, selectCompletionStats } from '@/lib/store';
import { EditStarSystemDialog } from './edit-star-system-dialog';
import { DeleteStarSystemDialog } from './delete-star-system-dialog';

interface StarSystemCardProps {
  system: StarSystem;
}

export function StarSystemCard({ system }: StarSystemCardProps) {
  const stats = useAppStore(useShallow((state) => selectCompletionStats(state, system.id)));
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900/80">
        <Link
          href={`/star-system/${system.id}`}
          className="block p-5"
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: system.themeConfig.palette.primary }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-zinc-50">{system.name}</h3>
              {system.description && (
                <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{system.description}</p>
              )}
            </div>
          </div>

          {stats.totalTodos > 0 && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Progress</span>
                <span>{stats.completedTodos}/{stats.totalTodos}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.todoPercent}%`,
                    backgroundColor: system.themeConfig.palette.primary,
                  }}
                />
              </div>
            </div>
          )}
        </Link>

        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="rounded-lg p-1.5 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-300 transition-all cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <EditStarSystemDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        system={system}
      />
      <DeleteStarSystemDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        system={system}
      />
    </>
  );
}
