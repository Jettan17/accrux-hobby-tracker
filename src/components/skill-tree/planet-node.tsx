'use client';

import { memo } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeVariant, NodeStatus, ColorPalette } from '@/types';

export type PlanetNodeData = {
  label: string;
  description: string;
  variant: NodeVariant;
  status: NodeStatus;
  palette: ColorPalette;
  isMobile: boolean;
  onToggleComplete: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
};

export type PlanetNodeType = Node<PlanetNodeData, 'planet'>;

const VARIANT_SIZES: Record<NodeVariant, number> = {
  'gas-giant': 100,
  moon: 72,
  asteroid: 52,
};

const VARIANT_LABELS: Record<NodeVariant, string> = {
  'gas-giant': 'Milestone',
  moon: 'Skill',
  asteroid: 'Task',
};

// Pick the largest font size at which the label still fits inside the circular
// content area without truncation. We approximate character width as
// 0.58 × fontSize and require ceil(label.length / charsPerLine) lines to fit
// within the available height.
function computeAdaptiveFontSize(label: string, nodeSize: number): number {
  const innerWidth = nodeSize - 18;
  const innerHeight = nodeSize - 30;
  const lineHeight = 1.15;
  const charWidthRatio = 0.58;
  const len = Math.max(label.length, 1);
  for (let f = 14; f >= 6; f -= 0.5) {
    const charsPerLine = Math.max(1, Math.floor(innerWidth / (charWidthRatio * f)));
    const lines = Math.ceil(len / charsPerLine);
    if (lines * f * lineHeight <= innerHeight) return f;
  }
  return 6;
}

function PlanetNodeComponent({ id, data, selected }: NodeProps<PlanetNodeType>) {
  const { label, variant, status, palette, isMobile, onToggleComplete, onEdit, onDelete } = data;
  const size = VARIANT_SIZES[variant];
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const borderColor = isCompleted
    ? palette.accent
    : isLocked
      ? '#52525b'
      : palette.primary;

  const gradientBg = isCompleted
    ? `radial-gradient(circle at 35% 30%, ${palette.accent}80 0%, ${palette.accent}26 50%, ${palette.accent}10 100%)`
    : isLocked
      ? `radial-gradient(circle at 35% 30%, rgba(82,82,91,0.3) 0%, rgba(40,40,45,0.6) 50%, rgba(20,20,22,0.9) 100%)`
      : `radial-gradient(circle at 35% 30%, ${palette.primary}60 0%, ${palette.primary}20 50%, ${palette.accent}10 100%)`;

  const outerGlow = isCompleted
    ? `0 0 28px ${palette.accent}99, 0 0 56px ${palette.accent}40, inset 0 0 20px ${palette.accent}26`
    : isLocked
      ? `0 0 8px rgba(0,0,0,0.5)`
      : `0 0 20px ${palette.primary}40, 0 0 40px ${palette.primary}15, inset 0 0 15px ${palette.primary}10`;

  const highlightPos = '30% 25%';

  return (
    <>
      {!isMobile && (
        <NodeToolbar isVisible={selected} position={Position.Top} offset={8} align="center">
          <div className="flex gap-1 rounded-lg bg-zinc-900 border border-zinc-700 p-1 shadow-xl">
            {!isLocked && (
              <button
                onClick={() => onToggleComplete(id)}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-700 transition-colors text-zinc-300"
              >
                {isCompleted ? 'Undo' : 'Complete'}
              </button>
            )}
            <button
              onClick={() => onEdit(id)}
              className="px-2 py-1 text-xs rounded hover:bg-zinc-700 transition-colors text-zinc-300"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="px-2 py-1 text-xs rounded hover:bg-red-900/50 transition-colors text-red-400"
            >
              Delete
            </button>
          </div>
        </NodeToolbar>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-zinc-600 !border-zinc-500 hover:!bg-zinc-400 !-top-1.5"
      />

      <div
        className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${selected ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent' : ''}`}
        style={{
          width: size,
          height: size,
          background: gradientBg,
          border: `2px solid ${borderColor}`,
          boxShadow: outerGlow,
          opacity: isLocked ? 0.45 : 1,
        }}
      >
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            inset: 0,
            background: `radial-gradient(circle at ${highlightPos}, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)`,
          }}
        />

        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            inset: 0,
            background: `radial-gradient(circle at 70% 65%, ${palette.accent}15 0%, transparent 40%)`,
          }}
        />

        {variant === 'gas-giant' && (
          <div
            className="absolute pointer-events-none"
            style={{
              width: size * 1.4,
              height: size * 0.35,
              border: `1.5px solid ${isCompleted ? `${palette.accent}4D` : `${palette.primary}30`}`,
              borderRadius: '50%',
              transform: 'rotate(-20deg)',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center" style={{ width: size - 12, maxHeight: size - 12 }}>
          <span
            className="text-[8px] uppercase tracking-[0.1em] leading-none mb-0.5"
            style={{ color: palette.text, opacity: 0.45 }}
          >
            {VARIANT_LABELS[variant]}
          </span>
          <span
            className="font-bold text-center max-w-full"
            style={{
              fontSize: computeAdaptiveFontSize(label, size),
              lineHeight: 1.15,
              color: palette.text,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}
            title={label}
          >
            {label}
          </span>
        </div>

        {isCompleted && (
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: -4,
              right: -4,
              width: Math.max(20, size * 0.28),
              height: Math.max(20, size * 0.28),
              backgroundColor: palette.accent,
              border: `2px solid ${palette.background}`,
              boxShadow: `0 0 10px ${palette.accent}80`,
              zIndex: 20,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={4}
              style={{ width: '60%', height: '60%' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-zinc-600 !border-zinc-500 hover:!bg-zinc-400 !-bottom-1.5"
      />
    </>
  );
}

export const PlanetNode = memo(PlanetNodeComponent);
