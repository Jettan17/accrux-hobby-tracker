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
