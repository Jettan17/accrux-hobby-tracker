import type { SkillEdge } from '@/types';

export function hasCycle(
  edges: readonly SkillEdge[],
  candidateEdge: { sourceNodeId: string; targetNodeId: string },
): boolean {
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const neighbors = adjacency.get(edge.sourceNodeId) ?? [];
    neighbors.push(edge.targetNodeId);
    adjacency.set(edge.sourceNodeId, neighbors);
  }

  const sourceNeighbors = adjacency.get(candidateEdge.sourceNodeId) ?? [];
  sourceNeighbors.push(candidateEdge.targetNodeId);
  adjacency.set(candidateEdge.sourceNodeId, sourceNeighbors);

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string): boolean {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    inStack.add(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (dfs(neighbor)) return true;
    }

    inStack.delete(node);
    return false;
  }

  for (const node of adjacency.keys()) {
    if (dfs(node)) return true;
  }

  return false;
}

export function getNodeStatus(
  nodeId: string,
  completedNodeIds: ReadonlySet<string>,
  edges: readonly SkillEdge[],
): 'locked' | 'available' | 'completed' {
  if (completedNodeIds.has(nodeId)) return 'completed';

  const prerequisites = edges
    .filter((e) => e.targetNodeId === nodeId)
    .map((e) => e.sourceNodeId);

  if (prerequisites.length === 0) return 'available';

  const allPrereqsMet = prerequisites.every((id) => completedNodeIds.has(id));
  return allPrereqsMet ? 'available' : 'locked';
}
