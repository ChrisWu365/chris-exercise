-- The supplied catalogue. No other table has a foreign key to it, so removing a
-- supplier's solutions doesn't affect planned installations or solution products.
create table public.solutions (
  internal_code text primary key,
  supplier_ref_code text not null unique,
  supplier text not null,
  orientation text not null,
  substrate text not null,
  service_classification text not null,
  service_type text,
  service_size text not null,
  integrity text not null,
  insulation text not null,
  service_type_option text not null,
  substrate_option text not null,
  raw_row jsonb not null
);

-- Everything below is SAMPLE data.
create table public.products (
  id text primary key,
  name text not null,
  unit text not null
);

create table public.solution_products (
  internal_code text not null,
  product_id text not null references public.products (id),
  quantity_per_installation numeric(12,3) not null check (quantity_per_installation > 0),
  primary key (internal_code, product_id)
);

create table public.planned_installations (
  id text primary key,
  work_package_id text not null references public.work_packages (id),
  internal_code text not null,
  installation_count integer not null check (installation_count > 0)
);

create table public.stock (
  product_id text primary key references public.products (id),
  quantity_on_hand numeric(12,3) not null check (quantity_on_hand >= 0)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['solutions', 'products', 'solution_products', 'planned_installations', 'stock']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "Anyone can read" on public.%I for select to anon using (true)', table_name);
    execute format('grant select on public.%I to anon', table_name);
    execute format('grant all on public.%I to service_role', table_name);
  end loop;
end $$;
