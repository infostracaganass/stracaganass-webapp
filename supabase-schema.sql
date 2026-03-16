create extension if not exists pgcrypto;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  place text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists push_subscribers (
  id uuid primary key default gen_random_uuid(),
  subscription jsonb,
  user_agent text,
  platform text,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_date on events(date asc);
create index if not exists idx_news_date on news(date desc);
