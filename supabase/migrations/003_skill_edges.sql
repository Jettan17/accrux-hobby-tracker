create table skill_edges (
  id text primary key,
  star_system_id text not null references star_systems(id) on delete cascade,
  source_node_id text not null references skill_nodes(id) on delete cascade,
  target_node_id text not null references skill_nodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (source_node_id, target_node_id)
);

create index idx_skill_edges_star_system on skill_edges(star_system_id);
