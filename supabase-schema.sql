-- Ejecutar en Supabase → SQL Editor → New query

create table if not exists recipes (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists shopping_items (
  id      bigserial primary key,
  name    text not null,
  qty     text default '',
  section text default '',
  done    boolean default false
);

create table if not exists stats (
  key   text primary key,
  value integer default 0
);

-- Sin autenticación (app personal privada)
alter table recipes       disable row level security;
alter table shopping_items disable row level security;
alter table stats          disable row level security;
