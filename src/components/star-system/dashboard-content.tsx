'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectStarSystemsList } from '@/lib/store';
import { StarCluster } from './star-cluster';
import { MeteorSuggestion } from './meteor-suggestion';

const GOLDEN_ANGLE = (137.50776405003785 * Math.PI) / 180;
const EDGE_MARGIN = 140;
const MIN_FIT_SCALE = 0.55;

interface Position {
  readonly x: number;
  readonly y: number;
}

interface LayoutResult {
  readonly positions: readonly Position[];
  readonly scale: number;
}

function computeGalaxyLayout(count: number, w: number, h: number): LayoutResult {
  if (count === 0 || w === 0 || h === 0) return { positions: [], scale: 1 };
  const cx = w / 2;
  const cy = h / 2;
  if (count === 1) return { positions: [{ x: cx, y: cy }], scale: 1 };

  const minDim = Math.min(w, h);
  const baseSpacing = Math.max(240, minDim * 0.24);

  const offsets: Position[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const radius = Math.sqrt(i) * baseSpacing;
    offsets.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }

  const maxX = Math.max(...offsets.map((p) => Math.abs(p.x)));
  const maxY = Math.max(...offsets.map((p) => Math.abs(p.y)));
  const halfW = Math.max(1, w / 2 - EDGE_MARGIN);
  const halfH = Math.max(1, h / 2 - EDGE_MARGIN);
  const fitScale = Math.max(
    MIN_FIT_SCALE,
    Math.min(1, halfW / (maxX || 1), halfH / (maxY || 1)),
  );

  return {
    positions: offsets.map((p) => ({ x: cx + p.x * fitScale, y: cy + p.y * fitScale })),
    scale: fitScale,
  };
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BackdropStar {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly o: number;
  readonly twinkleDelay: number;
  readonly twinkleDuration: number;
}

function StarsBackdrop() {
  const stars = useMemo<readonly BackdropStar[]>(() => {
    const rng = mulberry32(7);
    return Array.from({ length: 110 }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      r: rng() * 1.3 + 0.3,
      o: rng() * 0.6 + 0.2,
      twinkleDelay: rng() * 6,
      twinkleDuration: 3 + rng() * 4,
    }));
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          style={{
            opacity: s.o,
            animation: `star-twinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite`,
          }}
        />
      ))}
    </svg>
  );
}

export function DashboardContent() {
  const starSystems = useAppStore(useShallow(selectStarSystemsList));
  const loaded = useAppStore((s) => s.starSystemsLoaded);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(
    () => computeGalaxyLayout(starSystems.length, size.w, size.h),
    [starSystems.length, size.w, size.h],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #1a1130 0%, #0a0a14 55%, #050508 100%)',
      }}
    >
      <StarsBackdrop />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
          Charting your galaxy&hellip;
        </div>
      )}

      {loaded && starSystems.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="h-16 w-16 rounded-full bg-zinc-800/70 flex items-center justify-center mb-4 backdrop-blur-sm">
            <span className="text-2xl">&#10024;</span>
          </div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">Your galaxy is empty</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            Create your first star system to start charting your hobbies.
          </p>
        </div>
      )}

      {loaded &&
        starSystems.map((system, i) => {
          const pos = layout.positions[i];
          if (!pos) return null;
          return (
            <StarCluster
              key={system.id}
              system={system}
              x={pos.x}
              y={pos.y}
              scale={layout.scale}
            />
          );
        })}

      {loaded && starSystems.length > 0 && <MeteorSuggestion />}
    </div>
  );
}
