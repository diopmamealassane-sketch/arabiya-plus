-- Arabiya+ — Migration 5/5
-- Row Level Security.
--
-- Content tables: publicly readable, no client-side writes at all — content
-- is authored by the admin pipeline using the service role, which bypasses
-- RLS entirely.
--
-- User tables: a user may only ever SELECT their own rows. There are no
-- INSERT/UPDATE policies for `authenticated` on user_stats, user_progress,
-- user_word_review or subscriptions — per the architecture doc, all writes
-- to these tables go through the `submit-answer` and `stripe-webhook` Edge
-- Functions (service role), so a user can never falsify their own XP,
-- progress or subscription status from the browser.

alter table units enable row level security;
alter table lessons enable row level security;
alter table words enable row level security;
alter table steps enable row level security;
alter table step_words enable row level security;

create policy "Public can read units" on units for select using (true);
create policy "Public can read lessons" on lessons for select using (true);
create policy "Public can read words" on words for select using (true);
create policy "Public can read steps" on steps for select using (true);
create policy "Public can read step_words" on step_words for select using (true);

alter table user_stats enable row level security;
alter table user_progress enable row level security;
alter table user_word_review enable row level security;
alter table subscriptions enable row level security;

create policy "Users can view own stats" on user_stats
  for select using (auth.uid() = user_id);

create policy "Users can view own progress" on user_progress
  for select using (auth.uid() = user_id);

create policy "Users can view own word review queue" on user_word_review
  for select using (auth.uid() = user_id);

create policy "Users can view own subscription" on subscriptions
  for select using (auth.uid() = user_id);
