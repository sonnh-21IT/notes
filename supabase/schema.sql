-- Portfolio content schema
-- Public: anonymous read of published content
-- CMS writes: only the dedicated content-admin Auth user (is_content_admin)
-- Do NOT use your Supabase project/org owner login as the CMS account.
--
-- Setup: replace the UUID in is_content_admin() (twice below), then run this file
-- in the Supabase SQL editor. See README → Setup / Security.

drop table if exists note_tags cascade;
drop table if exists content_pages cascade;
drop table if exists site_settings cascade;
drop table if exists content cascade;
drop table if exists settings cascade;
drop table if exists notes cascade;
drop table if exists tags cascade;
drop table if exists categories cascade;

drop function if exists public.is_site_owner() cascade;
drop function if exists public.is_content_admin() cascade;

create table categories (
  id serial primary key,
  name text not null unique
);

create table tags (
  id serial primary key,
  name text not null unique
);

create table settings (
  id int primary key default 1 check (id = 1),
  header jsonb not null default '{}',
  footer jsonb not null default '{}'
);

create table content (
  slug text primary key,
  title text not null default '',
  body text not null default ''
);

create table notes (
  slug text primary key,
  title text not null,
  summary text not null default '',
  category_id int references categories(id) on delete set null,
  published_at date,
  cover_image text,
  body text not null default '',
  published boolean not null default true,
  pinned boolean not null default false
);

create table note_tags (
  note_slug text not null references notes(slug) on delete cascade,
  tag_id int not null references tags(id) on delete cascade,
  primary key (note_slug, tag_id)
);

alter table categories enable row level security;
alter table tags enable row level security;
alter table settings enable row level security;
alter table content enable row level security;
alter table notes enable row level security;
alter table note_tags enable row level security;

create policy "Public read categories"
  on categories for select
  using (true);

create policy "Public read tags"
  on tags for select
  using (true);

create policy "Public read settings"
  on settings for select
  using (true);

create policy "Public read content"
  on content for select
  using (true);

create policy "Public read published notes"
  on notes for select
  using (published = true);

create policy "Public read published note tags"
  on note_tags for select
  using (
    exists (
      select 1 from notes
      where notes.slug = note_tags.note_slug and notes.published = true
    )
  );

-- ---------------------------------------------------------------------------
-- Content admin Auth UUID (dedicated /admin login — not the project owner)
-- Paste the same UUID in BOTH places below.
-- ---------------------------------------------------------------------------
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

-- Drop legacy + current write policies so this block is idempotent
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

-- ---------------------------------------------------------------------------
-- Upgrade existing DBs without the DROP TABLE block above
-- Run from here after replacing the UUID. Idempotent (re-applies write policies).
-- ---------------------------------------------------------------------------
alter table notes add column if not exists pinned boolean not null default false;

drop function if exists public.is_site_owner() cascade;

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
