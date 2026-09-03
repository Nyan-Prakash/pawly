create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content jsonb not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  read_time_minutes integer not null check (read_time_minutes > 0),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  cover_image_url text null,
  tags text[] not null default '{}',
  sort_order integer not null default 0
);

create index if not exists articles_slug_idx on public.articles (slug);
create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_is_published_idx on public.articles (is_published);
create index if not exists articles_is_featured_idx on public.articles (is_featured);

alter table public.articles enable row level security;

create policy "authenticated users read published articles"
on public.articles
for select
to authenticated
using (is_published = true);

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute function update_updated_at();
