'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Check, X, Pencil, ChevronRight, ChevronDown } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectTodosByStarSystem } from '@/lib/store';
import type { TodoItem } from '@/types';

interface TodosTabProps {
  starSystemId: string;
  loaded: boolean;
}

interface FlatTodoItem {
  todo: TodoItem;
  depth: number;
  hasChildren: boolean;
}

function buildFlatList(todos: TodoItem[]): FlatTodoItem[] {
  const childrenMap: Record<string, TodoItem[]> = {};
  for (const todo of todos) {
    const key = todo.parentId ?? '__root__';
    if (!childrenMap[key]) childrenMap[key] = [];
    childrenMap[key].push(todo);
  }

  for (const key of Object.keys(childrenMap)) {
    childrenMap[key].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const result: FlatTodoItem[] = [];
  function traverse(parentId: string | null, depth: number) {
    const key = parentId ?? '__root__';
    const children = childrenMap[key] ?? [];
    for (const child of children) {
      const hasChildren = (childrenMap[child.id] ?? []).length > 0;
      result.push({ todo: child, depth, hasChildren });
      traverse(child.id, depth + 1);
    }
  }
  traverse(null, 0);
  return result;
}

export function TodosTab({ starSystemId, loaded }: TodosTabProps) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const todos = useAppStore(useShallow((s) => selectTodosByStarSystem(s, starSystemId)));
  const createTodoItem = useAppStore((s) => s.createTodoItem);
  const moveTodoItem = useAppStore((s) => s.moveTodoItem);
  const indentTodoItem = useAppStore((s) => s.indentTodoItem);
  const outdentTodoItem = useAppStore((s) => s.outdentTodoItem);

  const flatList = useMemo(() => buildFlatList(todos), [todos]);

  const visibleList = useMemo(() => {
    const visible: FlatTodoItem[] = [];
    const hiddenParents = new Set<string>();

    for (const item of flatList) {
      if (item.todo.parentId && hiddenParents.has(item.todo.parentId)) {
        hiddenParents.add(item.todo.id);
        continue;
      }
      if (item.todo.parentId && collapsedIds.has(item.todo.parentId)) {
        hiddenParents.add(item.todo.id);
        continue;
      }
      visible.push(item);
    }
    return visible;
  }, [flatList, collapsedIds]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const draggedIdx = visibleList.findIndex((t) => t.todo.id === active.id);
      const targetIdx = visibleList.findIndex((t) => t.todo.id === over.id);
      if (draggedIdx === -1 || targetIdx === -1) return;

      const draggedItem = visibleList[draggedIdx];
      const targetItem = visibleList[targetIdx];

      const targetParentId = targetItem.todo.parentId;
      const targetSiblings = visibleList
        .filter((v) => v.todo.parentId === targetParentId && v.todo.id !== draggedItem.todo.id);
      const targetSiblingIdx = targetSiblings.findIndex((v) => v.todo.id === targetItem.todo.id);
      const insertIndex = draggedIdx < targetIdx ? targetSiblingIdx + 1 : targetSiblingIdx;

      moveTodoItem(draggedItem.todo.id, targetParentId, Math.max(0, insertIndex));
    },
    [visibleList, moveTodoItem],
  );

  const handleAdd = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    try {
      await createTodoItem({ starSystemId, title });
      setNewTitle('');
    } finally {
      setAdding(false);
    }
  }, [newTitle, starSystemId, createTodoItem]);

  useEffect(() => {
    if (!adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  useEffect(() => {
    if (!activeId) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        indentTodoItem(activeId!);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        outdentTodoItem(activeId!);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, indentTodoItem, outdentTodoItem]);

  if (!loaded) {
    return (
      <div className="p-4 lg:p-8">
        <div className="h-10 w-full rounded-lg bg-zinc-800 animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeItem = activeId ? visibleList.find((v) => v.todo.id === activeId) : null;

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex gap-2 mb-6"
      >
        <input
          ref={inputRef}
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new item..."
          disabled={adding}
          autoFocus
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Add
        </button>
      </form>

      {visibleList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <span className="text-2xl">&#9745;</span>
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No items yet</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Add items to build your skill tree. Use Tab to indent and create sub-skills.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={visibleList.map((v) => v.todo.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-0.5">
              {visibleList.map((item) => (
                <SortableTodoItemRow
                  key={item.todo.id}
                  item={item}
                  collapsed={collapsedIds.has(item.todo.id)}
                  onToggleCollapse={toggleCollapse}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeItem && (
              <div className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2.5 shadow-2xl text-sm text-zinc-200 opacity-90">
                {activeItem.todo.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <div className="mt-4 text-xs text-zinc-600 space-y-0.5">
        <p><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Tab</kbd> indent &middot; <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Shift+Tab</kbd> outdent</p>
        <p>While dragging: <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">A</kbd> / <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">D</kbd> to change nesting</p>
      </div>
    </div>
  );
}

const DEPTH_COLORS = [
  'border-l-orange-500',
  'border-l-blue-500',
  'border-l-emerald-500',
  'border-l-purple-500',
  'border-l-pink-500',
];

const VARIANT_LABELS: Record<number, string> = {
  0: 'Milestone',
  1: 'Skill',
};

function SortableTodoItemRow({
  item,
  collapsed,
  onToggleCollapse,
}: {
  item: FlatTodoItem;
  collapsed: boolean;
  onToggleCollapse: (id: string) => void;
}) {
  const { todo, depth, hasChildren } = item;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const editRef = useRef<HTMLInputElement>(null);

  const updateTodoItem = useAppStore((s) => s.updateTodoItem);
  const deleteTodoItem = useAppStore((s) => s.deleteTodoItem);
  const indentTodoItem = useAppStore((s) => s.indentTodoItem);
  const outdentTodoItem = useAppStore((s) => s.outdentTodoItem);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    updateTodoItem(todo.id, { completed: !todo.completed });
  };

  const handleStartEdit = () => {
    setEditValue(todo.title);
    setEditing(true);
    requestAnimationFrame(() => editRef.current?.focus());
  };

  const handleSaveEdit = () => {
    const title = editValue.trim();
    if (title && title !== todo.title) {
      updateTodoItem(todo.id, { title });
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(todo.title);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !editing) {
      e.preventDefault();
      if (e.shiftKey) {
        outdentTodoItem(todo.id);
      } else {
        indentTodoItem(todo.id);
      }
    }
  };

  const depthColor = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const variantLabel = VARIANT_LABELS[depth] ?? 'Task';

  return (
    <li
      ref={setNodeRef}
      style={{ ...style, marginLeft: depth * 24 }}
      className={`
        flex items-center gap-2 rounded-lg border border-l-2 px-3 py-2.5 transition-colors group
        ${isDragging ? 'opacity-40 border-zinc-600 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}
        ${depthColor}
        ${todo.completed ? 'opacity-60' : ''}
      `}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="touch-none text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Collapse toggle */}
      <button
        onClick={() => hasChildren && onToggleCollapse(todo.id)}
        className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${hasChildren ? 'text-zinc-500 hover:text-zinc-300 cursor-pointer' : 'invisible'}`}
        tabIndex={-1}
      >
        {hasChildren && (
          collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`
          h-5 w-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer
          ${todo.completed
            ? 'border-green-500 bg-green-500'
            : 'border-zinc-600 hover:border-zinc-400'
          }
        `}
      >
        {todo.completed && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title or edit input */}
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit();
          }}
          className="flex-1 flex items-center gap-1"
        >
          <input
            ref={editRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button
            type="submit"
            className="text-green-400 hover:text-green-300 cursor-pointer p-0.5"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm truncate block ${todo.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
          >
            {todo.title}
          </span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            {variantLabel}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {!editing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleStartEdit}
            className="rounded p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => deleteTodoItem(todo.id)}
            className="rounded p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </li>
  );
}
