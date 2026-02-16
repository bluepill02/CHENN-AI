-- 1. Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  likes integer default 0
);

alter table public.comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on comments;
create policy "Comments are viewable by everyone"
  on comments for select
  using ( true );

drop policy if exists "Authenticated users can create comments" on comments;
create policy "Authenticated users can create comments"
  on comments for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Users can update own comments" on comments;
create policy "Users can update own comments"
  on comments for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own comments" on comments;
create policy "Users can delete own comments"
  on comments for delete
  using ( auth.uid() = user_id );

create index if not exists idx_comments_post_id on comments(post_id);

-- 2. Post Likes Table (for tracking who liked what)
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "Likes are viewable by everyone" on post_likes;
create policy "Likes are viewable by everyone"
  on post_likes for select
  using ( true );

drop policy if exists "Authenticated users can like posts" on post_likes;
create policy "Authenticated users can like posts"
  on post_likes for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can unlike posts" on post_likes;
create policy "Users can unlike posts"
  on post_likes for delete
  using ( auth.uid() = user_id );

create index if not exists idx_post_likes_post_id on post_likes(post_id);
create index if not exists idx_post_likes_user_id on post_likes(user_id);

-- 3. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'like', 'comment', 'alert', 'system'
  title text,
  content text not null,
  link text,
  is_read boolean default false,
  metadata jsonb
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
  on notifications for update
  using ( auth.uid() = user_id );

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_created_at on notifications(created_at desc);

-- 4. Quiz Questions Table (Chennai Gethu)
create table if not exists public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  question text not null,
  options jsonb not null, -- Array of strings
  correct_index integer not null,
  explanation text,
  difficulty text default 'medium', -- 'easy', 'medium', 'hard'
  category text default 'slang' -- 'slang', 'history', 'cinema'
);

alter table public.quiz_questions enable row level security;

drop policy if exists "Quiz questions viewable by everyone" on quiz_questions;
create policy "Quiz questions viewable by everyone"
  on quiz_questions for select
  using ( true );

-- 5. Daily Quotes Table (Auto Anna)
create table if not exists public.daily_quotes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  quote text not null,
  author text, -- e.g., 'Auto Anna'
  category text default 'humor'
);

alter table public.daily_quotes enable row level security;

drop policy if exists "Quotes viewable by everyone" on daily_quotes;
create policy "Quotes viewable by everyone"
  on daily_quotes for select
  using ( true );

-- 6. Storage Buckets Setup (Note: SQL for storage buckets is specific to Supabase extensions, 
-- but we can set up the policies assuming buckets exist. 
-- User needs to create 'avatars' and 'post_images' buckets in Storage UI if not possible via SQL here)

-- Attempt to create buckets via SQL (works if storage extension is enabled and user has permissions)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post_images', 'post_images', true)
on conflict (id) do nothing;

-- Storage Policies for Avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.uid() = owner );

-- Storage Policies for Post Images
create policy "Post images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'post_images' );

create policy "Anyone can upload a post image"
  on storage.objects for insert
  with check ( bucket_id = 'post_images' and auth.role() = 'authenticated' );

create policy "Users can update their own post image"
  on storage.objects for update
  using ( bucket_id = 'post_images' and auth.uid() = owner )
  with check ( bucket_id = 'post_images' and auth.uid() = owner );

-- Triggers for updated_at
create trigger comments_updated_at before update on public.comments for each row execute procedure handle_updated_at();
