'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, LogOut, Settings, Download } from 'lucide-react';
import { signOut } from '@/lib/supabase/auth-actions';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
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
  const menuRef = useRef<HTMLDivElement>(null);

  const starSystems = useAppStore((s) => s.starSystems);
  const skillNodes = useAppStore((s) => s.skillNodes);
  const skillEdges = useAppStore((s) => s.skillEdges);
  const todoItems = useAppStore((s) => s.todoItems);

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

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 lg:px-6">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-white" />
        <span className="text-lg font-bold tracking-tight text-white">Accrux</span>
      </div>

      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="hidden text-sm text-zinc-400 sm:block">{userEmail}</span>
        )}

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
                <Download className="h-4 w-4" />
                Export Backup
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-b-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>

        {!menuOpen && (
          <form action={signOut} className="hidden sm:block">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
