'use client';

import { Trophy, Lock } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';

export function AchievementsGallery() {
  const userAchievements = useAppStore(useShallow((s) => s.userAchievements));
  const achievementsLoaded = useAppStore((s) => s.achievementsLoaded);

  const unlockedIds = new Set(
    Object.values(userAchievements).map((ua) => ua.achievementId),
  );

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  if (!achievementsLoaded) {
    return (
      <div className="p-4 lg:p-8">
        <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Achievements
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {unlockedCount} of {totalCount} unlocked
        </p>
        <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id);
          const userAchievement = unlocked
            ? Object.values(userAchievements).find((ua) => ua.achievementId === achievement.id)
            : null;

          return (
            <div
              key={achievement.id}
              className={`rounded-xl border p-4 transition-colors ${
                unlocked
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-zinc-800 bg-zinc-900/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    unlocked ? 'bg-amber-500/20' : 'bg-zinc-800'
                  }`}
                >
                  {unlocked ? (
                    <Trophy className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-zinc-400'}`}>
                    {achievement.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{achievement.description}</p>
                  {userAchievement && (
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
