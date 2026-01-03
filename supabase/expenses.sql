-- Create expenses table
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  title text not null,
  amount decimal(10,2) not null default 0,
  category text,
  type text default 'expense',
  remark text
);

-- Policy to allow all access (since this is a simple local-first style app for now, we assume authenticated users can do everything)
alter table expenses enable row level security;

create policy "Enable all access for authenticated users" on expenses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Or if you want public access for development (matching previous implicit rules if any)
create policy "Enable all access for anon" on expenses
  for all using (true) with check (true);
