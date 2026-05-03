import type { ThemeRenderer, NodeRenderProps, EdgeRenderProps } from '../types';
import type { ThemeConfig, NodeVariant } from '@/types';

const NODE_SIZES: Record<NodeVariant, { width: number; height: number }> = {
  'gas-giant': { width: 120, height: 120 },
  asteroid: { width: 60, height: 60 },
  moon: { width: 80, height: 80 },
};

export const celestialRenderer: ThemeRenderer = {
  id: 'celestial',
  name: 'Celestial',

  getNodeClasses(props: NodeRenderProps): string {
    const base = 'rounded-full border-2 flex items-center justify-center transition-all duration-300';

    const shapeClass =
      props.nodeShape === 'hexagon'
        ? 'clip-hexagon'
        : props.nodeShape === 'irregular'
          ? 'clip-irregular'
          : '';

    if (props.completed) {
      return `${base} ${shapeClass} border-emerald-400 bg-emerald-900/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]`;
    }

    if (props.locked) {
      return `${base} ${shapeClass} border-zinc-600 bg-zinc-800/50 opacity-50`;
    }

    return `${base} ${shapeClass} border-current bg-current/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]`;
  },

  getNodeSize(variant: NodeVariant) {
    return NODE_SIZES[variant];
  },

  getEdgeStyle(props: EdgeRenderProps): Record<string, string> {
    const { palette, edgeStyle } = props;

    const bothCompleted = props.sourceCompleted && props.targetCompleted;
    const color = bothCompleted ? '#34d399' : palette.secondary;

    switch (edgeStyle) {
      case 'constellation':
        return { stroke: color, strokeDasharray: '4 4', strokeWidth: '1.5' };
      case 'rope':
        return { stroke: color, strokeDasharray: '8 3 2 3', strokeWidth: '2.5' };
      case 'branch':
        return { stroke: color, strokeWidth: '3', strokeLinecap: 'round' };
      case 'solid':
      default:
        return { stroke: color, strokeWidth: '2' };
    }
  },

  getEdgeAnimated(props: EdgeRenderProps): boolean {
    return props.sourceCompleted && props.targetCompleted;
  },

  getBackgroundStyle(config: ThemeConfig): React.CSSProperties {
    const { background } = config;

    switch (background.kind) {
      case 'solid':
        return { backgroundColor: background.color };
      case 'gradient':
        return {
          background: `linear-gradient(${background.angle}deg, ${background.colors.join(', ')})`,
        };
      case 'image':
        return {
          backgroundImage: `url(${background.storageKey})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: background.opacity,
        };
    }
  },
};
