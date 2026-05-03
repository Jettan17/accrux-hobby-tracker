create table todo_items (
  id text primary key,
  star_system_id text not null references star_systems(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_todo_items_star_system on todo_items(star_system_id, sort_order);
