'use client';

import { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
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

export function DataExportImport() {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const starSystems = useAppStore((s) => s.starSystems);
  const skillNodes = useAppStore((s) => s.skillNodes);
  const skillEdges = useAppStore((s) => s.skillEdges);
  const todoItems = useAppStore((s) => s.todoItems);

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
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (data.version !== 1) {
        setImportStatus('Unsupported backup version');
        return;
      }

      const counts = {
        systems: data.starSystems?.length ?? 0,
        nodes: data.skillNodes?.length ?? 0,
        edges: data.skillEdges?.length ?? 0,
        todos: data.todoItems?.length ?? 0,
      };

      setImportStatus(
        `Backup contains: ${counts.systems} star systems, ${counts.nodes} nodes, ${counts.edges} edges, ${counts.todos} todos. Import via Supabase SQL for now.`
      );
    } catch {
      setImportStatus('Failed to read backup file');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-white mb-1">Export Data</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Download a JSON backup of all your star systems, skills, and todos.
        </p>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Backup
        </Button>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <h3 className="text-sm font-medium text-white mb-1">Import Data</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Inspect a previously exported backup file.
        </p>
        <Button variant="secondary" size="sm" onClick={handleImportClick}>
          <Upload className="h-4 w-4" />
          Choose Backup File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        {importStatus && (
          <p className="text-xs text-zinc-400 mt-2">{importStatus}</p>
        )}
      </div>
    </div>
  );
}
