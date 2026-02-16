-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  area text,
  language text default 'en',
  bio text,
  share_location boolean default true,
  
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Handle New User Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Posts Table (Community Feed)
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  image_url text,
  user_id uuid references public.profiles(id) not null,
  area text,
  category text,
  likes integer default 0,
  comments_count integer default 0
);

alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone." on posts;
create policy "Posts are viewable by everyone."
  on posts for select
  using ( true );

drop policy if exists "Authenticated users can create posts." on posts;
create policy "Authenticated users can create posts."
  on posts for insert
  with check ( auth.role() = 'authenticated' );

-- 4. Messages Table (Chat)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  sender_id uuid references public.profiles(id) not null,
  chat_id text not null,
  is_read boolean default false
);

alter table public.messages enable row level security;

drop policy if exists "Messages are viewable by participants." on messages;
create policy "Messages are viewable by participants."
  on messages for select
  using ( true );

drop policy if exists "Authenticated users can send messages." on messages;
create policy "Authenticated users can send messages."
  on messages for insert
  with check ( auth.role() = 'authenticated' );

-- 5. Auto Share Posts Table (Ride Sharing)
create table if not exists public.auto_share_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_location text not null,
  to_location text not null,
  seats_available integer not null check (seats_available > 0 and seats_available <=10),
  pincode text not null,
  area text,
  departure_time timestamp with time zone,
  vehicle_type text default 'auto',
  fare_sharing boolean default true,
  notes text,
  status text default 'active' check (status in ('active', 'filled', 'cancelled', 'expired')),
  views_count integer default 0,
  contact_via text default 'chat' check (contact_via in ('chat', 'phone', 'both'))
);

alter table public.auto_share_posts enable row level security;

drop policy if exists "Auto share posts viewable by everyone" on auto_share_posts;
create policy "Auto share posts viewable by everyone"
  on auto_share_posts for select
  using ( true );

drop policy if exists "Authenticated users can create auto share posts" on auto_share_posts;
create policy "Authenticated users can create auto share posts"
  on auto_share_posts for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own auto share posts" on auto_share_posts;
create policy "Users can update own auto share posts"
  on auto_share_posts for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own auto share posts" on auto_share_posts;
create policy "Users can delete own auto share posts"
  on auto_share_posts for delete
  using ( auth.uid() = user_id );

create index if not exists idx_auto_share_pincode on auto_share_posts(pincode);
create index if not exists idx_auto_share_status on auto_share_posts(status);

-- Auto Share Functions
create or replace function expire_old_auto_share_posts()
returns void as $$
begin
  update public.auto_share_posts
  set status = 'expired'
  where expires_at < now() and status = 'active';
end;
$$ language plpgsql security definer;

create or replace function increment_auto_share_views(post_id uuid)
returns void as $$
begin
  update public.auto_share_posts
  set views_count = views_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- 6. Food Hunt Posts Table
create table if not exists public.food_hunt_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  restaurant_name text not null,
  dish_name text,
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  price_range text,
  image_url text,
  pincode text not null,
  area text,
  likes integer default 0
);

alter table public.food_hunt_posts enable row level security;

drop policy if exists "Food hunt posts viewable by everyone" on food_hunt_posts;
create policy "Food hunt posts viewable by everyone"
  on food_hunt_posts for select
  using ( true );

drop policy if exists "Authenticated users can create food hunt posts" on food_hunt_posts;
create policy "Authenticated users can create food hunt posts"
  on food_hunt_posts for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own food hunt posts" on food_hunt_posts;
create policy "Users can update own food hunt posts"
  on food_hunt_posts for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own food hunt posts" on food_hunt_posts;
create policy "Users can delete own food hunt posts"
  on food_hunt_posts for delete
  using ( auth.uid() = user_id );

create index if not exists idx_food_hunt_pincode on food_hunt_posts(pincode);

-- 7. Cinema Posts Table
create table if not exists public.cinema_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  movie_name text not null,
  theater_name text,
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  post_type text default 'review' check (post_type in ('review', 'discussion')),
  pincode text,
  area text,
  likes integer default 0
);

alter table public.cinema_posts enable row level security;

drop policy if exists "Cinema posts viewable by everyone" on cinema_posts;
create policy "Cinema posts viewable by everyone"
  on cinema_posts for select
  using ( true );

drop policy if exists "Authenticated users can create cinema posts" on cinema_posts;
create policy "Authenticated users can create cinema posts"
  on cinema_posts for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own cinema posts" on cinema_posts;
