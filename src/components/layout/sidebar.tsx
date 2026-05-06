'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StarSystem } from '@/types';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  starSystems: readonly StarSystem[];
  onCreateClick: () => void;
}

export function Sidebar({ starSystems, onCreateClick }: SidebarProps) {
  const pathname = usePathname();
  const reorderStarSystems = useAppStore((s) => s.reorderStarSystems);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = starSystems.map((s) => s.id);
      const fromIdx = ids.indexOf(active.id as string);
      const toIdx = ids.indexOf(over.id as string);
      if (fromIdx === -1 || toIdx === -1) return;

      const next = arrayMove(ids, fromIdx, toIdx);
      reorderStarSystems(next);
    },
    [starSystems, reorderStarSystems],
  );

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
          dataTour="achievements"
        >
          Achievements
        </SidebarLink>

        <div className="pt-4 pb-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Star Systems
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={starSystems.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {starSystems.map((system) => (
              <SortableStarSystemRow
                key={system.id}
                system={system}
                active={pathname === `/star-system/${system.id}`}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          onClick={onCreateClick}
          data-tour="create-system"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Star System
        </button>
      </nav>
    </aside>
  );
}

function SortableStarSystemRow({
  system,
  active,
}: {
  system: StarSystem;
  active: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: system.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'opacity-60 z-10' : ''}`}
    >
      <Link
        href={`/star-system/${system.id}`}
        className={`
          flex items-center gap-2 rounded-lg pl-7 pr-3 py-2 text-sm transition-colors
          ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'}
        `}
      >
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: system.themeConfig.palette.primary }}
        />
        <span className="truncate">{system.name}</span>
      </Link>
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${system.name}`}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-300 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  children,
  dataTour,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  dataTour?: string;
}) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
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
