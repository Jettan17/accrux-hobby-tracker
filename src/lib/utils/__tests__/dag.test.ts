import { describe, it, expect } from 'vitest';
import { hasCycle, getNodeStatus } from '../dag';
import type { SkillEdge } from '@/types';

function edge(source: string, target: string, id?: string): SkillEdge {
  return {
    id: id ?? `${source}-${target}`,
    starSystemId: 'sys-1',
    sourceNodeId: source,
    targetNodeId: target,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('hasCycle', () => {
  it('returns false for an empty graph', () => {
    expect(hasCycle([], { sourceNodeId: 'a', targetNodeId: 'b' })).toBe(false);
  });

  it('returns true for a self-loop', () => {
    expect(hasCycle([], { sourceNodeId: 'a', targetNodeId: 'a' })).toBe(true);
  });

  it('returns false for a valid chain', () => {
    const edges = [edge('a', 'b')];
    expect(hasCycle(edges, { sourceNodeId: 'b', targetNodeId: 'c' })).toBe(false);
  });

  it('detects a simple cycle', () => {
    const edges = [edge('a', 'b'), edge('b', 'c')];
    expect(hasCycle(edges, { sourceNodeId: 'c', targetNodeId: 'a' })).toBe(true);
  });

  it('allows diamond shapes without cycles', () => {
    const edges = [edge('a', 'b'), edge('a', 'c'), edge('b', 'd')];
    expect(hasCycle(edges, { sourceNodeId: 'c', targetNodeId: 'd' })).toBe(false);
  });
});

describe('getNodeStatus', () => {
  it('returns completed for completed nodes', () => {
    expect(getNodeStatus('a', new Set(['a']), [])).toBe('completed');
  });

  it('returns available for nodes with no prerequisites', () => {
    expect(getNodeStatus('a', new Set(), [])).toBe('available');
  });

  it('returns locked when prerequisites are incomplete', () => {
    const edges = [edge('a', 'b')];
    expect(getNodeStatus('b', new Set(), edges)).toBe('locked');
  });

  it('returns available when all prerequisites are completed', () => {
    const edges = [edge('a', 'b')];
    expect(getNodeStatus('b', new Set(['a']), edges)).toBe('available');
  });

  it('returns locked when some prerequisites are incomplete', () => {
    const edges = [edge('a', 'c'), edge('b', 'c')];
    expect(getNodeStatus('c', new Set(['a']), edges)).toBe('locked');
  });
});
