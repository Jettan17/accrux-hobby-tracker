import type { StateCreator } from 'zustand';
import type { UserAchievement, Achievement } from '@/types';
import type { AppState } from './index';
import { createId } from '@/lib/utils/ids';
import { now } from '@/lib/utils/timestamps';
import { createClient } from '@/lib/supabase/client';
import { evaluateAchievements } from '@/lib/achievements/evaluator';

export interface AchievementSlice {
  userAchievements: Record<string, UserAchievement>;
  achievementsLoaded: boolean;
  pendingToasts: Achievement[];

  loadUserAchievements: (userId: string) => Promise<void>;
  checkAndUnlockAchievements: (userId: string) => Promise<void>;
  dismissToast: () => void;
}

export const createAchievementSlice: StateCreator<AppState, [], [], AchievementSlice> = (set, get) => ({
  userAchievements: {},
  achievementsLoaded: false,
  pendingToasts: [],

  loadUserAchievements: async (userId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const achievements: Record<string, UserAchievement> = {};
    for (const row of data ?? []) {
      achievements[row.id] = {
        id: row.id as string,
        userId: row.user_id as string,
        achievementId: row.achievement_id as string,
        unlockedAt: row.unlocked_at as string,
      };
    }
    set({ userAchievements: achievements, achievementsLoaded: true });
  },

  checkAndUnlockAchievements: async (userId) => {
    const state = get();
    const unlockedIds = new Set(
      Object.values(state.userAchievements).map((ua) => ua.achievementId),
    );

    const newlyUnlocked = evaluateAchievements({
      starSystems: state.starSystems,
      todoItems: state.todoItems,
      unlockedAchievementIds: unlockedIds,
    });

    if (newlyUnlocked.length === 0) return;

    const supabase = createClient();
    const newRecords: Record<string, UserAchievement> = {};
    const rows: Array<{ id: string; user_id: string; achievement_id: string }> = [];

    for (const achievement of newlyUnlocked) {
      const id = createId();
      newRecords[id] = {
        id,
        userId: userId,
        achievementId: achievement.id,
        unlockedAt: now(),
      };
      rows.push({ id, user_id: userId, achievement_id: achievement.id });
    }

    const { error } = await supabase.from('user_achievements').insert(rows);
    if (error) throw error;

    set((s) => ({
      userAchievements: { ...s.userAchievements, ...newRecords },
      pendingToasts: [...s.pendingToasts, ...newlyUnlocked],
    }));
  },

  dismissToast: () => {
    set((s) => ({
      pendingToasts: s.pendingToasts.slice(1),
    }));
  },
});
