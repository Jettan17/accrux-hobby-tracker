'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Plus } from 'lucide-react';
import type { StarSystem } from '@/types';

interface SidebarProps {
  starSystems: readonly StarSystem[];
  onCreateClick: () => void;
}

export function Sidebar({ starSystems, onCreateClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarLink href="/" active={pathname === '/'} icon={<Home className="h-4 w-4" />}>
          Dashboard
        </SidebarLink>
        <SidebarLink
          href="/achievements"
          active={pathname === '/achievements'}
          icon={<Trophy className="h-4 w-4" />}
        >
          Achievements
        </SidebarLink>

        <div className="pt-4 pb-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Star Systems
          </span>
        </div>

        {starSystems.map((system) => (
          <SidebarLink
            key={system.id}
            href={`/star-system/${system.id}`}
            active={pathname === `/star-system/${system.id}`}
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: system.themeConfig.palette.primary }}
            />
            {system.name}
          </SidebarLink>
        ))}

        <button
          onClick={onCreateClick}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Star System
        </button>
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
        ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'}
      `}
    >
      {icon}
      {children}
    </Link>
  );
}
