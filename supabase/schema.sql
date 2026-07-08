-- Portfolio content schema (public read, owner-only admin writes via RLS)

drop table if exists note_tags cascade;
drop table if exists content_pages cascade;
drop table if exists site_settings cascade;
drop table if exists content cascade;
drop table if exists settings cascade;
drop table if exists notes cascade;
drop table if exists tags cascade;
drop table if exists categories cascade;

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

-- Owner-only admin (replace UUID — see README Security)
drop function if exists public.is_site_owner();

create or replace function public.is_site_owner()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid;
$$;

grant execute on function public.is_site_owner() to authenticated;

-- Owner: read drafts + write CMS data
create policy "Owner read all notes"
  on notes for select to authenticated
  using (is_site_owner());

create policy "Owner read all note tags"
  on note_tags for select to authenticated
  using (is_site_owner());

create policy "Owner write settings"
  on settings for insert to authenticated
  with check (is_site_owner());

create policy "Owner update settings"
  on settings for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner write content"
  on content for insert to authenticated
  with check (is_site_owner());

create policy "Owner update content"
  on content for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner write categories"
  on categories for insert to authenticated
  with check (is_site_owner());

create policy "Owner update categories"
  on categories for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner delete categories"
  on categories for delete to authenticated
  using (is_site_owner());

create policy "Owner write tags"
  on tags for insert to authenticated
  with check (is_site_owner());

create policy "Owner update tags"
  on tags for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner delete tags"
  on tags for delete to authenticated
  using (is_site_owner());

create policy "Owner write notes"
  on notes for insert to authenticated
  with check (is_site_owner());

create policy "Owner update notes"
  on notes for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner delete notes"
  on notes for delete to authenticated
  using (is_site_owner());

create policy "Owner write note tags"
  on note_tags for insert to authenticated
  with check (is_site_owner());

create policy "Owner update note tags"
  on note_tags for update to authenticated
  using (is_site_owner())
  with check (is_site_owner());

create policy "Owner delete note tags"
  on note_tags for delete to authenticated
  using (is_site_owner());

-- Upgrade existing DBs without re-running the drops above (Supabase SQL editor)
alter table notes add column if not exists pinned boolean not null default false;

create or replace function public.is_site_owner()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid;
$$;

grant execute on function public.is_site_owner() to authenticated;