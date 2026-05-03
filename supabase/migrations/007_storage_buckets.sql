-- Create storage bucket for hobby assets (icons, theme images)
insert into storage.buckets (id, name, public)
  values ('hobby-assets', 'hobby-assets', true);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own assets"
  on storage.objects for insert
  with check (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own assets
create policy "Users can update own assets"
  on storage.objects for update
  using (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own assets
create policy "Users can delete own assets"
  on storage.objects for delete
  using (
    bucket_id = 'hobby-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access for hobby assets
create policy "Public read access for hobby assets"
  on storage.objects for select
  using (bucket_id = 'hobby-assets');
