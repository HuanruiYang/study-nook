-- 手边书房 Supabase schema
-- 在 Supabase SQL Editor 中执行一次。Auth 使用 Email Magic Link。

create table if not exists public.books (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  translator text,
  cover_color text not null,
  status text not null check (status in ('want', 'reading', 'done')),
  started_at timestamptz,
  finished_at timestamptz,
  tags text[] not null default '{}',
  progress integer check (progress is null or (progress >= 0 and progress <= 100)),
  current_page integer,
  total_pages integer,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.review_layers (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  stage text check (stage is null or stage in ('before', 'during', 'after')),
  label text not null,
  color text not null,
  content text not null,
  word_count integer not null default 0,
  created_at timestamptz not null
);

create table if not exists public.quotes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  content text not null,
  reflection text,
  page integer,
  location text,
  source text not null check (source in ('manual', 'kindle')),
  highlight_color text check (highlight_color is null or highlight_color in ('yellow', 'blue', 'pink', 'orange')),
  created_at timestamptz not null
);

create table if not exists public.sparks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text references public.books(id) on delete cascade,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null
);

create index if not exists books_user_updated_idx on public.books(user_id, updated_at desc);
create index if not exists review_layers_user_book_idx on public.review_layers(user_id, book_id, created_at desc);
create index if not exists quotes_user_book_idx on public.quotes(user_id, book_id, created_at desc);
create index if not exists sparks_user_book_idx on public.sparks(user_id, book_id, created_at desc);

alter table public.books enable row level security;
alter table public.review_layers enable row level security;
alter table public.quotes enable row level security;
alter table public.sparks enable row level security;

drop policy if exists "Users can manage own books" on public.books;
drop policy if exists "Users can manage own review layers" on public.review_layers;
drop policy if exists "Users can manage own quotes" on public.quotes;
drop policy if exists "Users can manage own sparks" on public.sparks;

create policy "Users can manage own books"
on public.books
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own review layers"
on public.review_layers
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own quotes"
on public.quotes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own sparks"
on public.sparks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
