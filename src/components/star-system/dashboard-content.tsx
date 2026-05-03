'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { StarSystemCard } from './star-system-card';

export function DashboardContent() {
  const starSystemsMap = useAppStore((s) => s.starSystems);
  const starSystems = useMemo(
    () => Object.values(starSystemsMap).sort((a, b) => a.sortOrder - b.sortOrder),
    [starSystemsMap],
  );
  const loaded = useAppStore((s) => s.starSystemsLoaded);

  if (!loaded) {
    return (
      <div className="p-4 lg:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      {starSystems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <span className="text-2xl">&#10024;</span>
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No star systems yet</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Create your first star system to start building skill trees for your hobbies.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {starSystems.map((system) => (
            <StarSystemCard key={system.id} system={system} />
          ))}
        </div>
      )}
    </div>
  );
}
