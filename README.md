# Accrux Hobby Tracker

A celestial-themed hobby gamification app that represents hobbies as "star systems" with skill trees, hierarchical task lists, and achievements. Built with Next.js 16, React 19, Supabase, and Zustand.

**Live:** https://accrux-hobby-tracker.vercel.app/

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run test       # vitest
```

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Architecture Overview

```
User creates Star Systems (hobbies)
  -> Each has a Skill Tree (visual DAG of nodes/edges)
  -> Each has a hierarchical Todo list (tasks with nesting)
  -> Theme system (colors, backgrounds, edge styles)
  -> Achievements unlock based on progress
```

**State**: Zustand store with slices (star-systems, skill-nodes, skill-edges, todo-items, achievements). All mutations are optimistic with Supabase persistence.

**Auth**: Supabase Auth with email/password. Server-side session via `@supabase/ssr`. RLS on all tables.

**Realtime**: Supabase Realtime subscriptions sync changes across tabs/devices.

## Codemap

### App Routes (`src/app/`)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Dashboard — galaxy view of star system clusters |
| `/star-system/[id]` | `star-system/[id]/page.tsx` | Star system detail (split: Skill Tree + Tasks; mobile toggle) |
| `/achievements` | `achievements/page.tsx` | Achievements gallery |
| `/login` | `login/page.tsx` | Login form |
| `/signup` | `signup/page.tsx` | Signup form |
| `/auth/callback` | `auth/callback/route.ts` | OAuth callback handler |

All authenticated pages wrap children in `AppShell` (layout with sidebar, header, mobile nav, realtime sync).

### Components (`src/components/`)

```
layout/
  app-shell.tsx        — Root layout: loads star systems, sets up realtime + achievements, mounts tutorial
  header.tsx           — Top bar: user email, help (?) icon to start tutorial, settings menu (JSON export/import)
  sidebar.tsx          — Desktop nav with star system list (drag-to-reorder)
  mobile-nav.tsx       — Bottom nav for mobile (Home / New / Awards)

star-system/
  dashboard-content.tsx       — Galaxy view: positions clusters in sunflower spiral, renders backdrop + meteor
  star-cluster.tsx            — Single cluster sphere + label; pulses gold when fully complete
  meteor-suggestion.tsx       — Periodic meteor that suggests an incomplete todo to tackle
  star-system-detail.tsx      — Detail page: header + split body (skill tree + tasks); mobile uses a tree/tasks toggle
  todos-tab.tsx               — Hierarchical sortable todo list (dnd-kit) — right pane on desktop
  skill-tree-tab.tsx          — Skill tree canvas wrapper — left pane on desktop
  create-star-system-dialog.tsx
  edit-star-system-dialog.tsx
  delete-star-system-dialog.tsx

skill-tree/
  skill-tree-canvas.tsx  — React Flow canvas with nodes/edges
  planet-node.tsx        — Custom node component (gas-giant, asteroid, moon)
  skill-tree-edge.tsx    — Custom edge with theme-aware styling
  add-node-panel.tsx     — Panel to add new nodes
  node-detail-panel.tsx  — Selected node info/actions
  mobile-node-sheet.tsx  — Bottom sheet for node actions on mobile

theme-editor/
  theme-editor.tsx       — Preset picker + customization panel
  palette-editor.tsx     — Color palette pickers (primary, secondary, etc.)
  background-editor.tsx  — Solid/gradient/image background config
  color-picker.tsx       — Individual color input

achievements/
  achievements-gallery.tsx  — Grid of all achievements (locked/unlocked)
  achievement-toast.tsx     — Toast notification for new unlocks

onboarding/
  tutorial-tour.tsx    — react-joyride wrapper: 9-step single-page tour, body-centered fallback for missing targets

ui/
  button.tsx, input.tsx, dialog.tsx, confirm-dialog.tsx, toast.tsx, error-boundary.tsx
