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
import { GripVertical, Trash2, Check, X, Pencil, ChevronRight, ChevronDown, FileText, List } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectTodosByStarSystem } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { createId } from '@/lib/utils/ids';
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

interface ParsedLine {
  title: string;
  completed: boolean;
  depth: number;
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

function serializeTodos(flatList: FlatTodoItem[]): string {
  return flatList
    .map(({ todo, depth }) => {
      const indent = '  '.repeat(depth);
      const prefix = todo.completed ? '[x] ' : '';
      return `${indent}${prefix}${todo.title}`;
    })
    .join('\n');
}

function parseText(text: string): ParsedLine[] {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const indent = line.length - line.trimStart().length;
      const depth = Math.floor(indent / 2);
      let content = line.trimStart();
      let completed = false;
      if (content.startsWith('[x] ') || content.startsWith('[X] ')) {
        completed = true;
        content = content.slice(4);
      } else if (content.startsWith('[ ] ')) {
        content = content.slice(4);
      }
      return { title: content, completed, depth };
    });
}

export function TodosTab({ starSystemId, loaded }: TodosTabProps) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'text'>('list');
  const [textContent, setTextContent] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      const targetSiblings = visibleList.filter(
        (v) => v.todo.parentId === targetParentId && v.todo.id !== draggedItem.todo.id,
      );
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

  const handleSwitchToText = useCallback(() => {
    setTextContent(serializeTodos(flatList));
    setViewMode('text');
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [flatList]);

  const handleCancelText = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleTextSave = useCallback(async () => {
    const parsed = parseText(textContent);
    if (parsed.length === 0 && todos.length > 0) {
      if (!confirm('This will delete all items. Continue?')) return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const timestamp = new Date().toISOString();

      const existingByTitle = new Map<string, TodoItem[]>();
      for (const todo of todos) {
        const list = existingByTitle.get(todo.title) ?? [];
        list.push(todo);
        existingByTitle.set(todo.title, list);
      }

      const matchedExistingIds = new Set<string>();
      const itemIds: string[] = [];

      for (const line of parsed) {
        const candidates = existingByTitle.get(line.title);
        let match: TodoItem | undefined;
        if (candidates) {
          const idx = candidates.findIndex((c) => !matchedExistingIds.has(c.id));
          if (idx >= 0) {
            match = candidates[idx];
            matchedExistingIds.add(match.id);
          }
        }
        itemIds.push(match?.id ?? createId());
      }

      const parentIds: (string | null)[] = [];
      const depthStack: { depth: number; id: string }[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const depth = parsed[i].depth;
        while (depthStack.length > 0 && depthStack[depthStack.length - 1].depth >= depth) {
          depthStack.pop();
        }
        parentIds.push(depthStack.length > 0 ? depthStack[depthStack.length - 1].id : null);
        depthStack.push({ depth, id: itemIds[i] });
      }

      const sortOrders: number[] = [];
      const siblingCounters = new Map<string, number>();
      for (let i = 0; i < parsed.length; i++) {
        const key = parentIds[i] ?? '__root__';
        const count = siblingCounters.get(key) ?? 0;
        sortOrders.push(count);
        siblingCounters.set(key, count + 1);
      }

      const toDelete = todos.filter((t) => !matchedExistingIds.has(t.id));
      if (toDelete.length > 0) {
        const toDeleteByDepth = toDelete
          .map((t) => ({
            id: t.id,
            depth: flatList.find((f) => f.todo.id === t.id)?.depth ?? 0,
          }))
          .sort((a, b) => b.depth - a.depth);

        for (const { id } of toDeleteByDepth) {
          await supabase.from('todo_items').delete().eq('id', id);
        }
      }

      const byDepth = new Map<number, number[]>();
      for (let i = 0; i < parsed.length; i++) {
        const depth = parsed[i].depth;
        const list = byDepth.get(depth) ?? [];
        list.push(i);
        byDepth.set(depth, list);
      }

      const depths = [...byDepth.keys()].sort((a, b) => a - b);
      for (const depth of depths) {
        const indices = byDepth.get(depth)!;
        const rows = indices.map((i) => ({
          id: itemIds[i],
          star_system_id: starSystemId,
          parent_id: parentIds[i],
          title: parsed[i].title,
          completed: parsed[i].completed,
          sort_order: sortOrders[i],
          updated_at: timestamp,
        }));
        const { error } = await supabase.from('todo_items').upsert(rows);
        if (error) throw error;
      }

      const storeState = useAppStore.getState();
      const newTodoItems: Record<string, TodoItem> = { ...storeState.todoItems };

      for (const t of toDelete) {
        delete newTodoItems[t.id];
      }

      for (let i = 0; i < parsed.length; i++) {
        const existing = matchedExistingIds.has(itemIds[i])
          ? todos.find((t) => t.id === itemIds[i])
          : null;

        newTodoItems[itemIds[i]] = {
          id: itemIds[i],
          starSystemId,
          parentId: parentIds[i],
          title: parsed[i].title,
          completed: parsed[i].completed,
          sortOrder: sortOrders[i],
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
        };
      }

      useAppStore.setState({ todoItems: newTodoItems });
      setViewMode('list');
    } catch (err) {
      alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }, [textContent, todos, flatList, starSystemId]);

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', end);
        const actualEnd = lineEnd === -1 ? value.length : lineEnd;

        const selectedLines = value.slice(lineStart, actualEnd);
        const lines = selectedLines.split('\n');

        const modified = lines
          .map((line) => {
            if (e.shiftKey) {
              if (line.startsWith('  ')) return line.slice(2);
              return line;
            }
            return '  ' + line;
          })
          .join('\n');

        const newValue = value.slice(0, lineStart) + modified + value.slice(actualEnd);
        setTextContent(newValue);

        requestAnimationFrame(() => {
          const delta = modified.length - selectedLines.length;
          textarea.selectionStart = start + (e.shiftKey ? Math.min(0, delta) : 2);
          textarea.selectionEnd = end + delta;
        });
      }
    },
    [],
  );

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
      {viewMode === 'list' ? (
        <>
          <div className="flex gap-2 mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex gap-2 flex-1"
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
            <button
              onClick={handleSwitchToText}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors cursor-pointer flex items-center gap-1.5 text-sm flex-shrink-0"
              title="Edit as text"
            >
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </button>
          </div>

          {visibleList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl">&#9745;</span>
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No items yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Add items to build your skill tree. Use Tab to indent and create skills.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleList.map((v) => v.todo.id)}
                strategy={verticalListSortingStrategy}
              >
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
            <p>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Tab</kbd> indent
              &middot;{' '}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Shift+Tab</kbd>{' '}
              outdent
            </p>
            <p>
              While dragging:{' '}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">A</kbd> /{' '}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">D</kbd> to change
              nesting
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">Edit as text</h3>
            <button
              onClick={handleCancelText}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors cursor-pointer flex items-center gap-1.5 text-sm"
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            spellCheck={false}
            className="w-full min-h-[300px] rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 font-mono leading-relaxed placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition-colors resize-y"
            placeholder={
              'Type your items here...\n\nIndent with 2 spaces for nesting:\nParent item\n  Child item\n    Grandchild\n\nPrefix with [x] to mark complete:\n[x] Done item'
            }
          />

          <div className="flex items-center justify-between mt-4 gap-3">
            <div className="text-xs text-zinc-600 space-y-0.5">
              <p>
                <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Tab</kbd> indent
                &middot;{' '}
                <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Shift+Tab</kbd>{' '}
                outdent
              </p>
              <p>
                2 spaces = nesting level &middot;{' '}
                <code className="text-zinc-400">[x]</code> = completed
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleCancelText}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSave}
                disabled={saving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
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

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

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
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="touch-none text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={() => hasChildren && onToggleCollapse(todo.id)}
        className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${hasChildren ? 'text-zinc-500 hover:text-zinc-300 cursor-pointer' : 'invisible'}`}
        tabIndex={-1}
      >
        {hasChildren &&
          (collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          ))}
      </button>

      <button
        onClick={handleToggle}
        className={`
          h-5 w-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer
          ${
            todo.completed
              ? 'border-green-500 bg-green-500'
              : 'border-zinc-600 hover:border-zinc-400'
          }
        `}
      >
        {todo.completed && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

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
          <button type="submit" className="text-green-400 hover:text-green-300 cursor-pointer p-0.5">
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
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{variantLabel}</span>
        </div>
      )}

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
