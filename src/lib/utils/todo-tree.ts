import type { TodoItem } from '@/types';
import type { NodeVariant } from '@/types';

export interface DerivedNode {
  id: string;
  label: string;
  variant: NodeVariant;
  completed: boolean;
  locked: boolean;
  parentId: string | null;
  depth: number;
}

export interface DerivedEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

function getDepth(item: TodoItem, lookup: Record<string, TodoItem>): number {
  let depth = 0;
  let current = item;
  while (current.parentId && lookup[current.parentId]) {
    depth++;
    current = lookup[current.parentId];
  }
  return depth;
}

function depthToVariant(depth: number): NodeVariant {
  if (depth === 0) return 'gas-giant';
  if (depth === 1) return 'moon';
  return 'asteroid';
}

export function deriveTodoTree(todos: TodoItem[]): {
  nodes: DerivedNode[];
  edges: DerivedEdge[];
} {
  const lookup: Record<string, TodoItem> = {};
  for (const t of todos) {
    lookup[t.id] = t;
  }

  const nodes: DerivedNode[] = [];
  const edges: DerivedEdge[] = [];

  for (const todo of todos) {
    const depth = getDepth(todo, lookup);
    nodes.push({
      id: todo.id,
      label: todo.title,
      variant: depthToVariant(depth),
      completed: todo.completed,
      locked: todo.locked,
      parentId: todo.parentId,
      depth,
    });

    if (todo.parentId) {
      edges.push({
        id: `edge-${todo.parentId}-${todo.id}`,
        sourceId: todo.parentId,
        targetId: todo.id,
      });
    }
  }

  return { nodes, edges };
}

export interface LayoutPosition {
  x: number;
  y: number;
}

export function layoutTree(nodes: DerivedNode[]): Record<string, LayoutPosition> {
  const positions: Record<string, LayoutPosition> = {};
  const childrenMap: Record<string, DerivedNode[]> = {};

  for (const node of nodes) {
    const parentKey = node.parentId ?? '__root__';
    if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
    childrenMap[parentKey].push(node);
  }

  // Sort children by sort order (preserved in the array order from the store)
  for (const key of Object.keys(childrenMap)) {
    childrenMap[key].sort((a, b) => {
      const todoA = nodes.find((n) => n.id === a.id);
      const todoB = nodes.find((n) => n.id === b.id);
      return (todoA?.depth ?? 0) - (todoB?.depth ?? 0);
    });
  }

  const HORIZONTAL_SPACING = 240;
  const VERTICAL_SPACING = 200;

  let xCursor = 0;

  function layoutSubtree(nodeId: string, depth: number): number {
    const children = childrenMap[nodeId] ?? [];

    if (children.length === 0) {
      positions[nodeId] = { x: xCursor, y: depth * VERTICAL_SPACING };
      xCursor += HORIZONTAL_SPACING;
      return positions[nodeId].x;
    }

    const childXPositions: number[] = [];
    for (const child of children) {
      const childX = layoutSubtree(child.id, depth + 1);
      childXPositions.push(childX);
    }

    const minX = Math.min(...childXPositions);
    const maxX = Math.max(...childXPositions);
    const centerX = (minX + maxX) / 2;

    positions[nodeId] = { x: centerX, y: depth * VERTICAL_SPACING };
    return centerX;
  }

  const roots = childrenMap['__root__'] ?? [];
  for (const root of roots) {
    layoutSubtree(root.id, 0);
  }

  return positions;
}
