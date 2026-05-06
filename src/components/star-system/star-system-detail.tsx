'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Upload, Network, ListChecks } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectCompletionStats } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { EditStarSystemDialog } from './edit-star-system-dialog';
import { DeleteStarSystemDialog } from './delete-star-system-dialog';
import { SkillTreeTab } from './skill-tree-tab';
import { TodosTab } from './todos-tab';
import { exportStarSystem } from '@/lib/utils/export-star-system';

interface StarSystemDetailProps {
  starSystemId: string;
}

type MobileView = 'tree' | 'tasks';

export function StarSystemDetail({ starSystemId }: StarSystemDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('tree');

  const isMobile = useIsMobile();

  const system = useAppStore((s) => s.starSystems[starSystemId]);
  const starSystemsLoaded = useAppStore((s) => s.starSystemsLoaded);
  const stats = useAppStore(useShallow((s) => selectCompletionStats(s, starSystemId)));
  const loadTodoItems = useAppStore((s) => s.loadTodoItems);

  const handleExport = () => {
    if (!system) return;
    const state = useAppStore.getState();
    exportStarSystem({
      system,
      skillNodes: state.skillNodes,
      skillEdges: state.skillEdges,
      todoItems: state.todoItems,
    });
  };

  useEffect(() => {
    if (!starSystemId) return;
    let cancelled = false;

    async function load() {
      await loadTodoItems(starSystemId);
      if (!cancelled) setDataLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [starSystemId, loadTodoItems]);

  if (!starSystemsLoaded) {
    return (
      <div className="p-4 lg:p-8">
        <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse mb-4" />
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      </div>
    );
  }

  if (!system) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Star system not found</h2>
        <p className="text-zinc-400 mb-4">This star system may have been deleted.</p>
        <Link href="/" className="text-sm text-zinc-300 hover:text-white underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const primaryColor = system.themeConfig.palette.primary;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          />
          <h1 className="text-xl font-bold text-white flex-1 truncate">{system.name}</h1>

          <button
            onClick={handleExport}
            data-tour="export-system"
            title="Export star system"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditOpen(true)}
            data-tour="edit-system"
            title="Edit"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            title="Delete"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {(system.description || stats.totalTodos > 0 || isMobile) && (
          <div className="mt-3 ml-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            {system.description && (
              <p className="text-sm text-zinc-400 flex-1 min-w-[200px]">{system.description}</p>
            )}
            {stats.totalTodos > 0 && (
              <span className="text-xs text-zinc-500">
                Progress: {stats.completedTodos}/{stats.totalTodos} ({stats.todoPercent}%)
              </span>
            )}
          </div>
        )}

        {isMobile && (
          <div className="mt-3 ml-10 inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => setMobileView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mobileView === 'tree'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              Skill Tree
            </button>
            <button
              onClick={() => setMobileView('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mobileView === 'tasks'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Tasks{stats.totalTodos > 0 ? ` (${stats.totalTodos})` : ''}
            </button>
          </div>
        )}
      </div>

      {/* Body — split on desktop, single panel on mobile */}
      <div className="flex-1 flex overflow-hidden">
        {isMobile ? (
          mobileView === 'tree' ? (
            <div className="flex-1 min-w-0">
              <SkillTreeTab starSystemId={starSystemId} loaded={dataLoaded} />
            </div>
          ) : (
            <div className="flex-1 min-w-0 overflow-y-auto">
              <TodosTab starSystemId={starSystemId} loaded={dataLoaded} />
            </div>
          )
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <SkillTreeTab starSystemId={starSystemId} loaded={dataLoaded} />
            </div>
            <div className="w-[420px] flex-shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-950/40">
              <TodosTab starSystemId={starSystemId} loaded={dataLoaded} />
            </div>
          </>
        )}
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
    </div>
  );
}
