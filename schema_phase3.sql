-- 1. Chat Groups Table
create table if not exists public.chat_groups (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  is_public boolean default false
);

alter table public.chat_groups enable row level security;

drop policy if exists "Chat groups are viewable by everyone" on chat_groups;
create policy "Chat groups are viewable by everyone"
  on chat_groups for select
  using ( true );

drop policy if exists "Authenticated users can create groups" on chat_groups;
create policy "Authenticated users can create groups"
  on chat_groups for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Group admins can update groups" on chat_groups;
create policy "Group admins can update groups"
  on chat_groups for update
  using ( auth.uid() = created_by );

-- 2. Chat Participants Table
create table if not exists public.chat_participants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  chat_id uuid references public.chat_groups(id) on delete cascade, -- Nullable for 1-on-1 chats if we use a different structure, but here assuming groups
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member', -- 'admin', 'member'
  unique(chat_id, user_id)
);

alter table public.chat_participants enable row level security;

drop policy if exists "Participants can view their groups" on chat_participants;
create policy "Participants can view their groups"
  on chat_participants for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can join public groups" on chat_participants;
create policy "Users can join public groups"
  on chat_participants for insert
  with check ( auth.role() = 'authenticated' );

-- 3. Reports Table (Moderation)
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reported_content_id uuid, -- Generic ID for post/comment/message
  content_type text not null, -- 'post', 'comment', 'message', 'user'
  reason text not null,
  status text default 'pending', -- 'pending', 'resolved', 'dismissed'
  admin_notes text
);

alter table public.reports enable row level security;

drop policy if exists "Users can create reports" on reports;
create policy "Users can create reports"
  on reports for insert
  with check ( auth.role() = 'authenticated' );

-- Only admins should view reports (requires admin role setup, skipping for MVP or allowing reporter to view own)
drop policy if exists "Users can view own reports" on reports;
create policy "Users can view own reports"
  on reports for select
  using ( auth.uid() = reporter_id );

-- 4. Blocks Table (User Blocking)
create table if not exists public.blocks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  unique(blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "Users can view their blocks" on blocks;
create policy "Users can view their blocks"
  on blocks for select
  using ( auth.uid() = blocker_id );

drop policy if exists "Users can create blocks" on blocks;
create policy "Users can create blocks"
  on blocks for insert
  with check ( auth.uid() = blocker_id );

drop policy if exists "Users can delete blocks" on blocks;
create policy "Users can delete blocks"
  on blocks for delete
  using ( auth.uid() = blocker_id );

-- 5. Saved Locations Table
create table if not exists public.saved_locations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text, -- e.g., "Home", "Work"
  pincode text not null,
  area text not null,
  latitude double precision,
  longitude double precision,
  is_default boolean default false
);

alter table public.saved_locations enable row level security;

drop policy if exists "Users can view own saved locations" on saved_locations;
create policy "Users can view own saved locations"
  on saved_locations for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can manage own saved locations" on saved_locations;
create policy "Users can manage own saved locations"
  on saved_locations for all
  using ( auth.uid() = user_id );

create index if not exists idx_saved_locations_user_id on saved_locations(user_id);
