-- Enable realtime for all application tables
alter publication supabase_realtime add table star_systems;
alter publication supabase_realtime add table skill_nodes;
alter publication supabase_realtime add table skill_edges;
alter publication supabase_realtime add table todo_items;
alter publication supabase_realtime add table user_achievements;
