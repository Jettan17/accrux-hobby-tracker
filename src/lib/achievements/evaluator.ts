import type { Achievement, AchievementCondition, TodoItem, StarSystem } from '@/types';
import { ACHIEVEMENTS } from './definitions';

interface EvaluationContext {
  starSystems: Record<string, StarSystem>;
  todoItems: Record<string, TodoItem>;
  unlockedAchievementIds: Set<string>;
}

function checkCondition(condition: AchievementCondition, ctx: EvaluationContext): boolean {
  switch (condition.kind) {
    case 'star-systems-created':
      return Object.keys(ctx.starSystems).length >= condition.threshold;

    case 'total-nodes-completed':
      return Object.values(ctx.todoItems).filter((t) => t.completed).length >= condition.threshold;

    case 'total-todos-completed':
      return Object.values(ctx.todoItems).filter((t) => t.completed).length >= condition.threshold;

    case 'star-system-all-nodes-completed': {
      const todosBySystem = new Map<string, TodoItem[]>();
      for (const todo of Object.values(ctx.todoItems)) {
        const list = todosBySystem.get(todo.starSystemId) ?? [];
        list.push(todo);
        todosBySystem.set(todo.starSystemId, list);
      }
      for (const [, todos] of todosBySystem) {
        if (todos.length > 0 && todos.every((t) => t.completed)) {
          return true;
        }
      }
      return false;
    }
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
