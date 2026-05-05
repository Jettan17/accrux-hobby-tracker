import type { StarSystem, SkillNode, SkillEdge, TodoItem } from '@/types';

interface ExportPayload {
  version: 1;
  exportedAt: string;
  starSystems: StarSystem[];
  skillNodes: SkillNode[];
  skillEdges: SkillEdge[];
  todoItems: TodoItem[];
}

interface ExportInput {
  system: StarSystem;
  skillNodes: Record<string, SkillNode>;
  skillEdges: Record<string, SkillEdge>;
  todoItems: Record<string, TodoItem>;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'star-system';
}

export function exportStarSystem({ system, skillNodes, skillEdges, todoItems }: ExportInput): void {
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    starSystems: [system],
    skillNodes: Object.values(skillNodes).filter((n) => n.starSystemId === system.id),
    skillEdges: Object.values(skillEdges).filter((e) => e.starSystemId === system.id),
    todoItems: Object.values(todoItems).filter((t) => t.starSystemId === system.id),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accrux-${slugify(system.name)}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