```

### State Management (`src/lib/store/`)

Zustand store with 6 slices combined in `index.ts`:

| Slice | Key State | Key Actions |
|-------|-----------|-------------|
| `star-systems.ts` | `starSystems`, `starSystemsLoaded` | `loadStarSystems`, `createStarSystem`, `updateStarSystem`, `deleteStarSystem`, `reorderStarSystems` |
| `skill-nodes.ts` | `skillNodes` | `loadSkillNodes`, `createSkillNode`, `updateSkillNode`, `deleteSkillNode` |
| `skill-edges.ts` | `skillEdges` | `loadSkillEdges`, `createSkillEdge`, `deleteSkillEdge` |
| `todo-items.ts` | `todoItems` | `loadTodoItems`, `createTodoItem`, `updateTodoItem`, `moveTodoItem`, `indentTodoItem`, `outdentTodoItem`, `deleteTodoItem` |
| `achievements.ts` | `userAchievements`, `pendingToasts` | `loadUserAchievements`, `checkAndUnlockAchievements`, `dismissToast` |
| `tutorial.ts` | `tourRunning`, `tourStepIndex`, `tourCompleted` | `startTour`, `stopTour`, `setTourStepIndex`, `completeTour`, `initTourFromStorage` |

**Selectors** (in `index.ts`): `selectStarSystemsList`, `selectTodosByStarSystem`, `selectCompletionStats`

### Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `use-realtime-sync.ts` | Subscribes to Supabase Realtime for all tables, merges remote changes into store |
| `use-achievement-trigger.ts` | Watches todoItems/starSystems changes, triggers achievement evaluation when fingerprint changes |
| `use-is-mobile.ts` | Media query hook for responsive behavior |

### Types (`src/types/`)

Core domain types (all fields `readonly`):

- **StarSystem**: id, userId, name, description, themeConfig, sortOrder
- **SkillNode**: id, starSystemId, label, variant (gas-giant/asteroid/moon), completed, positionX/Y
- **SkillEdge**: id, starSystemId, sourceNodeId, targetNodeId
- **TodoItem**: id, starSystemId, parentId (nullable for nesting), title, completed, locked, sortOrder
- **Achievement/UserAchievement**: condition-based unlock system
- **ThemeConfig**: palette (6 colors), background (solid/gradient/image), edgeStyle, defaultNodeOverlay

### Themes (`src/lib/themes/`)

- `presets.ts` — 8 preset themes (Orange, Amber, Red, Green, Purple, Blue, Cyan, Pink) + background image presets
- `types.ts` — `ThemeRenderer` interface (getNodeClasses, getEdgeStyle, getBackgroundStyle)
- `renderers/celestial.ts` — Default renderer implementation
- `registry.ts` — Theme renderer registry

### Supabase (`src/lib/supabase/`)

- `client.ts` — Browser client (singleton)
- `server.ts` — Server client (cookie-based session)
- `middleware.ts` — Session refresh middleware
- `auth-actions.ts` — Server actions for login/signup/logout

### Database Schema (`supabase/migrations/`)

Tables: `star_systems`, `skill_nodes`, `skill_edges`, `todo_items`, `user_achievements`

Key relationships:
- `skill_nodes.star_system_id` -> `star_systems.id`
- `skill_edges.source_node_id/target_node_id` -> `skill_nodes.id`
- `todo_items.star_system_id` -> `star_systems.id`
- `todo_items.parent_id` -> `todo_items.id` (self-referencing for hierarchy)
- All tables have RLS policies scoped to `auth.uid()`
- Realtime enabled on all tables

### Utilities (`src/lib/utils/`)

- `ids.ts` — nanoid-based ID generation
- `timestamps.ts` — ISO timestamp helper
- `dag.ts` — DAG validation (cycle detection for skill tree edges)
- `todo-tree.ts` — Tree utilities for hierarchical todos (text serialize/parse with `[x]` and `[l]` flags)
- `export-star-system.ts` — Per-star-system JSON export (subset of full backup)

## Key Patterns

- **Optimistic updates**: Store mutates immediately, then persists to Supabase
- **Realtime conflict resolution**: `isNewer()` timestamp comparison; ignore stale events
- **Immutable state**: All types use `readonly`; store always creates new objects
- **Hierarchical todos**: `parentId` + `sortOrder` with cascading completion (completing all children auto-completes parent)
- **Drag-and-drop reordering**: dnd-kit with `moveTodoItem` handling parent reassignment
- **Locked todos**: `locked` flag is mutually exclusive with `completed`; locked todos are skipped by meteor suggestions
- **Achievement fingerprinting**: Only evaluates when completed-count or system-count changes
- **Tutorial fallback**: Tour steps resolve targets at render time and fall back to body-centered text when the element isn't in the DOM (handles new accounts with no todos, mobile-on-skill-tree, etc.)
