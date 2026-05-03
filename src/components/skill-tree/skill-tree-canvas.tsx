'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectTodosByStarSystem } from '@/lib/store';
import type { ThemeConfig } from '@/types';
import { PlanetNode, type PlanetNodeType } from './planet-node';
import { SkillTreeEdge, type SkillTreeEdgeType } from './skill-tree-edge';
import { deriveTodoTree, layoutTree } from '@/lib/utils/todo-tree';
import { useIsMobile } from '@/hooks/use-is-mobile';

const nodeTypes = { planet: PlanetNode };
const edgeTypes = { 'skill-tree': SkillTreeEdge };

interface SkillTreeCanvasProps {
  starSystemId: string;
  themeConfig: ThemeConfig;
}

function SkillTreeCanvasInner({ starSystemId, themeConfig }: SkillTreeCanvasProps) {
  const { fitView } = useReactFlow();
  const isMobile = useIsMobile();

  const todos = useAppStore(useShallow((s) => selectTodosByStarSystem(s, starSystemId)));
  const updateTodoItem = useAppStore((s) => s.updateTodoItem);

  const { nodes: derivedNodes, edges: derivedEdges } = useMemo(
    () => deriveTodoTree(todos),
    [todos],
  );

  const positions = useMemo(() => layoutTree(derivedNodes), [derivedNodes]);

  const handleToggleComplete = useCallback(
    (nodeId: string) => {
      const todo = useAppStore.getState().todoItems[nodeId];
      if (todo) updateTodoItem(nodeId, { completed: !todo.completed });
    },
    [updateTodoItem],
  );

  const noop = useCallback(() => {}, []);

  const flowNodes: PlanetNodeType[] = useMemo(
    () =>
      derivedNodes.map((dn) => ({
        id: dn.id,
        type: 'planet' as const,
        position: positions[dn.id] ?? { x: 0, y: 0 },
        draggable: false,
        data: {
          label: dn.label,
          description: '',
          variant: dn.variant,
          status: dn.completed ? 'completed' : 'available',
          palette: themeConfig.palette,
          isMobile,
          onToggleComplete: handleToggleComplete,
          onEdit: noop,
          onDelete: noop,
        },
      })),
    [derivedNodes, positions, themeConfig.palette, isMobile, handleToggleComplete, noop],
  );

  const flowEdges: SkillTreeEdgeType[] = useMemo(
    () =>
      derivedEdges.map((de) => ({
        id: de.id,
        type: 'skill-tree' as const,
        source: de.sourceId,
        target: de.targetId,
        data: {
          edgeStyle: themeConfig.edgeStyle,
          palette: themeConfig.palette,
          sourceCompleted: derivedNodes.find((n) => n.id === de.sourceId)?.completed ?? false,
          targetCompleted: derivedNodes.find((n) => n.id === de.targetId)?.completed ?? false,
        },
      })),
    [derivedEdges, derivedNodes, themeConfig],
  );

  const bgStyle = useMemo(() => {
    const { background } = themeConfig;
    switch (background.kind) {
      case 'solid':
        return background.color;
      case 'gradient':
        return background.colors[0] ?? '#0f0f0f';
      default:
        return '#0f0f0f';
    }
  }, [themeConfig]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        colorMode="dark"
        minZoom={0.2}
        maxZoom={3}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={themeConfig.palette.secondary + '30'}
          bgColor={bgStyle}
        />
      </ReactFlow>

      <div className="absolute bottom-3 left-3 z-10 flex gap-2">
        <button
          onClick={() => fitView({ padding: 0.4, duration: 300 })}
          className="px-2.5 py-1 rounded-lg bg-zinc-800/90 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          Fit View
        </button>
      </div>

      {todos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">&#127776;</span>
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No skills yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Add items in the Todos tab to see your skill tree grow here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillTreeCanvas(props: SkillTreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <SkillTreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
