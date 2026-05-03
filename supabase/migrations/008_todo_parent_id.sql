-- Add parent_id to todo_items for nested/hierarchical todos
ALTER TABLE todo_items
  ADD COLUMN parent_id text REFERENCES todo_items(id) ON DELETE CASCADE;

CREATE INDEX idx_todo_items_parent ON todo_items(parent_id);
