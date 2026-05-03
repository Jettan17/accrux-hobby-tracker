create table user_achievements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index idx_user_achievements_user on user_achievements(user_id);
