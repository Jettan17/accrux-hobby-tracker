# Accrux Hobby Tracker — Project Plan

## Overview

Accrux is a hobby gamification PWA with a celestial/space theme. Each hobby is a "star system" containing a configurable skill tree (directed acyclic graph of "planet" nodes) and a todo list. Users can visually build skill trees, track progress, and earn achievements.

**Key concepts:**
- Each hobby = a "star system" with its own visual theme
- Skills = "planets" arranged in a directed graph (prerequisites = edges)
- Three node variants: gas giant (milestone), asteroid (small task), moon (sub-skill)
- Per-hobby visual themes — celestial base with customizable colors, shapes, edges, overlays
- Theme system architected so fully distinct theme families (nature, circuits, climbing holds) can be added later
- No XP, no levels, no streaks — progress is binary completion counts/percentages
- Cross-device sync via Supabase (auth + DB + realtime + storage)
- PWA — installable on phone and laptop

**Hobbies:** Programming, Languages, Climbing, Video Editing, Gym, Game Development, Driving

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Client state | Zustand |
| Graph editor | @xyflow/react (React Flow) |
| Drag-and-drop | @dnd-kit |
| Backend | Supabase (Auth + Postgres + Realtime + Storage) |
| Testing | Vitest + React Testing Library |
| Icons | Lucide React |
| IDs | nanoid |
| PWA | next-pwa |

## Architecture Decisions

- **Supabase over graph DB** — Skill trees are small (20-50 nodes), always loaded entirely. Supabase provides auth + DB + realtime + storage in one service. Graph traversal done in application layer.
- **PWA over native app** — One codebase, install to home screen, no app store deployment.
- **ThemeRenderer abstraction** — Theme config is pure data (JSONB in DB). Renderers map config → visuals. Adding a new theme family = new renderer file, no editor changes.
- **Records over arrays in Zustand** — O(1) lookups by ID, important for React Flow drag performance.
- **JSONB for theme_config** — Read/written as a unit, avoids extra join tables, schema evolves without migrations.

## Data Model

- **StarSystem**: id, userId, name, description, iconStorageKey, themeConfig (JSONB), sortOrder
- **SkillNode**: id, starSystemId, label, description, variant (gas-giant/asteroid/moon), completed (bool), positionX, positionY
- **SkillEdge**: id, starSystemId, sourceNodeId, targetNodeId
- **TodoItem**: id, starSystemId, title, completed (bool), sortOrder
- **UserAchievement**: id, userId, achievementId, unlockedAt

## Theme Config (per hobby)

```
ThemeConfig {
  background: solid | gradient | image
  nodeShape: circle | hexagon | irregular
  defaultNodeOverlay: none | glyph | icon | image
  edgeStyle: constellation | solid | rope | branch
  palette: { primary, secondary, accent, background, surface, text }
}
```

7 presets ship: programming, languages, climbing, video-editing, gym, game-development, driving.

---

## Phases & Progress

### Phase 0: Project Scaffold — DONE
- [x] Initialize Next.js 16 + TypeScript + Tailwind CSS 4
- [x] Install all dependencies
- [x] Define TypeScript types (7 files in src/types/)
- [x] Create utility libraries (DAG cycle detection, IDs, timestamps)
- [x] Build theme system (types, 7 presets, celestial renderer, registry)
- [x] Write Supabase migrations (5 tables, indexes, RLS, storage bucket)
- [x] Configure Vitest (10 tests passing)
- [x] Configure PWA (manifest.json, next-pwa production-only)

### Phase 1: Auth & Layout Shell — DONE
- [x] Supabase client setup (browser, server, middleware)
- [x] Auth middleware (redirect unauthenticated → /login)
- [x] Login page (email/password + Google OAuth)
- [x] Signup page (email/password + Google OAuth)
- [x] OAuth callback route (code exchange + cookie setting)
- [x] App layout shell (header, sidebar, mobile bottom nav)
- [x] Shared UI components (Button, Input, Dialog)
- [x] Google OAuth tested and working
- [x] Email signup tested and working

