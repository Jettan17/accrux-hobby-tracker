import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function useAchievementTrigger(userId: string) {
  const todoItems = useAppStore((s) => s.todoItems);
  const starSystems = useAppStore((s) => s.starSystems);
  const achievementsLoaded = useAppStore((s) => s.achievementsLoaded);
  const checkAndUnlockAchievements = useAppStore((s) => s.checkAndUnlockAchievements);

  const prevFingerprint = useRef('');

  useEffect(() => {
    if (!achievementsLoaded || !userId) return;

    const totalTodos = Object.values(todoItems).length;
    const completedTodos = Object.values(todoItems).filter((t) => t.completed).length;
    const systemCount = Object.keys(starSystems).length;
    const hasCustomImage = Object.values(starSystems).some(
      (s) => s.themeConfig.background.kind === 'image' && s.themeConfig.background.url.startsWith('data:'),
    );
    const fingerprint = `${systemCount}:${totalTodos}:${completedTodos}:${hasCustomImage}`;

    if (fingerprint === prevFingerprint.current) return;
    prevFingerprint.current = fingerprint;

    checkAndUnlockAchievements(userId);
  }, [todoItems, starSystems, achievementsLoaded, userId, checkAndUnlockAchievements]);
}
