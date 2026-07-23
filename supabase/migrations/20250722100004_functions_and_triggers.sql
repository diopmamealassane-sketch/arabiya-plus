-- Arabiya+ — Migration 4/5
-- Housekeeping functions and triggers.

-- Generic updated_at stamping, reused by every table that has the column.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_units_updated_at before update on units
  for each row execute function set_updated_at();
create trigger trg_lessons_updated_at before update on lessons
  for each row execute function set_updated_at();
create trigger trg_words_updated_at before update on words
  for each row execute function set_updated_at();
create trigger trg_steps_updated_at before update on steps
  for each row execute function set_updated_at();
create trigger trg_user_stats_updated_at before update on user_stats
  for each row execute function set_updated_at();
create trigger trg_user_progress_updated_at before update on user_progress
  for each row execute function set_updated_at();
create trigger trg_user_word_review_updated_at before update on user_word_review
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- Auto-provision a stats row and a free subscription row the moment
-- someone signs up, so the app never has to handle "row doesn't exist yet".
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id) values (new.id);
  insert into public.subscriptions (user_id, status) values (new.id, 'free');
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
