-- Portfolio content schema (public read, admin write via service role)

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
  published boolean not null default true
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

-- Admin: authenticated users
create policy "Admin read settings"
  on settings for select to authenticated using (true);
create policy "Admin write settings"
  on settings for insert to authenticated with check (true);
create policy "Admin update settings"
  on settings for update to authenticated using (true) with check (true);

create policy "Admin read content"
  on content for select to authenticated using (true);
create policy "Admin write content"
  on content for insert to authenticated with check (true);
create policy "Admin update content"
  on content for update to authenticated using (true) with check (true);

create policy "Admin read categories"
  on categories for select to authenticated using (true);
create policy "Admin write categories"
  on categories for insert to authenticated with check (true);
create policy "Admin update categories"
  on categories for update to authenticated using (true) with check (true);
create policy "Admin delete categories"
  on categories for delete to authenticated using (true);

create policy "Admin read tags"
  on tags for select to authenticated using (true);
create policy "Admin write tags"
  on tags for insert to authenticated with check (true);
create policy "Admin update tags"
  on tags for update to authenticated using (true) with check (true);
create policy "Admin delete tags"
  on tags for delete to authenticated using (true);

create policy "Admin read all notes"
  on notes for select to authenticated using (true);
create policy "Admin write notes"
  on notes for insert to authenticated with check (true);
create policy "Admin update notes"
  on notes for update to authenticated using (true) with check (true);
create policy "Admin delete notes"
  on notes for delete to authenticated using (true);

create policy "Admin read note tags"
  on note_tags for select to authenticated using (true);
create policy "Admin write note tags"
  on note_tags for insert to authenticated with check (true);
create policy "Admin update note tags"
  on note_tags for update to authenticated using (true) with check (true);
create policy "Admin delete note tags"
  on note_tags for delete to authenticated using (true);
