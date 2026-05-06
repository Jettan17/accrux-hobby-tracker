import { create } from 'zustand';
import { createStarSystemSlice, type StarSystemSlice } from './star-systems';
import { createSkillNodeSlice, type SkillNodeSlice } from './skill-nodes';
import { createSkillEdgeSlice, type SkillEdgeSlice } from './skill-edges';
import { createTodoItemSlice, type TodoItemSlice } from './todo-items';
import { createAchievementSlice, type AchievementSlice } from './achievements';
import { createTutorialSlice, type TutorialSlice } from './tutorial';
import type { TodoItem } from '@/types';

export type AppState = StarSystemSlice & SkillNodeSlice & SkillEdgeSlice & TodoItemSlice & AchievementSlice & TutorialSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createStarSystemSlice(...args),
  ...createSkillNodeSlice(...args),
  ...createSkillEdgeSlice(...args),
  ...createTodoItemSlice(...args),
  ...createAchievementSlice(...args),
  ...createTutorialSlice(...args),
}));

// Selectors

export function selectStarSystemsList(state: AppState) {
  return Object.values(state.starSystems).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectTodosByStarSystem(state: AppState, starSystemId: string): TodoItem[] {
  return Object.values(state.todoItems)
    .filter((t) => t.starSystemId === starSystemId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectCompletionStats(state: AppState, starSystemId: string) {
  const todos = selectTodosByStarSystem(state, starSystemId);
  const completedTodos = todos.filter((t) => t.completed).length;

  return {
    totalTodos: todos.length,
    completedTodos,
    todoPercent: todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0,
  };
}
