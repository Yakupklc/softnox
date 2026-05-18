-- profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  title text not null default 'Yönetici',
  created_at timestamptz default now()
);

-- contacts CRM table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  sirket_adi text not null,
  sahip_adi text not null,
  telefon text,
  not_kismi text,
  alinan_ucret numeric(12,2),
  anlasilan_ucret numeric(12,2),
  iletisim_tarihi date,
  sonuc text check (sonuc in ('Beklemede', 'Olumlu', 'Olumsuz', 'Devam Ediyor')) default 'Beklemede',
  yapilan_isler text,
  sozlesme_url text,

  user_id uuid references auth.users on delete set null
);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.handle_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Admin'),
    coalesce(new.raw_user_meta_data->>'title', 'Yönetici')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;

create policy "authenticated can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "authenticated full access on contacts"
  on public.contacts for all
  using (auth.role() = 'authenticated');

-- Storage bucket for contracts
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

create policy "authenticated upload contracts"
  on storage.objects for insert
  with check (bucket_id = 'contracts' and auth.role() = 'authenticated');

create policy "authenticated read contracts"
  on storage.objects for select
  using (bucket_id = 'contracts' and auth.role() = 'authenticated');

create policy "authenticated delete contracts"
  on storage.objects for delete
  using (bucket_id = 'contracts' and auth.role() = 'authenticated');
