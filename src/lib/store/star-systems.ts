import type { StateCreator } from 'zustand';
import type { StarSystem, ThemeConfig } from '@/types';
import type { AppState } from './index';
import { createId } from '@/lib/utils/ids';
import { now } from '@/lib/utils/timestamps';
import { createClient } from '@/lib/supabase/client';

export interface StarSystemSlice {
  starSystems: Record<string, StarSystem>;
  starSystemsLoaded: boolean;

  loadStarSystems: (userId: string) => Promise<void>;
  createStarSystem: (params: {
    userId: string;
    name: string;
    description: string;
    themeConfig: ThemeConfig;
  }) => Promise<StarSystem>;
  updateStarSystem: (id: string, updates: Partial<Pick<StarSystem, 'name' | 'description' | 'themeConfig' | 'sortOrder'>>) => Promise<void>;
  reorderStarSystems: (orderedIds: string[]) => Promise<void>;
  deleteStarSystem: (id: string) => Promise<void>;
}

export const createStarSystemSlice: StateCreator<AppState, [], [], StarSystemSlice> = (set, get) => ({
  starSystems: {},
  starSystemsLoaded: false,

  loadStarSystems: async (userId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('star_systems')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const systems: Record<string, StarSystem> = {};
    for (const row of data ?? []) {
      systems[row.id] = rowToStarSystem(row);
    }
    set({ starSystems: systems, starSystemsLoaded: true });
  },

  createStarSystem: async ({ userId, name, description, themeConfig }) => {
    const supabase = createClient();
    const id = createId();
    const timestamp = now();
    const sortOrder = Object.keys(get().starSystems).length;

    const system: StarSystem = {
      id,
      userId,
      name,
      description,
      iconStorageKey: null,
      themeConfig,
      sortOrder,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const { error } = await supabase.from('star_systems').insert({
      id: system.id,
      user_id: system.userId,
      name: system.name,
      description: system.description,
      icon_storage_key: system.iconStorageKey,
      theme_config: system.themeConfig,
      sort_order: system.sortOrder,
    });

    if (error) throw error;

    set((state) => ({
      starSystems: { ...state.starSystems, [id]: system },
    }));

    return system;
  },

  updateStarSystem: async (id, updates) => {
    const supabase = createClient();
    const existing = get().starSystems[id];
    if (!existing) return;

    const updated: StarSystem = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    const dbUpdates: Record<string, unknown> = { updated_at: updated.updatedAt };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.themeConfig !== undefined) dbUpdates.theme_config = updates.themeConfig;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    const { error } = await supabase.from('star_systems').update(dbUpdates).eq('id', id);
    if (error) throw error;

    set((state) => ({
      starSystems: { ...state.starSystems, [id]: updated },
    }));
  },

  reorderStarSystems: async (orderedIds) => {
    const supabase = createClient();
    const timestamp = now();
    const current = get().starSystems;

    const updated: Record<string, StarSystem> = { ...current };
    orderedIds.forEach((id, index) => {
      const existing = current[id];
      if (existing && existing.sortOrder !== index) {
        updated[id] = { ...existing, sortOrder: index, updatedAt: timestamp };
      }
    });

    set({ starSystems: updated });

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      if (current[id]?.sortOrder === i) continue;
      await supabase
        .from('star_systems')
        .update({ sort_order: i, updated_at: timestamp })
        .eq('id', id);
    }
  },

  deleteStarSystem: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('star_systems').delete().eq('id', id);
    if (error) throw error;

    set((state) => {
      const { [id]: _, ...rest } = state.starSystems;
      return { starSystems: rest };
    });
  },
});

function rowToStarSystem(row: Record<string, unknown>): StarSystem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string,
    iconStorageKey: row.icon_storage_key as string | null,
    themeConfig: row.theme_config as ThemeConfig,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
