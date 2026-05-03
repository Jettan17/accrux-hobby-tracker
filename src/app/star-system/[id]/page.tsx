import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { StarSystemDetail } from '@/components/star-system/star-system-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StarSystemPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell userEmail={user?.email} userId={user?.id ?? ''}>
      <StarSystemDetail starSystemId={id} />
    </AppShell>
  );
}
