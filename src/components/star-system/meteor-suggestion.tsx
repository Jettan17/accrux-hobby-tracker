'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import type { TodoItem, StarSystem } from '@/types';

interface ActiveMeteor {
  readonly spawnId: number;
  readonly todo: TodoItem;
  readonly system: StarSystem;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly angleDeg: number;
  readonly duration: number;
}

const FIRST_SPAWN_DELAY_MS = 6_000;
const SPAWN_INTERVAL_MS = 120_000;
const ANIM_DURATION_S = 75;

function pickSuggestion(): { todo: TodoItem; system: StarSystem } | null {
  const state = useAppStore.getState();
  const incomplete = Object.values(state.todoItems).filter((t) => !t.completed);
  if (incomplete.length === 0) return null;
  const todo = incomplete[Math.floor(Math.random() * incomplete.length)];
  if (!todo) return null;
  const system = state.starSystems[todo.starSystemId];
  if (!system) return null;
  return { todo, system };
}

function buildMeteor(): ActiveMeteor | null {
  const pick = pickSuggestion();
  if (!pick) return null;

  const leftToRight = Math.random() < 0.5;
  const startVertical = Math.random() * 30;
  const fromX = leftToRight ? -25 : 115;
  const fromY = startVertical;
  const travelX = leftToRight ? 140 : -140;
  const travelY = 80 + Math.random() * 30;
  const toX = fromX + travelX;
  const toY = fromY + travelY;

  // Compute screen-space direction (vw/vh aren't pixel-equivalent, so convert).
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 720 : window.innerHeight;
  const dxPx = ((toX - fromX) * vw) / 100;
  const dyPx = ((toY - fromY) * vh) / 100;
  const angleDeg = (Math.atan2(dyPx, dxPx) * 180) / Math.PI;

  return {
    spawnId: Date.now() + Math.floor(Math.random() * 1000),
    todo: pick.todo,
    system: pick.system,
    fromX,
    fromY,
    toX,
    toY,
    angleDeg,
    duration: ANIM_DURATION_S,
  };
}

export function MeteorSuggestion() {
  const todoItems = useAppStore((s) => s.todoItems);
  const hasIncomplete = Object.values(todoItems).some((t) => !t.completed);

  const [meteor, setMeteor] = useState<ActiveMeteor | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasIncomplete) {
      setMeteor(null);
      return;
    }

    function spawn() {
      const next = buildMeteor();
      if (!next) return;
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setMeteor(next);
      clearTimerRef.current = setTimeout(() => {
        setMeteor(null);
        clearTimerRef.current = null;
      }, next.duration * 1000);
    }

    const initial = setTimeout(spawn, FIRST_SPAWN_DELAY_MS);
    const interval = setInterval(spawn, SPAWN_INTERVAL_MS);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [hasIncomplete]);

  if (!meteor) return null;

  return (
    <Link
      key={meteor.spawnId}
      href={`/star-system/${meteor.system.id}`}
      className="absolute top-0 left-0 z-30 group pointer-events-auto"
      style={{
        width: 0,
        height: 0,
        animation: `meteor-streak ${meteor.duration}s linear forwards`,
        ['--from-x' as string]: `${meteor.fromX}vw`,
        ['--from-y' as string]: `${meteor.fromY}vh`,
        ['--to-x' as string]: `${meteor.toX}vw`,
        ['--to-y' as string]: `${meteor.toY}vh`,
      }}
    >
      {/* trail: extends from the head opposite to motion direction */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -1,
          left: -110,
          width: 110,
          height: 2,
          background:
            'linear-gradient(to right, transparent, rgba(252,211,77,0.55), rgba(255,255,255,0.95))',
          boxShadow: '0 0 8px rgba(252,211,77,0.7)',
          transformOrigin: 'right center',
          transform: `rotate(${meteor.angleDeg}deg)`,
          borderRadius: 2,
        }}
      />

      {/* head: bright tip at (0,0) */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -6,
          left: -6,
          width: 12,
          height: 12,
          borderRadius: '9999px',
          backgroundColor: 'white',
          boxShadow:
            '0 0 12px rgba(255,255,255,0.95), 0 0 28px rgba(252,211,77,0.85), 0 0 50px rgba(252,211,77,0.5)',
        }}
      />

      {/* suggestion chip: offset below the head, never rotated so it stays readable */}
      <div
        className="absolute px-3 py-1.5 rounded-lg bg-zinc-950/85 border border-amber-500/40 text-xs text-zinc-100 backdrop-blur-sm whitespace-nowrap max-w-[280px] truncate group-hover:border-amber-300 group-hover:bg-zinc-900/95 transition-colors"
        style={{
          top: 18,
          left: 14,
        }}
      >
        <span className="text-amber-300 font-semibold">Try: </span>
        {meteor.todo.title}
        <span className="text-zinc-500 ml-2">&middot; {meteor.system.name}</span>
      </div>
    </Link>
  );
}
