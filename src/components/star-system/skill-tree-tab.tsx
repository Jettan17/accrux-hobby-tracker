'use client';

import { useAppStore } from '@/lib/store';
import { SkillTreeCanvas } from '@/components/skill-tree/skill-tree-canvas';

interface SkillTreeTabProps {
  starSystemId: string;
  loaded: boolean;
}

export function SkillTreeTab({ starSystemId, loaded }: SkillTreeTabProps) {
  const system = useAppStore((s) => s.starSystems[starSystemId]);

  if (!loaded) {
    return (
      <div className="p-4 lg:p-8">
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      </div>
    );
  }

  if (!system) return null;

  return (
    <div className="h-[calc(100vh-220px)] min-h-[400px]">
      <SkillTreeCanvas starSystemId={starSystemId} themeConfig={system.themeConfig} />
    </div>
  );
}