### Phase 2: Store & Star System CRUD — DONE
- [x] Zustand store with slices (star systems, skill nodes, skill edges, todos)
- [x] Selectors (by star system, completion stats, node statuses)
- [x] Create star system dialog (name, description, theme preset picker)
- [x] Star system card component
- [x] Dashboard content (empty state + card grid)
- [x] Test creating a star system end-to-end
- [x] Edit star system dialog
- [x] Delete star system (with confirmation)
- [x] Fix useShallow for all derived selectors (prevent infinite re-render loops)

### Phase 3: Star System Detail Page — DONE
- [x] Detail page at /star-system/[id]
- [x] Tab layout: Skill Tree | Todos
- [x] Star system header with name, edit button, completion stats
- [x] Load skill nodes + edges + todos for the system

### Phase 4: Skill Tree Editor — DONE
- [x] React Flow canvas with themed background
- [x] Custom PlanetNode component (renders per variant + theme)
- [x] Custom SkillEdge component (constellation/solid/rope/branch)
- [x] Add node controls (select variant, place on canvas)
- [x] Connect nodes by dragging (with cycle detection)
- [x] Node detail panel (edit label, description, variant)
- [x] Toggle node completion (with prerequisite unlocking)
- [x] Delete nodes and edges
- [x] Mobile touch support (pinch-to-zoom, node context menu as bottom sheet)

### Phase 5: Todo Lists — DONE
- [x] Sortable todo list per star system (@dnd-kit)
- [x] Add todo input
- [x] Toggle completion
- [x] Inline edit title
- [x] Delete todo
- [x] Drag reorder with touch support (TouchSensor with 200ms activation delay)

### Phase 6: Theme Editor — DONE
- [x] Theme editor component (edit ThemeConfig fields)
- [x] Color palette picker
- [x] Background style picker (solid/gradient)
- [x] Node shape selector
- [x] Edge style selector
- [x] Live preview mini canvas
- [x] Integration with edit star system modal + create dialog

### Phase 7: Achievements — DONE
- [x] Achievement definitions (16 space-themed achievements)
- [x] Achievement evaluator (check conditions against state)
- [x] Achievement toast notification
- [x] Achievements gallery page
- [x] Auto-trigger after completion events (fingerprint-based change detection)

### Phase 8: Supabase Realtime Sync — DONE
- [x] Subscribe to Postgres changes per user (all 5 tables)
- [x] Sync INSERT/UPDATE/DELETE to Zustand store
- [x] Last-write-wins conflict resolution via updated_at
- [x] Debounce position updates during drag (saves on drag end, not during)

### Phase 9: Polish — DONE
- [x] Error boundary + toast notifications
- [x] Loading skeletons + suspense (existing in detail pages)
- [x] Empty states for all views (existing in dashboard, skill tree, todos)
- [x] Confirmation dialogs for destructive actions (ConfirmDialog component, node deletion)
- [x] Mobile final pass (bottom sheet, responsive panels, touch targets)
- [x] Performance (memoized React Flow nodes/edges already in place)
- [x] Data export as JSON backup (header settings menu)
- [x] PWA icons (192x192, 512x512 generated from SVG)

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| React Flow + custom themed nodes on mobile | High | Prototype early, test on real device |
| Supabase Realtime conflicts (two-device edits) | High | Last-write-wins with updated_at, debounce positions |
| RLS on child tables via subquery | Medium | Tested in SQL editor; denormalize user_id if slow |
| @dnd-kit touch DnD conflicting with scroll | Medium | TouchSensor with activation delay |
| Theme config schema evolution | Medium | version field in JSONB, migrate on read |
| next-pwa deprecated workbox deps | Low | Switch to serwist if issues arise |

---

## Environment

- **Repo:** `C:\Users\Jethro\Documents\claude-code-projects\accrux-hobby-tracker`
- **Dev server:** `npm run dev` → localhost:3000
- **Tests:** `npm test` (vitest)
- **Type check:** `npx tsc --noEmit`
- **Supabase:** https://dgdcktccckgtnqidqvnw.supabase.co
