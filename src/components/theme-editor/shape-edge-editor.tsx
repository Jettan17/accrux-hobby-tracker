'use client';

import type { NodeShapeVariant, EdgeStyleVariant } from '@/types';

interface ShapeEdgeEditorProps {
  nodeShape: NodeShapeVariant;
  edgeStyle: EdgeStyleVariant;
  onShapeChange: (shape: NodeShapeVariant) => void;
  onEdgeChange: (edge: EdgeStyleVariant) => void;
}

const SHAPES: Array<{ value: NodeShapeVariant; label: string; icon: string }> = [
  { value: 'circle', label: 'Circle', icon: '●' },
  { value: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { value: 'irregular', label: 'Octagon', icon: '⯃' },
];

const EDGE_STYLES: Array<{ value: EdgeStyleVariant; label: string; preview: string }> = [
  { value: 'constellation', label: 'Constellation', preview: '· · · ·' },
  { value: 'solid', label: 'Solid', preview: '————' },
  { value: 'rope', label: 'Rope', preview: '–·–·–' },
  { value: 'branch', label: 'Branch', preview: '━━━━' },
];

export function ShapeEdgeEditor({ nodeShape, edgeStyle, onShapeChange, onEdgeChange }: ShapeEdgeEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Node Shape</h4>
        <div className="flex gap-1">
          {SHAPES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onShapeChange(value)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                nodeShape === value
                  ? 'bg-zinc-700 text-white border border-zinc-500'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Edge Style</h4>
        <div className="grid grid-cols-2 gap-1">
          {EDGE_STYLES.map(({ value, label, preview }) => (
            <button
              key={value}
              type="button"
              onClick={() => onEdgeChange(value)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                edgeStyle === value
                  ? 'bg-zinc-700 text-white border border-zinc-500'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              <span className="font-mono text-[10px] tracking-widest">{preview}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
