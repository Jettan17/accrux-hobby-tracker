import type { StateCreator } from 'zustand';
import type { SkillNode, NodeVariant } from '@/types';
import type { AppState } from './index';
import { createId } from '@/lib/utils/ids';
import { now } from '@/lib/utils/timestamps';
import { createClient } from '@/lib/supabase/client';

export interface SkillNodeSlice {
  skillNodes: Record<string, SkillNode>;

  loadSkillNodes: (starSystemId: string) => Promise<void>;
  createSkillNode: (params: {
    starSystemId: string;
    label: string;
    description?: string;
    variant: NodeVariant;
    positionX: number;
    positionY: number;
  }) => Promise<SkillNode>;
  updateSkillNode: (id: string, updates: Partial<Pick<SkillNode, 'label' | 'description' | 'variant' | 'completed' | 'positionX' | 'positionY'>>) => Promise<void>;
  updateNodePositions: (updates: Array<{ id: string; positionX: number; positionY: number }>) => Promise<void>;
  deleteSkillNode: (id: string) => Promise<void>;
}

export const createSkillNodeSlice: StateCreator<AppState, [], [], SkillNodeSlice> = (set, get) => ({
  skillNodes: {},

  loadSkillNodes: async (starSystemId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('skill_nodes')
      .select('*')
      .eq('star_system_id', starSystemId);

    if (error) throw error;

    const nodes: Record<string, SkillNode> = { ...get().skillNodes };
    for (const row of data ?? []) {
      nodes[row.id as string] = rowToSkillNode(row);
    }
    set({ skillNodes: nodes });
  },

  createSkillNode: async ({ starSystemId, label, description, variant, positionX, positionY }) => {
    const supabase = createClient();
    const id = createId();
    const timestamp = now();

    const node: SkillNode = {
      id,
      starSystemId,
      label,
      description: description ?? '',
      variant,
      completed: false,
      positionX,
      positionY,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const { error } = await supabase.from('skill_nodes').insert({
      id: node.id,
      star_system_id: node.starSystemId,
      label: node.label,
      description: node.description,
      variant: node.variant,
      completed: node.completed,
      position_x: node.positionX,
      position_y: node.positionY,
    });

    if (error) throw error;

    set((state) => ({
      skillNodes: { ...state.skillNodes, [id]: node },
    }));

    return node;
  },

  updateSkillNode: async (id, updates) => {
    const supabase = createClient();
    const existing = get().skillNodes[id];
    if (!existing) return;

    const updated: SkillNode = { ...existing, ...updates, updatedAt: now() };

    const dbUpdates: Record<string, unknown> = { updated_at: updated.updatedAt };
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.variant !== undefined) dbUpdates.variant = updates.variant;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.positionX !== undefined) dbUpdates.position_x = updates.positionX;
    if (updates.positionY !== undefined) dbUpdates.position_y = updates.positionY;

    const { error } = await supabase.from('skill_nodes').update(dbUpdates).eq('id', id);
    if (error) throw error;

    set((state) => ({
      skillNodes: { ...state.skillNodes, [id]: updated },
    }));
  },

  updateNodePositions: async (updates) => {
    const supabase = createClient();
    const timestamp = now();
    const currentNodes = get().skillNodes;
    const updatedNodes = { ...currentNodes };

    for (const { id, positionX, positionY } of updates) {
      const existing = currentNodes[id];
      if (!existing) continue;
      updatedNodes[id] = { ...existing, positionX, positionY, updatedAt: timestamp };
    }

    set({ skillNodes: updatedNodes });

    for (const { id, positionX, positionY } of updates) {
      await supabase
        .from('skill_nodes')
        .update({ position_x: positionX, position_y: positionY, updated_at: timestamp })
        .eq('id', id);
    }
  },

  deleteSkillNode: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('skill_nodes').delete().eq('id', id);
    if (error) throw error;

    set((state) => {
      const { [id]: _, ...rest } = state.skillNodes;
      const edges = { ...state.skillEdges };
      for (const [edgeId, edge] of Object.entries(edges)) {
        if (edge.sourceNodeId === id || edge.targetNodeId === id) {
          delete edges[edgeId];
        }
      }
      return { skillNodes: rest, skillEdges: edges };
    });
  },
});

function rowToSkillNode(row: Record<string, unknown>): SkillNode {
  return {
    id: row.id as string,
    starSystemId: row.star_system_id as string,
    label: row.label as string,
    description: row.description as string,
    variant: row.variant as NodeVariant,
    completed: row.completed as boolean,
    positionX: row.position_x as number,
    positionY: row.position_y as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
