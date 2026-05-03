-- Enable RLS on all tables
alter table star_systems enable row level security;
alter table skill_nodes enable row level security;
alter table skill_edges enable row level security;
alter table todo_items enable row level security;
alter table user_achievements enable row level security;

-- Star systems: direct user_id check
create policy "Users can view own star systems"
  on star_systems for select using (auth.uid() = user_id);

create policy "Users can create own star systems"
  on star_systems for insert with check (auth.uid() = user_id);

create policy "Users can update own star systems"
  on star_systems for update using (auth.uid() = user_id);

create policy "Users can delete own star systems"
  on star_systems for delete using (auth.uid() = user_id);

-- Skill nodes: ownership via star_systems
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

-- Skill edges: ownership via star_systems
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

-- Todo items: ownership via star_systems
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

-- User achievements: direct user_id check
create policy "Users can view own achievements"
  on user_achievements for select using (auth.uid() = user_id);

create policy "Users can create own achievements"
  on user_achievements for insert with check (auth.uid() = user_id);

create policy "Users can delete own achievements"
  on user_achievements for delete using (auth.uid() = user_id);
