'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function AchievementToast() {
  const pendingToasts = useAppStore((s) => s.pendingToasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const [visible, setVisible] = useState(false);

  const currentToast = pendingToasts[0] ?? null;

  useEffect(() => {
    if (!currentToast) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissToast, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentToast, dismissToast]);

  if (!currentToast) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-zinc-900 p-4 shadow-2xl shadow-amber-500/10">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
            Achievement Unlocked
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">{currentToast.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{currentToast.description}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(dismissToast, 300);
          }}
          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
