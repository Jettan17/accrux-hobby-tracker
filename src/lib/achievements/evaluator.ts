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
