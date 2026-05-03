import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardContent } from '@/components/star-system/dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell userEmail={user?.email} userId={user?.id ?? ''}>
      <DashboardContent />
    </AppShell>
  );
}
