create table public.work_packages (
  id text primary key,
  name text not null,
  site text not null,
  crew text not null,
  start_offset_days integer not null
);

alter table public.work_packages enable row level security;

create policy "Anyone can read work packages"
  on public.work_packages for select to anon using (true);

grant select on public.work_packages to anon;
grant all on public.work_packages to service_role;
