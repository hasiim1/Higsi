-- Higsi Database Schema

-- 1. Profiles (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  streak integer default 1,
  last_active timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. User Settings
create table public.user_settings (
  id uuid references public.profiles on delete cascade primary key,
  theme text default 'dark',
  pomodoro_duration integer default 25, -- in minutes
  short_break_duration integer default 5, -- in minutes
  long_break_duration integer default 15, -- in minutes
  auto_start_breaks boolean default false,
  auto_start_pomo boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view their own settings" on public.user_settings
  for select using (auth.uid() = id);

create policy "Users can update their own settings" on public.user_settings
  for update using (auth.uid() = id);

-- 3. Courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  name text not null,
  code text,
  lecturer text,
  location text,
  email text,
  credits integer,
  cover_url text,
  schedule text[] default '{}',
  fee_status text,
  archived boolean default false,
  progress integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.courses enable row level security;

create policy "Users can view their own courses" on public.courses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own courses" on public.courses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own courses" on public.courses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own courses" on public.courses
  for delete using (auth.uid() = user_id);

-- 4. Modules
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses on delete cascade not null,
  name text not null,
  order_index integer default 0,
  description text,
  created_at timestamp with time zone default now()
);

alter table public.modules enable row level security;

create policy "Users can view modules of their courses" on public.modules
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can insert modules to their courses" on public.modules
  for insert with check (
    exists (
      select 1 from public.courses
      where courses.id = course_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can update modules of their courses" on public.modules
  for update using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can delete modules of their courses" on public.modules
  for delete using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id and courses.user_id = auth.uid()
    )
  );

-- 5. Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules on delete cascade not null,
  name text not null,
  order_index integer default 0,
  content text default '',
  status text default 'not_started', -- 'not_started', 'in_progress', 'completed'
  created_at timestamp with time zone default now()
);

alter table public.lessons enable row level security;

create policy "Users can view lessons" on public.lessons
  for select using (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = lessons.module_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can insert lessons" on public.lessons
  for insert with check (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = module_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can update lessons" on public.lessons
  for update using (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = lessons.module_id and courses.user_id = auth.uid()
    )
  );

create policy "Users can delete lessons" on public.lessons
  for delete using (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = lessons.module_id and courses.user_id = auth.uid()
    )
  );

-- 6. Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  course_id uuid references public.courses on delete set null,
  name text not null,
  status text default 'To Do', -- 'To Do', 'In Progress', 'Completed'
  priority text default 'Medium', -- 'High', 'Medium', 'Low'
  due_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- 7. Assignments
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  course_id uuid references public.courses on delete set null,
  name text not null,
  type text default 'Assignment', -- 'Assignment', 'Project', 'Midterm', 'Final', 'Presentation'
  status text default 'Not started', -- 'Not started', 'In progress', 'Done'
  priority text default 'Medium', -- 'High', 'Medium', 'Low'
  deadline timestamp with time zone,
  score integer,
  grade text,
  created_at timestamp with time zone default now()
);

alter table public.assignments enable row level security;

create policy "Users can view their own assignments" on public.assignments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own assignments" on public.assignments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own assignments" on public.assignments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own assignments" on public.assignments
  for delete using (auth.uid() = user_id);

-- 8. Notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  course_id uuid references public.courses on delete set null,
  name text not null,
  content text default '',
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.notes enable row level security;

create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- 9. Focus Sessions
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  course_id uuid references public.courses on delete set null,
  duration integer not null, -- in seconds
  type text not null, -- 'Deep Work', 'Break'
  created_at timestamp with time zone default now()
);

alter table public.focus_sessions enable row level security;

create policy "Users can view their own focus sessions" on public.focus_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own focus sessions" on public.focus_sessions
  for insert with check (auth.uid() = user_id);

-- 10. Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  title text not null,
  content text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- 11. Analytics Events
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null default auth.uid(),
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

alter table public.analytics_events enable row level security;

create policy "Users can view their own analytics events" on public.analytics_events
  for select using (auth.uid() = user_id);

create policy "Users can insert their own analytics events" on public.analytics_events
  for insert with check (auth.uid() = user_id);

-- Automatically create profile and settings on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_settings (id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
