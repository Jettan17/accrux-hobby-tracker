'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectCompletionStats } from '@/lib/store';
import { EditStarSystemDialog } from './edit-star-system-dialog';
import { DeleteStarSystemDialog } from './delete-star-system-dialog';
import { SkillTreeTab } from './skill-tree-tab';
import { TodosTab } from './todos-tab';

interface StarSystemDetailProps {
  starSystemId: string;
}

type Tab = 'todos' | 'skill-tree';

export function StarSystemDetail({ starSystemId }: StarSystemDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const system = useAppStore((s) => s.starSystems[starSystemId]);
  const starSystemsLoaded = useAppStore((s) => s.starSystemsLoaded);
  const stats = useAppStore(useShallow((s) => selectCompletionStats(s, starSystemId)));
  const loadTodoItems = useAppStore((s) => s.loadTodoItems);

  useEffect(() => {
    if (!starSystemId) return;
    let cancelled = false;

    async function load() {
      await loadTodoItems(starSystemId);
      if (!cancelled) setDataLoaded(true);
    }

    load();
    return () => { cancelled = true; };
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

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: 'todos', label: 'Tasks', count: stats.totalTodos },
    { key: 'skill-tree', label: 'Skill Tree' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3 mb-3">
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
          <h1 className="text-xl font-bold text-white flex-1">{system.name}</h1>

          <button
            onClick={() => setEditOpen(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {system.description && (
          <p className="text-sm text-zinc-400 mb-3 ml-10">{system.description}</p>
        )}

        {stats.totalTodos > 0 && (
          <div className="flex gap-6 ml-10 text-xs text-zinc-500">
            <span>
              Progress: {stats.completedTodos}/{stats.totalTodos} ({stats.todoPercent}%)
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4 ml-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${activeTab === tab.key
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 text-xs text-zinc-500">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'skill-tree' ? (
          <SkillTreeTab starSystemId={starSystemId} loaded={dataLoaded} />
        ) : (
          <TodosTab starSystemId={starSystemId} loaded={dataLoaded} />
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
