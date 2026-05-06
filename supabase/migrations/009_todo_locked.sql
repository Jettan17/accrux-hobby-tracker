-- Manual lock flag for todo items (visualized as locked planets in the skill tree).
-- Independent of edges/prerequisites: toggled by the user, never auto-unlocked.
ALTER TABLE todo_items
  ADD COLUMN locked boolean not null default false;
