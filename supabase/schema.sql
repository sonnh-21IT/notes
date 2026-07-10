-- Portfolio schema (init)
-- Creates tables, public-read RLS, and the note-covers storage bucket.
-- Does NOT grant CMS write access — run admin.sql after this.
--
-- Fresh project: run this entire file in Supabase → SQL Editor.
-- Seeds default settings + fixed static page rows (about, notes, not-found) with empty body.
-- Warning: DROP TABLE removes existing CMS data.

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

create policy "Public read note covers"
  on storage.objects for select
  using (bucket_id = 'note-covers');

-- Default chrome + fixed static page rows (empty body — edit in /admin/content)
insert into settings (id, header, footer) values (
  1,
  jsonb_build_object(
    'title', 'Portfolio',
    'tagline', 'Notes on building for the web'
  ),
  jsonb_build_object('socialLinks', '[]'::jsonb)
);

insert into content (slug, title, body) values
  ('about', 'About', ''),
  ('notes', 'Notes', ''),
  ('not-found', 'Page not found', '');
