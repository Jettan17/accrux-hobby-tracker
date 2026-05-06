'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Settings, Upload, Download, HelpCircle } from 'lucide-react';
import { signOut } from '@/lib/supabase/auth-actions';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { StarSystem, SkillNode, SkillEdge, TodoItem } from '@/types';

interface ExportData {
  version: 1;
  exportedAt: string;
  starSystems: StarSystem[];
  skillNodes: SkillNode[];
  skillEdges: SkillEdge[];
  todoItems: TodoItem[];
}

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const starSystems = useAppStore((s) => s.starSystems);
  const skillNodes = useAppStore((s) => s.skillNodes);
  const skillEdges = useAppStore((s) => s.skillEdges);
  const todoItems = useAppStore((s) => s.todoItems);
  const startTour = useAppStore((s) => s.startTour);
  const pathname = usePathname();
  const router = useRouter();

  function handleStartTutorial() {
    const systems = Object.values(starSystems).sort((a, b) => a.sortOrder - b.sortOrder);
    if (systems.length === 0) {
      alert('Create a star system first, then start the tutorial.');
      return;
    }
    if (!pathname.startsWith('/star-system/')) {
      router.push(`/star-system/${systems[0].id}`);
    }
    startTour();
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function handleExport() {
    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      starSystems: Object.values(starSystems),
      skillNodes: Object.values(skillNodes),
      skillEdges: Object.values(skillEdges),
      todoItems: Object.values(todoItems),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accrux-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
    setMenuOpen(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (data.version !== 1) {
        alert('Unsupported backup version');
        return;
      }

      const counts = {
        systems: data.starSystems?.length ?? 0,
        nodes: data.skillNodes?.length ?? 0,
        edges: data.skillEdges?.length ?? 0,
        todos: data.todoItems?.length ?? 0,
      };

      const confirmed = confirm(
        `Import backup?\n\n${counts.systems} star systems\n${counts.nodes} skill nodes\n${counts.edges} edges\n${counts.todos} todos\n\nExisting items with matching IDs will be updated.`,
      );
      if (!confirmed) return;

      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        alert('Not authenticated');
        return;
      }
      const userId = authData.user.id;

      if (data.starSystems?.length) {
        const { error } = await supabase.from('star_systems').upsert(
          data.starSystems.map((s) => ({
            id: s.id,
            user_id: userId,
            name: s.name,
            description: s.description,
            icon_storage_key: s.iconStorageKey,
            theme_config: s.themeConfig,
            sort_order: s.sortOrder,
          })),
        );
        if (error) throw error;
      }

      if (data.skillNodes?.length) {
        const { error } = await supabase.from('skill_nodes').upsert(
          data.skillNodes.map((n) => ({
            id: n.id,
            star_system_id: n.starSystemId,
            label: n.label,
            description: n.description,
            variant: n.variant,
            completed: n.completed,
            position_x: n.positionX,
            position_y: n.positionY,
          })),
        );
        if (error) throw error;
      }

      if (data.skillEdges?.length) {
        const { error } = await supabase.from('skill_edges').upsert(
          data.skillEdges.map((edge) => ({
            id: edge.id,
            star_system_id: edge.starSystemId,
            source_node_id: edge.sourceNodeId,
            target_node_id: edge.targetNodeId,
          })),
        );
        if (error) throw error;
      }

      if (data.todoItems?.length) {
        const insertedIds = new Set<string>();
        let remaining = [...data.todoItems];

        while (remaining.length > 0) {
          const batch = remaining.filter(
            (t) => t.parentId === null || insertedIds.has(t.parentId),
          );
          if (batch.length === 0) break;

          const { error } = await supabase.from('todo_items').upsert(
            batch.map((t) => ({
              id: t.id,
              star_system_id: t.starSystemId,
              parent_id: t.parentId,
              title: t.title,
              completed: t.completed,
              sort_order: t.sortOrder,
            })),
          );
          if (error) throw error;

          const batchIds = new Set(batch.map((t) => t.id));
          for (const t of batch) insertedIds.add(t.id);
          remaining = remaining.filter((t) => !batchIds.has(t.id));
        }
      }

      const storeState = useAppStore.getState();

      const systemsMap: Record<string, StarSystem> = { ...storeState.starSystems };
      for (const s of data.starSystems ?? []) {
        systemsMap[s.id] = { ...s, userId };
      }

      const nodesMap: Record<string, SkillNode> = { ...storeState.skillNodes };
      for (const n of data.skillNodes ?? []) {
        nodesMap[n.id] = n;
      }

      const edgesMap: Record<string, SkillEdge> = { ...storeState.skillEdges };
      for (const edge of data.skillEdges ?? []) {
        edgesMap[edge.id] = edge;
      }

      const todosMap: Record<string, TodoItem> = { ...storeState.todoItems };
      for (const t of data.todoItems ?? []) {
        todosMap[t.id] = t;
      }

      useAppStore.setState({
        starSystems: systemsMap,
        skillNodes: nodesMap,
        skillEdges: edgesMap,
        todoItems: todosMap,
      });

      alert('Backup imported successfully!');
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 lg:px-6">
      <div className="flex items-center gap-2">
        <Image src="/icons/icon.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8" />
        <span className="text-lg font-bold tracking-tight text-white">Accrux</span>
      </div>

      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="hidden text-sm text-zinc-400 sm:block">{userEmail}</span>
        )}

        <button
          onClick={handleStartTutorial}
          title="Start tutorial"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50">
              <button
                onClick={handleExport}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-t-lg transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Export Backup
              </button>
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-b-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import Backup'}
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
