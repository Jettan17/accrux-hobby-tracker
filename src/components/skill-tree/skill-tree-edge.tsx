'use client';

import { memo } from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps, Edge } from '@xyflow/react';
import type { EdgeStyleVariant, ColorPalette } from '@/types';

export type SkillTreeEdgeData = {
  edgeStyle: EdgeStyleVariant;
  palette: ColorPalette;
  sourceCompleted: boolean;
  targetCompleted: boolean;
};

export type SkillTreeEdgeType = Edge<SkillTreeEdgeData, 'skill-tree'>;

function getEdgeStroke(edgeStyle: EdgeStyleVariant, palette: ColorPalette, bothCompleted: boolean) {
  const color = bothCompleted ? '#34d399' : palette.secondary;

  switch (edgeStyle) {
    case 'constellation':
      return { stroke: color, strokeDasharray: '4 4', strokeWidth: 1.5 };
    case 'rope':
      return { stroke: color, strokeDasharray: '8 3 2 3', strokeWidth: 2.5 };
    case 'branch':
      return { stroke: color, strokeWidth: 3, strokeLinecap: 'round' as const };
    case 'solid':
    default:
      return { stroke: color, strokeWidth: 2 };
  }
}

function SkillTreeEdgeComponent({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  data,
  selected,
}: EdgeProps<SkillTreeEdgeType>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = data?.edgeStyle ?? 'solid';
  const palette = data?.palette ?? { primary: '#fff', secondary: '#666', accent: '#fff', background: '#000', surface: '#111', text: '#fff' };
  const bothCompleted = (data?.sourceCompleted && data?.targetCompleted) ?? false;
  const strokeProps = getEdgeStroke(edgeStyle, palette, bothCompleted);

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...strokeProps,
        opacity: selected ? 1 : 0.7,
        transition: 'opacity 0.2s, stroke 0.3s',
      }}
    />
  );
}

export const SkillTreeEdge = memo(SkillTreeEdgeComponent);
