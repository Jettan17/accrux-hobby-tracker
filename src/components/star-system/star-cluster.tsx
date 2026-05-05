'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { StarSystem } from '@/types';
import { useAppStore, selectCompletionStats } from '@/lib/store';
import { EditStarSystemDialog } from './edit-star-system-dialog';
import { DeleteStarSystemDialog } from './delete-star-system-dialog';

interface StarClusterProps {
  system: StarSystem;
  x: number;
  y: number;
}

const GOLD_PRIMARY = '#fbbf24';
const GOLD_ACCENT = '#fde047';

export function StarCluster({ system, x, y }: StarClusterProps) {
  const stats = useAppStore(useShallow((s) => selectCompletionStats(s, system.id)));
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isComplete = stats.totalTodos > 0 && stats.completedTodos === stats.totalTodos;

  const baseSize = 110 + Math.min(stats.totalTodos * 4, 50);

  const primary = isComplete ? GOLD_PRIMARY : system.themeConfig.palette.primary;
  const accent = isComplete ? GOLD_ACCENT : system.themeConfig.palette.accent;

  const gradientBg = `radial-gradient(circle at 32% 28%, ${primary}cc 0%, ${primary}40 45%, ${accent}10 100%)`;

  const restingGlow = `0 0 32px ${primary}66, 0 0 64px ${primary}30, inset 0 0 18px ${primary}20`;

  return (
    <>
      <div
        className="absolute"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="group relative" style={{ width: baseSize, height: baseSize }}>
          <Link
            href={`/star-system/${system.id}`}
            aria-label={`Open ${system.name}`}
            className="block w-full h-full"
          >
            <div
              className={`relative w-full h-full rounded-full transition-transform duration-300 ease-out group-hover:scale-110 ${
                isComplete ? 'animate-gold-pulse' : ''
              }`}
              style={{
                background: gradientBg,
                border: `2px solid ${primary}`,
                boxShadow: isComplete ? undefined : restingGlow,
              }}
            >
              {/* specular highlight */}
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 30%, transparent 60%)',
                }}
              />
              {/* shadow side */}
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background: `radial-gradient(circle at 75% 70%, ${accent}25 0%, transparent 45%)`,
                }}
              />
              {/* orbit ring */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: baseSize * 1.55,
                  height: baseSize * 0.42,
                  marginLeft: -(baseSize * 1.55) / 2,
                  marginTop: -(baseSize * 0.42) / 2,
                  border: `1.5px solid ${primary}55`,
                  borderRadius: '50%',
                  transform: 'rotate(-22deg)',
                }}
              />

              {isComplete && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    inset: 0,
                  }}
                >
                  <span
                    className="text-2xl"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.5))' }}
                  >
                    &#9733;
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* menu button — anchored to ball top-right */}
          <div className="absolute -top-1 -right-1 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded-lg p-1.5 text-zinc-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-zinc-900/60 md:bg-transparent border border-zinc-700/60 md:border-transparent hover:bg-zinc-900/80 hover:text-zinc-100 hover:border-zinc-700 transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Star system options"
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

          {/* label below */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
            style={{
              top: 'calc(100% + 10px)',
              maxWidth: 200,
              minWidth: 120,
            }}
          >
            <div
              className="text-sm font-semibold text-white"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.85)' }}
            >
              {system.name}
            </div>
            {stats.totalTodos > 0 && (
              <div
                className="mt-0.5 text-xs"
                style={{
                  color: isComplete ? GOLD_ACCENT : 'rgb(161,161,170)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.85)',
                }}
              >
                {stats.completedTodos}/{stats.totalTodos}
                {isComplete && ' · complete'}
              </div>
            )}
          </div>
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