create policy "Users can update own cinema posts"
  on cinema_posts for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own cinema posts" on cinema_posts;
create policy "Users can delete own cinema posts"
  on cinema_posts for delete
  using ( auth.uid() = user_id );

-- 8. Kaapi Jobs Table
create table if not exists public.kaapi_jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_title text not null,
  description text not null,
  location text,
  salary_range text,
  contact_info text,
  likes integer default 0
);

alter table public.kaapi_jobs enable row level security;

drop policy if exists "Kaapi jobs viewable by everyone" on kaapi_jobs;
create policy "Kaapi jobs viewable by everyone"
  on kaapi_jobs for select
  using ( true );

drop policy if exists "Authenticated users can create kaapi jobs" on kaapi_jobs;
create policy "Authenticated users can create kaapi jobs"
  on kaapi_jobs for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own kaapi jobs" on kaapi_jobs;
create policy "Users can update own kaapi jobs"
  on kaapi_jobs for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own kaapi jobs" on kaapi_jobs;
create policy "Users can delete own kaapi jobs"
  on kaapi_jobs for delete
  using ( auth.uid() = user_id );

-- 9. Business Profiles Table
create table if not exists public.business_profiles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_name text not null,
  category text not null,
  description text,
  location text not null,
  contact_number text not null,
  is_verified boolean default false,
  image_url text,
  opening_hours text,
  price_range text,
  rating numeric default 0,
  review_count integer default 0
);

alter table public.business_profiles enable row level security;

drop policy if exists "Business profiles viewable by everyone" on business_profiles;
create policy "Business profiles viewable by everyone"
  on business_profiles for select
  using ( true );

drop policy if exists "Authenticated users can create business profiles" on business_profiles;
create policy "Authenticated users can create business profiles"
  on business_profiles for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own business profile" on business_profiles;
create policy "Users can update own business profile"
  on business_profiles for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own business profile" on business_profiles;
create policy "Users can delete own business profile"
  on business_profiles for delete
  using ( auth.uid() = user_id );

create index if not exists idx_business_profiles_category on business_profiles(category);

-- 10. Service Reviews Table
create table if not exists public.service_reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  review_text text,
  is_verified_visit boolean default false
);

alter table public.service_reviews enable row level security;

drop policy if exists "Reviews viewable by everyone" on service_reviews;
create policy "Reviews viewable by everyone"
  on service_reviews for select
  using ( true );

drop policy if exists "Authenticated users can create reviews" on service_reviews;
create policy "Authenticated users can create reviews"
  on service_reviews for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own reviews" on service_reviews;
create policy "Users can update own reviews"
  on service_reviews for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own reviews" on service_reviews;
create policy "Users can delete own reviews"
  on service_reviews for delete
  using ( auth.uid() = user_id );

-- Business Stats Trigger
create or replace function update_business_stats()
returns trigger as $$
begin
  update public.business_profiles
  set 
    rating = (select coalesce(avg(rating), 0) from public.service_reviews where business_id = coalesce(new.business_id, old.business_id)),
    review_count = (select count(*) from public.service_reviews where business_id = coalesce(new.business_id, old.business_id))
  where id = coalesce(new.business_id, old.business_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_added on public.service_reviews;
create trigger on_review_added
  after insert or update or delete on public.service_reviews
  for each row execute procedure update_business_stats();

-- Common Trigger for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure handle_updated_at();

drop trigger if exists auto_share_posts_updated_at on public.auto_share_posts;
create trigger auto_share_posts_updated_at before update on public.auto_share_posts for each row execute procedure handle_updated_at();

drop trigger if exists food_hunt_posts_updated_at on public.food_hunt_posts;
create trigger food_hunt_posts_updated_at before update on public.food_hunt_posts for each row execute procedure handle_updated_at();

drop trigger if exists cinema_posts_updated_at on public.cinema_posts;
create trigger cinema_posts_updated_at before update on public.cinema_posts for each row execute procedure handle_updated_at();

drop trigger if exists kaapi_jobs_updated_at on public.kaapi_jobs;
create trigger kaapi_jobs_updated_at before update on public.kaapi_jobs for each row execute procedure handle_updated_at();

drop trigger if exists business_profiles_updated_at on public.business_profiles;
create trigger business_profiles_updated_at before update on public.business_profiles for each row execute procedure handle_updated_at();