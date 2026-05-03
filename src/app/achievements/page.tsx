import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { AchievementsGallery } from '@/components/achievements/achievements-gallery';

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell userEmail={user?.email} userId={user?.id ?? ''}>
      <AchievementsGallery />
    </AppShell>
  );
}
