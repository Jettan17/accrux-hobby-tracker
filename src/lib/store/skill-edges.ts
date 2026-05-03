import type { StateCreator } from 'zustand';
import type { SkillEdge } from '@/types';
import type { AppState } from './index';
import { createId } from '@/lib/utils/ids';
import { now } from '@/lib/utils/timestamps';
import { hasCycle } from '@/lib/utils/dag';
import { createClient } from '@/lib/supabase/client';

export interface SkillEdgeSlice {
  skillEdges: Record<string, SkillEdge>;

  loadSkillEdges: (starSystemId: string) => Promise<void>;
  createSkillEdge: (params: {
    starSystemId: string;
    sourceNodeId: string;
    targetNodeId: string;
  }) => Promise<SkillEdge | null>;
  deleteSkillEdge: (id: string) => Promise<void>;
}

export const createSkillEdgeSlice: StateCreator<AppState, [], [], SkillEdgeSlice> = (set, get) => ({
  skillEdges: {},

  loadSkillEdges: async (starSystemId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('skill_edges')
      .select('*')
      .eq('star_system_id', starSystemId);

    if (error) throw error;

    const edges: Record<string, SkillEdge> = { ...get().skillEdges };
    for (const row of data ?? []) {
      edges[row.id as string] = rowToSkillEdge(row);
    }
    set({ skillEdges: edges });
  },

  createSkillEdge: async ({ starSystemId, sourceNodeId, targetNodeId }) => {
    if (sourceNodeId === targetNodeId) return null;

    const existingEdges = Object.values(get().skillEdges).filter(
      (e) => e.starSystemId === starSystemId,
    );

    if (hasCycle(existingEdges, { sourceNodeId, targetNodeId })) {
      return null;
    }

    const duplicate = existingEdges.find(
      (e) => e.sourceNodeId === sourceNodeId && e.targetNodeId === targetNodeId,
    );
    if (duplicate) return null;

    const supabase = createClient();
    const id = createId();
    const timestamp = now();

    const edge: SkillEdge = {
      id,
      starSystemId,
      sourceNodeId,
      targetNodeId,
      createdAt: timestamp,
    };

    const { error } = await supabase.from('skill_edges').insert({
      id: edge.id,
      star_system_id: edge.starSystemId,
      source_node_id: edge.sourceNodeId,
      target_node_id: edge.targetNodeId,
    });

    if (error) throw error;

    set((state) => ({
      skillEdges: { ...state.skillEdges, [id]: edge },
    }));

    return edge;
  },

  deleteSkillEdge: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('skill_edges').delete().eq('id', id);
    if (error) throw error;

    set((state) => {
      const { [id]: _, ...rest } = state.skillEdges;
      return { skillEdges: rest };
    });
  },
});

function rowToSkillEdge(row: Record<string, unknown>): SkillEdge {
  return {
    id: row.id as string,
    starSystemId: row.star_system_id as string,
    sourceNodeId: row.source_node_id as string,
    targetNodeId: row.target_node_id as string,
    createdAt: row.created_at as string,
  };
}
