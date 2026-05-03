'use client';

import { useMemo } from 'react';
import type { ThemeConfig, NodeShapeVariant } from '@/types';

interface ThemePreviewProps {
  themeConfig: ThemeConfig;
}

function getClipPath(shape: NodeShapeVariant): string | undefined {
  switch (shape) {
    case 'hexagon':
      return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
    case 'irregular':
      return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
    default:
      return undefined;
  }
}

function getEdgeDashArray(edgeStyle: string): string | undefined {
  switch (edgeStyle) {
    case 'constellation': return '3 3';
    case 'rope': return '6 2 2 2';
    default: return undefined;
  }
}

function getEdgeWidth(edgeStyle: string): number {
  switch (edgeStyle) {
    case 'branch': return 3;
    case 'rope': return 2.5;
    default: return 1.5;
  }
}

export function ThemePreview({ themeConfig }: ThemePreviewProps) {
  const { palette, nodeShape, edgeStyle, background } = themeConfig;
  const clipPath = getClipPath(nodeShape);
  const borderRadius = nodeShape === 'circle' ? '50%' : undefined;

  const bgStyle = useMemo(() => {
    if (background.kind === 'solid') return { backgroundColor: background.color };
    if (background.kind === 'gradient') {
      return {
        background: `linear-gradient(${background.angle}deg, ${background.colors.join(', ')})`,
      };
    }
    return { backgroundColor: '#0f0f0f' };
  }, [background]);

  const nodes = [
    { x: 60, y: 20, size: 36, label: 'Done', completed: true },
    { x: 30, y: 75, size: 28, label: 'Ready', completed: false },
    { x: 100, y: 80, size: 22, label: 'Locked', completed: false, locked: true },
  ];

  const edges = [
    { x1: 60, y1: 38, x2: 38, y2: 68 },
    { x1: 60, y1: 38, x2: 100, y2: 72 },
  ];

  return (
    <div
      className="relative rounded-lg border border-zinc-700 overflow-hidden"
      style={{ ...bgStyle, height: 130 }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 130">
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={palette.secondary}
            strokeWidth={getEdgeWidth(edgeStyle)}
            strokeDasharray={getEdgeDashArray(edgeStyle)}
            strokeLinecap={edgeStyle === 'branch' ? 'round' : undefined}
            opacity={0.7}
          />
        ))}
      </svg>

      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
            transform: 'translate(-50%, -50%)',
            clipPath,
            borderRadius,
            backgroundColor: node.completed
              ? 'rgba(52, 211, 153, 0.15)'
              : node.locked
                ? 'rgba(82, 82, 91, 0.2)'
                : `${palette.primary}20`,
            border: `2px solid ${
              node.completed ? '#34d399' : node.locked ? '#52525b' : palette.primary
            }`,
            opacity: node.locked ? 0.5 : 1,
            boxShadow: node.completed
              ? '0 0 10px rgba(52,211,153,0.3)'
              : node.locked
                ? undefined
                : `0 0 10px ${palette.primary}20`,
          }}
        >
          <span
            className="text-[7px] font-medium"
            style={{ color: palette.text }}
          >
            {node.label}
          </span>
        </div>
      ))}

      <span className="absolute bottom-1.5 right-2 text-[9px] text-zinc-500">Preview</span>
    </div>
  );
}
