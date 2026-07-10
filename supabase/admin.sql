-- Content-admin setup (CMS write access)
-- Run after schema.sql (or on an existing DB that already has tables).
-- Safe to re-run: replaces is_content_admin() and re-applies write policies.
--
-- 1. Authentication → Users → Add user (dedicated CMS login, not project owner)
-- 2. Copy User UID below
-- 3. Run this file in Supabase → SQL Editor

-- Paste your content-admin Auth UUID here (one place only):
create or replace function public.is_content_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid;
$$;

grant execute on function public.is_content_admin() to authenticated;

-- Legacy helper from older installs
drop function if exists public.is_site_owner() cascade;

-- Optional column for DBs created before `pinned` existed
alter table notes add column if not exists pinned boolean not null default false;

-- Storage bucket (idempotent if schema.sql already created it)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-covers',
  'note-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop legacy + current write policies so this file is idempotent
drop policy if exists "Public read note covers" on storage.objects;
drop policy if exists "Owner upload note covers" on storage.objects;
drop policy if exists "Owner update note covers" on storage.objects;
drop policy if exists "Owner delete note covers" on storage.objects;
drop policy if exists "Content admin upload note covers" on storage.objects;
drop policy if exists "Content admin update note covers" on storage.objects;
drop policy if exists "Content admin delete note covers" on storage.objects;

drop policy if exists "Owner read all notes" on notes;
drop policy if exists "Owner read all note tags" on note_tags;
drop policy if exists "Owner write settings" on settings;
drop policy if exists "Owner update settings" on settings;
drop policy if exists "Owner write content" on content;
drop policy if exists "Owner update content" on content;
drop policy if exists "Owner write categories" on categories;
drop policy if exists "Owner update categories" on categories;
drop policy if exists "Owner delete categories" on categories;
drop policy if exists "Owner write tags" on tags;
drop policy if exists "Owner update tags" on tags;
drop policy if exists "Owner delete tags" on tags;
drop policy if exists "Owner write notes" on notes;
drop policy if exists "Owner update notes" on notes;
drop policy if exists "Owner delete notes" on notes;
drop policy if exists "Owner write note tags" on note_tags;
drop policy if exists "Owner update note tags" on note_tags;
drop policy if exists "Owner delete note tags" on note_tags;

drop policy if exists "Content admin read all notes" on notes;
drop policy if exists "Content admin read all note tags" on note_tags;
drop policy if exists "Content admin write settings" on settings;
drop policy if exists "Content admin update settings" on settings;
drop policy if exists "Content admin write content" on content;
drop policy if exists "Content admin update content" on content;
drop policy if exists "Content admin write categories" on categories;
drop policy if exists "Content admin update categories" on categories;
drop policy if exists "Content admin delete categories" on categories;
drop policy if exists "Content admin write tags" on tags;
drop policy if exists "Content admin update tags" on tags;
drop policy if exists "Content admin delete tags" on tags;
drop policy if exists "Content admin write notes" on notes;
drop policy if exists "Content admin update notes" on notes;
drop policy if exists "Content admin delete notes" on notes;
drop policy if exists "Content admin write note tags" on note_tags;
drop policy if exists "Content admin update note tags" on note_tags;
drop policy if exists "Content admin delete note tags" on note_tags;

create policy "Public read note covers"
  on storage.objects for select
  using (bucket_id = 'note-covers');

create policy "Content admin upload note covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'note-covers' and public.is_content_admin());

create policy "Content admin update note covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'note-covers' and public.is_content_admin())
  with check (bucket_id = 'note-covers' and public.is_content_admin());

create policy "Content admin delete note covers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'note-covers' and public.is_content_admin());

create policy "Content admin read all notes"
  on notes for select to authenticated
  using (is_content_admin());

create policy "Content admin read all note tags"
  on note_tags for select to authenticated
  using (is_content_admin());

create policy "Content admin write settings"
  on settings for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update settings"
  on settings for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin write content"
  on content for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update content"
  on content for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin write categories"
  on categories for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update categories"
  on categories for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin delete categories"
  on categories for delete to authenticated
  using (is_content_admin());

create policy "Content admin write tags"
  on tags for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update tags"
  on tags for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin delete tags"
  on tags for delete to authenticated
  using (is_content_admin());

create policy "Content admin write notes"
  on notes for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update notes"
  on notes for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin delete notes"
  on notes for delete to authenticated
  using (is_content_admin());

create policy "Content admin write note tags"
  on note_tags for insert to authenticated
  with check (is_content_admin());

create policy "Content admin update note tags"
  on note_tags for update to authenticated
  using (is_content_admin())
  with check (is_content_admin());

create policy "Content admin delete note tags"
  on note_tags for delete to authenticated
  using (is_content_admin());
