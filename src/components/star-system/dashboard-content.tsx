'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectStarSystemsList } from '@/lib/store';
import { StarCluster } from './star-cluster';
import { MeteorSuggestion } from './meteor-suggestion';

const GOLDEN_ANGLE = (137.50776405003785 * Math.PI) / 180;
const BASE_SPACING = 240;
const FIT_PADDING = 220;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;
const DRAG_THRESHOLD_PX = 6;
const ZOOM_BUTTON_FACTOR = 1.25;

interface Position {
  readonly x: number;
  readonly y: number;
}

interface ViewTransform {
  readonly panX: number;
  readonly panY: number;
  readonly zoom: number;
}

interface Bbox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

function computeNativeOffsets(count: number): readonly Position[] {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0 }];
  const list: Position[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const radius = Math.sqrt(i) * BASE_SPACING;
    list.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return list;
}

function computeBbox(offsets: readonly Position[]): Bbox {
  if (offsets.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of offsets) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

function computeFitView(bbox: Bbox, viewportW: number, viewportH: number): ViewTransform {
  const galaxyW = bbox.maxX - bbox.minX + FIT_PADDING * 2;
  const galaxyH = bbox.maxY - bbox.minY + FIT_PADDING * 2;
  const fitZoom = clamp(
    Math.min(viewportW / Math.max(galaxyW, 1), viewportH / Math.max(galaxyH, 1)),
    MIN_ZOOM,
    1,
  );
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  return {
    panX: viewportW / 2 - cx * fitZoom,
    panY: viewportH / 2 - cy * fitZoom,
    zoom: fitZoom,
  };
}

function suppressNextClick(): void {
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  document.addEventListener('click', handler, { once: true, capture: true });
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

interface PinchState {
  startDist: number;
  startView: ViewTransform;
  startMidX: number;
  startMidY: number;
}

export function DashboardContent() {
  const starSystems = useAppStore(useShallow(selectStarSystemsList));
  const loaded = useAppStore((s) => s.starSystemsLoaded);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<ViewTransform>({ panX: 0, panY: 0, zoom: 1 });

  const offsets = useMemo(() => computeNativeOffsets(starSystems.length), [starSystems.length]);
  const bbox = useMemo(() => computeBbox(offsets), [offsets]);

  // Track viewport size.
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

  // Initial / re-fit view when content or size changes (but only when fingerprint truly changes).
  const fitFingerprintRef = useRef('');
  useEffect(() => {
    if (size.w === 0 || size.h === 0 || starSystems.length === 0) return;
    const fp = `${size.w}x${size.h}:${starSystems.length}`;
    if (fp === fitFingerprintRef.current) return;
    fitFingerprintRef.current = fp;
    setView(computeFitView(bbox, size.w, size.h));
  }, [size.w, size.h, starSystems.length, bbox]);

  // Pointer + pinch handling.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const totalDragRef = useRef(0);

  const localCoords = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: clientX, y: clientY };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // Snapshot of view at gesture start, so pinch math doesn't drift through the gesture.
  const viewRef = useRef<ViewTransform>(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only start gesture tracking — no pointer capture (would re-target click events
    // away from the cluster's <Link> / menu button on some browsers).
    const local = localCoords(e.clientX, e.clientY);
    pointersRef.current.set(e.pointerId, local);
    totalDragRef.current = 0;

    if (pointersRef.current.size === 1) {
      lastPointerRef.current = local;
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        startView: viewRef.current,
        startMidX: (a.x + b.x) / 2,
        startMidY: (a.y + b.y) / 2,
      };
      lastPointerRef.current = null;
    }
  }, [localCoords]);

  // Window-level pointer listeners so a drag continues if the pointer leaves the
  // container, without setPointerCapture interfering with click-event delivery.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!pointersRef.current.has(e.pointerId)) return;
      const local = localCoords(e.clientX, e.clientY);
      pointersRef.current.set(e.pointerId, local);

      if (pointersRef.current.size === 2 && pinchRef.current) {
        const [a, b] = [...pointersRef.current.values()];
        const newDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const newMidX = (a.x + b.x) / 2;
        const newMidY = (a.y + b.y) / 2;

        const start = pinchRef.current;
        const factor = newDist / start.startDist;
        const newZoom = clamp(start.startView.zoom * factor, MIN_ZOOM, MAX_ZOOM);
        const worldX = (start.startMidX - start.startView.panX) / start.startView.zoom;
        const worldY = (start.startMidY - start.startView.panY) / start.startView.zoom;
        const newPanX = newMidX - worldX * newZoom;
        const newPanY = newMidY - worldY * newZoom;
        totalDragRef.current += Math.abs(newMidX - start.startMidX) + Math.abs(newMidY - start.startMidY);
        setView({ panX: newPanX, panY: newPanY, zoom: newZoom });
        return;
      }

      if (pointersRef.current.size === 1 && lastPointerRef.current) {
        const dx = local.x - lastPointerRef.current.x;
        const dy = local.y - lastPointerRef.current.y;
        lastPointerRef.current = local;
        totalDragRef.current += Math.hypot(dx, dy);
        setView((v) => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }));
      }
    }

    function onEnd(e: PointerEvent) {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
      if (pointersRef.current.size === 0) {
        lastPointerRef.current = null;
        if (totalDragRef.current > DRAG_THRESHOLD_PX) suppressNextClick();
        totalDragRef.current = 0;
      } else if (pointersRef.current.size === 1) {
        const remaining = [...pointersRef.current.values()][0];
        lastPointerRef.current = remaining;
      }
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [localCoords]);

  const zoomAroundPoint = useCallback((cx: number, cy: number, factor: number) => {
    setView((v) => {
      const newZoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const actual = newZoom / v.zoom;
      return {
        panX: cx - (cx - v.panX) * actual,
        panY: cy - (cy - v.panY) * actual,
        zoom: newZoom,
      };
    });
  }, []);

  // Wheel zoom on a non-passive listener so we can preventDefault.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const local = localCoords(e.clientX, e.clientY);
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomAroundPoint(local.x, local.y, factor);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [localCoords, zoomAroundPoint]);

  const handleResetView = useCallback(() => {
    if (size.w === 0 || size.h === 0 || starSystems.length === 0) return;
    setView(computeFitView(bbox, size.w, size.h));
  }, [bbox, size.w, size.h, starSystems.length]);

  const handleZoomIn = useCallback(() => {
    zoomAroundPoint(size.w / 2, size.h / 2, ZOOM_BUTTON_FACTOR);
  }, [zoomAroundPoint, size.w, size.h]);

  const handleZoomOut = useCallback(() => {
    zoomAroundPoint(size.w / 2, size.h / 2, 1 / ZOOM_BUTTON_FACTOR);
  }, [zoomAroundPoint, size.w, size.h]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse at center, #1a1130 0%, #0a0a14 55%, #050508 100%)',
        touchAction: 'none',
        cursor: 'grab',
      }}
      onPointerDown={handlePointerDown}
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
          <p className="text-xs text-zinc-500 max-w-sm mt-3">
            New here? Click the <span className="text-zinc-300">?</span> in the top-right for a quick tour.
          </p>
        </div>
      )}

      {/* World layer: clusters live in galaxy-space and get transformed together. */}
      {loaded && starSystems.length > 0 && (
        <div
          className="absolute top-0 left-0 will-change-transform"
          style={{
            transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {starSystems.map((system, i) => {
            const off = offsets[i];
            if (!off) return null;
            return (
              <StarCluster
                key={system.id}
                system={system}
                x={off.x}
                y={off.y}
              />
            );
          })}
        </div>
      )}

      {loaded && starSystems.length > 0 && <MeteorSuggestion />}

      {/* Zoom controls */}
      {loaded && starSystems.length > 0 && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetView}
            aria-label="Reset view"
            title="Reset view"
            className="rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
