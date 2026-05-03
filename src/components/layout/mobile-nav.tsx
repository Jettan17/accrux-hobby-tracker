'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Plus } from 'lucide-react';

interface MobileNavProps {
  onCreateClick: () => void;
}

export function MobileNav({ onCreateClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around py-2">
        <NavItem href="/" active={pathname === '/'} icon={<Home className="h-5 w-5" />} label="Home" />
        <button
          onClick={onCreateClick}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400 active:text-white cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <Plus className="h-5 w-5 text-black" />
          </div>
          <span className="text-[10px]">New</span>
        </button>
        <NavItem
          href="/achievements"
          active={pathname === '/achievements'}
          icon={<Trophy className="h-5 w-5" />}
          label="Awards"
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
        active ? 'text-white' : 'text-zinc-500'
      }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
