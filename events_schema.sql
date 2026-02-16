-- Create events table
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date timestamptz not null,
  location text not null,
  area text,
  category text not null, -- 'Sports', 'Cultural', 'Social', 'Other'
  organizer_id uuid references auth.users(id) not null,
  status text default 'upcoming', -- 'upcoming', 'cancelled', 'completed'
  created_at timestamptz default now()
);

-- Create event_participants table
create table if not exists event_participants (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'going', -- 'going', 'interested'
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Enable RLS
alter table events enable row level security;
alter table event_participants enable row level security;

-- Policies for events
create policy "Events are viewable by everyone"
  on events for select
  using (true);

create policy "Users can create events"
  on events for insert
  with check (auth.uid() = organizer_id);

create policy "Organizers can update their events"
  on events for update
  using (auth.uid() = organizer_id);

-- Policies for event_participants
create policy "Participants are viewable by everyone"
  on event_participants for select
  using (true);

create policy "Users can join events"
  on event_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their participation"
  on event_participants for update
  using (auth.uid() = user_id);

create policy "Users can leave events"
  on event_participants for delete
  using (auth.uid() = user_id);
