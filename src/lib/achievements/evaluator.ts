import type { Achievement, AchievementCondition, TodoItem, StarSystem } from '@/types';
import { ACHIEVEMENTS } from './definitions';

interface EvaluationContext {
  starSystems: Record<string, StarSystem>;
  todoItems: Record<string, TodoItem>;
  unlockedAchievementIds: Set<string>;
  hasExported: boolean;
}

function maxNestingDepth(todos: TodoItem[]): number {
  const byId = new Map(todos.map((t) => [t.id, t]));
  const memo = new Map<string, number>();

  const depthOf = (id: string): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    const todo = byId.get(id);
    if (!todo || todo.parentId === null) {
      memo.set(id, 0);
      return 0;
    }
    const d = depthOf(todo.parentId) + 1;
    memo.set(id, d);
    return d;
  };

  let max = 0;
  for (const todo of todos) {
    const d = depthOf(todo.id);
    if (d > max) max = d;
  }
  return max;
}

function maxCompletedInWindow(todos: TodoItem[], windowMs: number): number {
  const completedTimes = todos
    .filter((t) => t.completed)
    .map((t) => Date.parse(t.updatedAt))
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);

  if (completedTimes.length === 0) return 0;

  let max = 0;
  let left = 0;
  for (let right = 0; right < completedTimes.length; right++) {
    while (completedTimes[right] - completedTimes[left] > windowMs) left++;
    const count = right - left + 1;
    if (count > max) max = count;
  }
  return max;
}

function checkCondition(condition: AchievementCondition, ctx: EvaluationContext): boolean {
  switch (condition.kind) {
    case 'star-systems-created':
      return Object.keys(ctx.starSystems).length >= condition.threshold;

    case 'total-todos-completed':
      return Object.values(ctx.todoItems).filter((t) => t.completed).length >= condition.threshold;

    case 'star-systems-fully-completed': {
      const todosBySystem = new Map<string, TodoItem[]>();
      for (const todo of Object.values(ctx.todoItems)) {
        const list = todosBySystem.get(todo.starSystemId) ?? [];
        list.push(todo);
        todosBySystem.set(todo.starSystemId, list);
      }
      let fullyCompleted = 0;
      for (const todos of todosBySystem.values()) {
        if (todos.length > 0 && todos.every((t) => t.completed)) fullyCompleted++;
      }
      return fullyCompleted >= condition.threshold;
    }

    case 'todos-in-window':
      return maxCompletedInWindow(Object.values(ctx.todoItems), condition.windowMs) >= condition.threshold;

    case 'todo-nesting-depth':
      return maxNestingDepth(Object.values(ctx.todoItems)) >= condition.threshold;

    case 'todos-in-single-system': {
      const counts = new Map<string, number>();
      for (const todo of Object.values(ctx.todoItems)) {
        counts.set(todo.starSystemId, (counts.get(todo.starSystemId) ?? 0) + 1);
      }
      for (const count of counts.values()) {
        if (count >= condition.threshold) return true;
      }
      return false;
    }

    case 'systems-with-completed-todos': {
      const counts = new Map<string, number>();
      for (const todo of Object.values(ctx.todoItems)) {
        if (!todo.completed) continue;
        counts.set(todo.starSystemId, (counts.get(todo.starSystemId) ?? 0) + 1);
      }
      let qualifying = 0;
      for (const count of counts.values()) {
        if (count >= condition.completedThreshold) qualifying++;
      }
      return qualifying >= condition.minSystems;
    }

    case 'distinct-theme-colors': {
      const colors = new Set<string>();
      for (const system of Object.values(ctx.starSystems)) {
        colors.add(system.themeConfig.palette.primary.toLowerCase());
      }
      return colors.size >= condition.threshold;
    }

    case 'has-exported':
      return ctx.hasExported;

    case 'has-custom-image':
      for (const system of Object.values(ctx.starSystems)) {
        const bg = system.themeConfig.background;
        if (bg.kind === 'image' && bg.url.startsWith('data:')) return true;
      }
      return false;
  }
}

export function evaluateAchievements(ctx: EvaluationContext): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (ctx.unlockedAchievementIds.has(achievement.id)) continue;
    if (checkCondition(achievement.condition, ctx)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
