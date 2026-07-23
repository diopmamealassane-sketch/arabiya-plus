-- Arabiya+ — Migration 2/5
-- Pedagogical content: units > lessons > steps, plus a shared word bank.
-- Written and maintained by the admin/content pipeline (service role), read
-- publicly by the app.

create table units (
  id uuid primary key default gen_random_uuid(),
  cycle unit_cycle not null default 'A1',
  order_index int not null,
  title_fr text not null,
  is_free boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle, order_index)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  order_index int not null,
  title_fr text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, order_index)
);

-- Shared word bank: a word is authored once and can be referenced by many
-- steps (and therefore feeds the spaced-repetition queue independently of
-- any single lesson).
create table words (
  id uuid primary key default gen_random_uuid(),
  arabic_vocalized text not null,   -- always includes harakat at A1
  transliteration text not null,
  french text not null,
  audio_url text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  order_index int not null,
  kind step_kind not null,
  -- Shape of payload depends on `kind`, e.g.:
  --   mcq_ar_to_fr: { "prompt_word_id": "...", "option_words": ["fr text", ...], "answer": "fr text" }
  --   order:        { "instruction": "...", "chip_word_ids": [...], "answer_word_ids": [...] }
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, order_index)
);

-- Which words a given step touches — drives the spaced-repetition queue
-- without having to parse `payload` on every write.
create table step_words (
  step_id uuid not null references steps(id) on delete cascade,
  word_id uuid not null references words(id) on delete cascade,
  primary key (step_id, word_id)
);

create index idx_lessons_unit_id on lessons(unit_id);
create index idx_steps_lesson_id on steps(lesson_id);
create index idx_step_words_word_id on step_words(word_id);
