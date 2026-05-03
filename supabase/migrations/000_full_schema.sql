-- ============================================================
-- Accrux Hobby Tracker — Full Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- 1. Star Systems (Hobbies)
create table star_systems (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon_storage_key text,
  theme_config jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_star_systems_user_id on star_systems(user_id);

-- 2. Skill Nodes (Planets)
create table skill_nodes (
  id text primary key,
  star_system_id text not null references star_systems(id) on delete cascade,
  label text not null,
  description text not null default '',
  variant text not null check (variant in ('gas-giant', 'asteroid', 'moon')),
  completed boolean not null default false,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_skill_nodes_star_system on skill_nodes(star_system_id);

-- 3. Skill Edges (Connections)
create table skill_edges (
  id text primary key,
  star_system_id text not null references star_systems(id) on delete cascade,
  source_node_id text not null references skill_nodes(id) on delete cascade,
  target_node_id text not null references skill_nodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (source_node_id, target_node_id)
);

create index idx_skill_edges_star_system on skill_edges(star_system_id);

-- 4. Todo Items
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

-- 5. User Achievements
create table user_achievements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index idx_user_achievements_user on user_achievements(user_id);

-- 6. Row Level Security
alter table star_systems enable row level security;
alter table skill_nodes enable row level security;
alter table skill_edges enable row level security;
alter table todo_items enable row level security;
alter table user_achievements enable row level security;

-- Star systems
create policy "Users can view own star systems"
  on star_systems for select using (auth.uid() = user_id);
create policy "Users can create own star systems"
  on star_systems for insert with check (auth.uid() = user_id);
create policy "Users can update own star systems"
  on star_systems for update using (auth.uid() = user_id);
create policy "Users can delete own star systems"
  on star_systems for delete using (auth.uid() = user_id);

-- Skill nodes
create policy "Users can view own skill nodes"
  on skill_nodes for select using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can create own skill nodes"
  on skill_nodes for insert with check (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can update own skill nodes"
  on skill_nodes for update using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can delete own skill nodes"
  on skill_nodes for delete using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );

-- Skill edges
create policy "Users can view own skill edges"
  on skill_edges for select using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can create own skill edges"
  on skill_edges for insert with check (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can update own skill edges"
  on skill_edges for update using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can delete own skill edges"
  on skill_edges for delete using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );

-- Todo items
create policy "Users can view own todos"
  on todo_items for select using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can create own todos"
  on todo_items for insert with check (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can update own todos"
  on todo_items for update using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );
create policy "Users can delete own todos"
  on todo_items for delete using (
    exists (select 1 from star_systems where id = star_system_id and user_id = auth.uid())
  );

-- User achievements
create policy "Users can view own achievements"
  on user_achievements for select using (auth.uid() = user_id);
create policy "Users can create own achievements"
  on user_achievements for insert with check (auth.uid() = user_id);
create policy "Users can delete own achievements"
  on user_achievements for delete using (auth.uid() = user_id);

-- 7. Storage bucket for hobby assets
insert into storage.buckets (id, name, public)
  values ('hobby-assets', 'hobby-assets', true);

create policy "Users can upload own assets"
  on storage.objects for insert
  with check (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Users can update own assets"
  on storage.objects for update
  using (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Users can delete own assets"
  on storage.objects for delete
  using (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Public read access for hobby assets"
  on storage.objects for select
  using (bucket_id = 'hobby-assets');
