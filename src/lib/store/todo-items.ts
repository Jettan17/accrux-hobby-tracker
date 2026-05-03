import type { StateCreator } from 'zustand';
import type { TodoItem } from '@/types';
import type { AppState } from './index';
import { createId } from '@/lib/utils/ids';
import { now } from '@/lib/utils/timestamps';
import { createClient } from '@/lib/supabase/client';

export interface TodoItemSlice {
  todoItems: Record<string, TodoItem>;

  loadTodoItems: (starSystemId: string) => Promise<void>;
  createTodoItem: (params: {
    starSystemId: string;
    title: string;
    parentId?: string | null;
  }) => Promise<TodoItem>;
  updateTodoItem: (id: string, updates: Partial<Pick<TodoItem, 'title' | 'completed' | 'sortOrder' | 'parentId'>>) => Promise<void>;
  reorderTodoItems: (starSystemId: string, orderedIds: string[]) => Promise<void>;
  moveTodoItem: (id: string, newParentId: string | null, insertIndex: number) => Promise<void>;
  indentTodoItem: (id: string) => Promise<void>;
  outdentTodoItem: (id: string) => Promise<void>;
  deleteTodoItem: (id: string) => Promise<void>;
}

export const createTodoItemSlice: StateCreator<AppState, [], [], TodoItemSlice> = (set, get) => ({
  todoItems: {},

  loadTodoItems: async (starSystemId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('star_system_id', starSystemId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const items: Record<string, TodoItem> = { ...get().todoItems };
    for (const row of data ?? []) {
      items[row.id as string] = rowToTodoItem(row);
    }
    set({ todoItems: items });
  },

  createTodoItem: async ({ starSystemId, title, parentId = null }) => {
    const supabase = createClient();
    const id = createId();
    const timestamp = now();

    const siblings = Object.values(get().todoItems).filter(
      (t) => t.starSystemId === starSystemId && t.parentId === parentId,
    );
    const sortOrder = siblings.length;

    const item: TodoItem = {
      id,
      starSystemId,
      parentId,
      title,
      completed: false,
      sortOrder,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const { error } = await supabase.from('todo_items').insert({
      id: item.id,
      star_system_id: item.starSystemId,
      parent_id: item.parentId,
      title: item.title,
      completed: item.completed,
      sort_order: item.sortOrder,
    });

    if (error) throw error;

    set((state) => ({
      todoItems: { ...state.todoItems, [id]: item },
    }));

    return item;
  },

  updateTodoItem: async (id, updates) => {
    const supabase = createClient();
    const existing = get().todoItems[id];
    if (!existing) return;

    const updated: TodoItem = { ...existing, ...updates, updatedAt: now() };

    const dbUpdates: Record<string, unknown> = { updated_at: updated.updatedAt };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;

    const { error } = await supabase.from('todo_items').update(dbUpdates).eq('id', id);
    if (error) throw error;

    set((state) => ({
      todoItems: { ...state.todoItems, [id]: updated },
    }));

    if (updates.completed === true) {
      let currentParentId = updated.parentId;
      while (currentParentId) {
        const state = get();
        const parent = state.todoItems[currentParentId];
        if (!parent || parent.completed) break;

        const children = Object.values(state.todoItems).filter(
          (t) => t.parentId === currentParentId,
        );
        if (children.length === 0 || !children.every((t) => t.completed)) break;

        const parentUpdated: TodoItem = { ...parent, completed: true, updatedAt: now() };
        await supabase.from('todo_items').update({ completed: true, updated_at: parentUpdated.updatedAt }).eq('id', parent.id);
        set((s) => ({
          todoItems: { ...s.todoItems, [parent.id]: parentUpdated },
        }));

        currentParentId = parent.parentId;
      }
    }
  },

  reorderTodoItems: async (starSystemId, orderedIds) => {
    const supabase = createClient();
    const timestamp = now();
    const currentItems = get().todoItems;
    const updatedItems = { ...currentItems };

    orderedIds.forEach((id, index) => {
      const existing = currentItems[id];
      if (existing && existing.starSystemId === starSystemId) {
        updatedItems[id] = { ...existing, sortOrder: index, updatedAt: timestamp };
      }
    });

    set({ todoItems: updatedItems });

    for (let i = 0; i < orderedIds.length; i++) {
      await supabase
        .from('todo_items')
        .update({ sort_order: i, updated_at: timestamp })
        .eq('id', orderedIds[i]);
    }
  },

  moveTodoItem: async (id, newParentId, insertIndex) => {
    const supabase = createClient();
    const state = get();
    const item = state.todoItems[id];
    if (!item) return;

    const timestamp = now();
    const updatedItems = { ...state.todoItems };

    const newSiblings = Object.values(state.todoItems)
      .filter((t) => t.starSystemId === item.starSystemId && t.parentId === newParentId && t.id !== id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    newSiblings.splice(insertIndex, 0, item);

    for (let i = 0; i < newSiblings.length; i++) {
      const sib = newSiblings[i];
      const newOrder = i;
      const newParent = sib.id === id ? newParentId : sib.parentId;
      if (sib.sortOrder !== newOrder || sib.parentId !== newParent) {
        updatedItems[sib.id] = { ...sib, sortOrder: newOrder, parentId: newParent, updatedAt: timestamp };
      }
    }

    set({ todoItems: updatedItems });

    for (let i = 0; i < newSiblings.length; i++) {
      const sib = newSiblings[i];
      if (sib.id === id) {
        await supabase.from('todo_items').update({ parent_id: newParentId, sort_order: i, updated_at: timestamp }).eq('id', id);
      } else if (updatedItems[sib.id].sortOrder !== sib.sortOrder) {
        await supabase.from('todo_items').update({ sort_order: i, updated_at: timestamp }).eq('id', sib.id);
      }
    }
  },

  indentTodoItem: async (id) => {
    const state = get();
    const item = state.todoItems[id];
    if (!item) return;

    const siblings = Object.values(state.todoItems)
      .filter((t) => t.starSystemId === item.starSystemId && t.parentId === item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const myIndex = siblings.findIndex((t) => t.id === id);
    if (myIndex <= 0) return;

    const newParentId = siblings[myIndex - 1].id;
    const newSiblings = Object.values(state.todoItems).filter(
      (t) => t.starSystemId === item.starSystemId && t.parentId === newParentId,
    );
    const sortOrder = newSiblings.length;

    const updates = { parentId: newParentId, sortOrder };
    const updated: TodoItem = { ...item, ...updates, updatedAt: now() };

    const supabase = createClient();
    const { error } = await supabase
      .from('todo_items')
      .update({ parent_id: newParentId, sort_order: sortOrder, updated_at: updated.updatedAt })
      .eq('id', id);
    if (error) throw error;

    set((state) => ({
      todoItems: { ...state.todoItems, [id]: updated },
    }));
  },

  outdentTodoItem: async (id) => {
    const state = get();
    const item = state.todoItems[id];
    if (!item || !item.parentId) return;

    const parent = state.todoItems[item.parentId];
    if (!parent) return;

    const newParentId = parent.parentId;
    const newSiblings = Object.values(state.todoItems)
      .filter((t) => t.starSystemId === item.starSystemId && t.parentId === newParentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const parentIndex = newSiblings.findIndex((t) => t.id === parent.id);
    const sortOrder = parentIndex + 1;

    // Shift siblings after insertion point
    const timestamp = now();
    const updatedItems = { ...state.todoItems };
    for (const sibling of newSiblings) {
      if (sibling.sortOrder >= sortOrder && sibling.id !== id) {
        updatedItems[sibling.id] = { ...sibling, sortOrder: sibling.sortOrder + 1, updatedAt: timestamp };
      }
    }

    const updated: TodoItem = { ...item, parentId: newParentId, sortOrder, updatedAt: timestamp };
    updatedItems[id] = updated;

    set({ todoItems: updatedItems });

    const supabase = createClient();
    await supabase
      .from('todo_items')
      .update({ parent_id: newParentId, sort_order: sortOrder, updated_at: timestamp })
      .eq('id', id);

    for (const sibling of newSiblings) {
      if (sibling.sortOrder >= sortOrder && sibling.id !== id) {
        await supabase
          .from('todo_items')
          .update({ sort_order: sibling.sortOrder + 1, updated_at: timestamp })
          .eq('id', sibling.id);
      }
    }
  },

  deleteTodoItem: async (id) => {
    const supabase = createClient();
    const state = get();

    // Collect all descendants recursively
    const toDelete = new Set<string>();
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.pop()!;
      toDelete.add(current);
      for (const item of Object.values(state.todoItems)) {
        if (item.parentId === current && !toDelete.has(item.id)) {
          queue.push(item.id);
        }
      }
    }

    for (const deleteId of toDelete) {
      await supabase.from('todo_items').delete().eq('id', deleteId);
    }

    set((state) => {
      const remaining = { ...state.todoItems };
      for (const deleteId of toDelete) {
        delete remaining[deleteId];
      }
      return { todoItems: remaining };
    });
  },
});

function rowToTodoItem(row: Record<string, unknown>): TodoItem {
  return {
    id: row.id as string,
    starSystemId: row.star_system_id as string,
    parentId: (row.parent_id as string) ?? null,
    title: row.title as string,
    completed: row.completed as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
