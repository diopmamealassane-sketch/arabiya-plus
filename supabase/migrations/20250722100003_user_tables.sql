-- Arabiya+ — Migration 3/5
-- Per-user data. All writes to these tables happen through the
-- `submit-answer` and `stripe-webhook` Edge Functions (service role) per
-- the architecture doc — never trust the client to report its own XP or
-- subscription status. RLS below only ever grants SELECT to `authenticated`.

create table user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp_total int not null default 0,
  streak_count int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status progress_status not null default 'not_started',
  accuracy numeric(5,2),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table user_word_review (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null references words(id) on delete cascade,
  box_level int not null default 1 check (box_level between 1 and 5), -- Leitner boxes
  next_review_at timestamptz not null default now(),
  last_result review_result,
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  status subscription_status not null default 'free',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index idx_user_progress_lesson_id on user_progress(lesson_id);
create index idx_user_word_review_next_review on user_word_review(user_id, next_review_at);
