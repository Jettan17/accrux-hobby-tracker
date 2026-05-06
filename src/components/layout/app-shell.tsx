'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { CreateStarSystemDialog } from '@/components/star-system/create-star-system-dialog';
import { AchievementToast } from '@/components/achievements/achievement-toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ToastProvider } from '@/components/ui/toast';
import { TutorialTour } from '@/components/onboarding/tutorial-tour';
import { useAppStore } from '@/lib/store';
import { useAchievementTrigger } from '@/hooks/use-achievement-trigger';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';

interface AppShellProps {
  userEmail?: string;
  userId: string;
  children: React.ReactNode;
}

export function AppShell({ userEmail, userId, children }: AppShellProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const starSystemsMap = useAppStore((s) => s.starSystems);
  const starSystems = useMemo(
    () => Object.values(starSystemsMap).sort((a, b) => a.sortOrder - b.sortOrder),
    [starSystemsMap],
  );
  const loadStarSystems = useAppStore((s) => s.loadStarSystems);
  const starSystemsLoaded = useAppStore((s) => s.starSystemsLoaded);
  const loadUserAchievements = useAppStore((s) => s.loadUserAchievements);
  const achievementsLoaded = useAppStore((s) => s.achievementsLoaded);

  useEffect(() => {
    if (!starSystemsLoaded) {
      loadStarSystems(userId);
    }
  }, [userId, starSystemsLoaded, loadStarSystems]);

  useEffect(() => {
    if (!achievementsLoaded) {
      loadUserAchievements(userId);
    }
  }, [userId, achievementsLoaded, loadUserAchievements]);

  useAchievementTrigger(userId);
  useRealtimeSync(userId);

  return (
    <ToastProvider>
      <div className="flex h-screen flex-col">
        <Header userEmail={userEmail} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            starSystems={starSystems}
            onCreateClick={() => setShowCreateDialog(true)}
          />

          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        <MobileNav onCreateClick={() => setShowCreateDialog(true)} />

        <CreateStarSystemDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          userId={userId}
        />

        <AchievementToast />
        <TutorialTour />
      </div>
    </ToastProvider>
  );
}
