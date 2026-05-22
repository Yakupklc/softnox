create table if not exists contact_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  user_name text,
  action text, -- 'olusturuldu', 'guncellendi'
  changes jsonb,
  created_at timestamptz default now()
);

alter table contact_logs enable row level security;
create policy "admin only logs" on contact_logs using (auth.role() = 'authenticated');
