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

    const completedTodos = Object.values(todoItems).filter((t) => t.completed).length;
    const systemCount = Object.keys(starSystems).length;
    const fingerprint = `${systemCount}:${completedTodos}`;

    if (fingerprint === prevFingerprint.current) return;
    prevFingerprint.current = fingerprint;

    checkAndUnlockAchievements(userId);
  }, [todoItems, starSystems, achievementsLoaded, userId, checkAndUnlockAchievements]);
}
