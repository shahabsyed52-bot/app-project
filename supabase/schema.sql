-- Run this in Supabase SQL Editor once

-- Videos table
create table if not exists videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  youtube_id  text not null default '',
  category    text not null default 'nadeem-sarwar',
  artist      text not null default '',
  year        int  not null default 2025,
  description text default '',
  file_url    text default '',
  created_at  timestamptz default now()
);

-- Lyrics table
create table if not exists lyrics (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist     text not null default '',
  category   text not null default 'nadeem-sarwar',
  script     text not null default 'roman',
  lyrics     text not null,
  created_at timestamptz default now()
);

-- Settings table (key/value)
create table if not exists settings (
  key   text primary key,
  value jsonb
);

-- Insert default settings
insert into settings (key, value) values
  ('hero',        '{"type":"video","value":"wTM0hT5EAFY"}'::jsonb),
  ('appSettings', '{"siteName":"Noha.Manqabat","adminPassword":"matammedia2024"}'::jsonb)
on conflict (key) do nothing;

-- Enable Row Level Security but allow all (public read + service role write)
alter table videos  enable row level security;
alter table lyrics  enable row level security;
alter table settings enable row level security;

-- Allow anyone to read
create policy "Public read videos"  on videos  for select using (true);
create policy "Public read lyrics"  on lyrics  for select using (true);
create policy "Public read settings" on settings for select using (true);

-- Allow service role to do everything (used by API routes)
create policy "Service all videos"   on videos   for all using (true) with check (true);
create policy "Service all lyrics"   on lyrics   for all using (true) with check (true);
create policy "Service all settings" on settings for all using (true) with check (true);

-- Seed some initial videos
insert into videos (title, youtube_id, category, artist, year) values
  ('Aye Zainab',        'aXkqPNkKFfM', 'nadeem-sarwar', 'Nadeem Sarwar', 2023),
  ('Ya Hussain',        'b5INxKaE3zU', 'nadeem-sarwar', 'Nadeem Sarwar', 2022),
  ('Mera Imam',         '0cTxJeFBuoU', 'nadeem-sarwar', 'Nadeem Sarwar', 2022),
  ('Woh Karbala Gaye',  '1hJfSPBgpnk', 'mir-hasan-mir', 'Mir Hasan Mir', 2023),
  ('Ali Ali',           'ygT5kCKxd8o', 'mir-hasan-mir', 'Mir Hasan Mir', 2022),
  ('Mola Hussain',      'LDU_Txk06tM', 'ali-shanawar',  'Ali Shanawar',  2023),
  ('Ya Ali Madad',      'mGNtkdSLaA0', 'shadman-raza',  'Shadman Raza',  2023),
  ('Manqabat Imam Ali', 'YkgkThdzX-8', 'manqabat',      'Various',       2023),
  ('Mola Ali Manqabat', '5rBRFB62Hkk', 'manqabat',      'Various',       2022),
  ('Majlis e Aza',      'HvELBwf-sY8', 'majlis',        'Molana Sahab',  2023)
on conflict do nothing;
