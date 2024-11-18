-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  email text not null,
  role text not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_role check (role in ('user', 'admin'))
);

-- Create transcriptions table
create table if not exists public.transcriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  audio_path text not null,
  text_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.transcriptions enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Users can view own transcriptions"
  on public.transcriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transcriptions"
  on public.transcriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own transcriptions"
  on public.transcriptions for delete
  using (auth.uid() = user_id);

create policy "Admin can view all transcriptions"
  on public.transcriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admin can delete any transcription"
  on public.transcriptions for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create storage bucket
insert into storage.buckets (id, name)
values ('audio-files', 'audio-files')
on conflict (id) do nothing;

-- Enable RLS on storage
create policy "Users can upload own audio files"
  on storage.objects for insert
  with check (
    bucket_id = 'audio-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own audio files"
  on storage.objects for select
  using (
    bucket_id = 'audio-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admin can view all audio files"
  on storage.objects for select
  using (
    bucket_id = 'audio-files' and
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );