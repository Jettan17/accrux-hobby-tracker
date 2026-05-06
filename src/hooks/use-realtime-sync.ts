'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import type { SkillNode, SkillEdge, TodoItem, StarSystem, UserAchievement, ThemeConfig, NodeVariant } from '@/types';

type PostgresChange = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

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

function rowToSkillEdge(row: Record<string, unknown>): SkillEdge {
  return {
    id: row.id as string,
    starSystemId: row.star_system_id as string,
    sourceNodeId: row.source_node_id as string,
    targetNodeId: row.target_node_id as string,
    createdAt: row.created_at as string,
  };
}

function rowToTodoItem(row: Record<string, unknown>): TodoItem {
  return {
    id: row.id as string,
    starSystemId: row.star_system_id as string,
    parentId: (row.parent_id as string) ?? null,
    title: row.title as string,
    completed: row.completed as boolean,
    locked: (row.locked as boolean) ?? false,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToUserAchievement(row: Record<string, unknown>): UserAchievement {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    achievementId: row.achievement_id as string,
    unlockedAt: row.unlocked_at as string,
  };
}

function isNewer(incoming: string | undefined, existing: string | undefined): boolean {
  if (!existing) return true;
  if (!incoming) return false;
  return new Date(incoming).getTime() > new Date(existing).getTime();
}

export function useRealtimeSync(userId: string) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'star_systems', filter: `user_id=eq.${userId}` },
        (payload: PostgresChange) => {
          const state = useAppStore.getState();
          switch (payload.eventType) {
            case 'INSERT': {
              const system = rowToStarSystem(payload.new);
              if (!state.starSystems[system.id]) {
                useAppStore.setState({ starSystems: { ...state.starSystems, [system.id]: system } });
              }
              break;
            }
            case 'UPDATE': {
              const system = rowToStarSystem(payload.new);
              const existing = state.starSystems[system.id];
              if (isNewer(system.updatedAt, existing?.updatedAt)) {
                useAppStore.setState({ starSystems: { ...state.starSystems, [system.id]: system } });
              }
              break;
            }
            case 'DELETE': {
              const id = payload.old.id as string;
              if (state.starSystems[id]) {
                const { [id]: _, ...rest } = state.starSystems;
                useAppStore.setState({ starSystems: rest });
              }
              break;
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skill_nodes' },
        (payload: PostgresChange) => {
          const state = useAppStore.getState();
          switch (payload.eventType) {
            case 'INSERT': {
              const node = rowToSkillNode(payload.new);
              if (!state.skillNodes[node.id]) {
                useAppStore.setState({ skillNodes: { ...state.skillNodes, [node.id]: node } });
              }
              break;
            }
            case 'UPDATE': {
              const node = rowToSkillNode(payload.new);
              const existing = state.skillNodes[node.id];
              if (isNewer(node.updatedAt, existing?.updatedAt)) {
                useAppStore.setState({ skillNodes: { ...state.skillNodes, [node.id]: node } });
              }
              break;
            }
            case 'DELETE': {
              const id = payload.old.id as string;
              if (state.skillNodes[id]) {
                const { [id]: _, ...rest } = state.skillNodes;
                useAppStore.setState({ skillNodes: rest });
              }
              break;
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skill_edges' },
        (payload: PostgresChange) => {
          const state = useAppStore.getState();
          switch (payload.eventType) {
            case 'INSERT': {
              const edge = rowToSkillEdge(payload.new);
              if (!state.skillEdges[edge.id]) {
                useAppStore.setState({ skillEdges: { ...state.skillEdges, [edge.id]: edge } });
              }
              break;
            }
            case 'DELETE': {
              const id = payload.old.id as string;
              if (state.skillEdges[id]) {
                const { [id]: _, ...rest } = state.skillEdges;
                useAppStore.setState({ skillEdges: rest });
              }
              break;
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todo_items' },
        (payload: PostgresChange) => {
          const state = useAppStore.getState();
          switch (payload.eventType) {
            case 'INSERT': {
              const item = rowToTodoItem(payload.new);
              if (!state.todoItems[item.id]) {
                useAppStore.setState({ todoItems: { ...state.todoItems, [item.id]: item } });
              }
              break;
            }
            case 'UPDATE': {
              const item = rowToTodoItem(payload.new);
              const existing = state.todoItems[item.id];
              if (isNewer(item.updatedAt, existing?.updatedAt)) {
                useAppStore.setState({ todoItems: { ...state.todoItems, [item.id]: item } });
              }
              break;
            }
            case 'DELETE': {
              const id = payload.old.id as string;
              if (state.todoItems[id]) {
                const { [id]: _, ...rest } = state.todoItems;
                useAppStore.setState({ todoItems: rest });
              }
              break;
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${userId}` },
        (payload: PostgresChange) => {
          const state = useAppStore.getState();
          switch (payload.eventType) {
            case 'INSERT': {
              const ua = rowToUserAchievement(payload.new);
              if (!state.userAchievements[ua.id]) {
                useAppStore.setState({
                  userAchievements: { ...state.userAchievements, [ua.id]: ua },
                });
              }
              break;
            }
            case 'DELETE': {
              const id = payload.old.id as string;
              if (state.userAchievements[id]) {
                const { [id]: _, ...rest } = state.userAchievements;
                useAppStore.setState({ userAchievements: rest });
              }
              break;
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
