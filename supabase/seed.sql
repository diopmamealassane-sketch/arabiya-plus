-- Arabiya+ — Seed data
-- Reproduces the "Se saluer" demo lesson from the React prototype, so the
-- connected app can be tested end-to-end immediately after migrating.
-- Run via: supabase db reset  (applies migrations, then this file)

with new_unit as (
  insert into units (cycle, order_index, title_fr, is_free)
  values ('A1', 1, 'Se saluer', true)
  returning id
),
new_lesson as (
  insert into lessons (unit_id, order_index, title_fr)
  select id, 1, 'Leçon 3 : Se saluer' from new_unit
  returning id
),
new_words as (
  insert into words (arabic_vocalized, transliteration, french, audio_url)
  values
    ('مَرْحَبًا', 'marhaban', 'bonjour', null),
    ('شُكْرًا', 'shukran', 'merci', null),
    ('مَعَ السَّلَامَة', 'ma''a as-salāma', 'au revoir', null),
    ('نَعَمْ', 'na''am', 'oui', null),
    ('لَا', 'lā', 'non', null)
  returning id, french
)
insert into steps (lesson_id, order_index, kind, payload)
select
  (select id from new_lesson),
  ordinality,
  kind,
  payload
from (
  values
    (1, 'intro'::step_kind,
      jsonb_build_object('word_id', (select id from new_words where french = 'bonjour'))),
    (2, 'intro'::step_kind,
      jsonb_build_object('word_id', (select id from new_words where french = 'merci'))),
    (3, 'intro'::step_kind,
      jsonb_build_object('word_id', (select id from new_words where french = 'au revoir'))),
    (4, 'mcq_ar_to_fr'::step_kind,
      jsonb_build_object(
        'prompt_word_id', (select id from new_words where french = 'merci'),
        'options', jsonb_build_array('merci', 'bonjour', 'au revoir', 'oui'),
        'answer', 'merci'
      )),
    (5, 'mcq_fr_to_ar'::step_kind,
      jsonb_build_object(
        'prompt_fr', 'au revoir',
        'note', 'نَعَمْ et لَا viennent de votre leçon précédente — un petit rappel.',
        'option_word_ids', jsonb_build_array(
          (select id from new_words where french = 'au revoir'),
          (select id from new_words where french = 'bonjour'),
          (select id from new_words where french = 'oui'),
          (select id from new_words where french = 'non')
        ),
        'answer_word_id', (select id from new_words where french = 'au revoir')
      )),
    (6, 'order'::step_kind,
      jsonb_build_object(
        'instruction', 'Reconstituez : « Bonjour, merci »',
        'chip_word_ids', jsonb_build_array(
          (select id from new_words where french = 'merci'),
          (select id from new_words where french = 'bonjour'),
          (select id from new_words where french = 'non')
        ),
        'answer_word_ids', jsonb_build_array(
          (select id from new_words where french = 'bonjour'),
          (select id from new_words where french = 'merci')
        )
      )),
    (7, 'listen'::step_kind,
      jsonb_build_object(
        'word_id', (select id from new_words where french = 'bonjour'),
        'options', jsonb_build_array('bonjour', 'merci', 'oui', 'au revoir'),
        'answer', 'bonjour'
      ))
) as s(ordinality, kind, payload);

-- Link every step to the word(s) it references, so the SRS queue can find
-- them without parsing payload at review-scheduling time.
insert into step_words (step_id, word_id)
select s.id, (s.payload->>'word_id')::uuid
from steps s
where s.payload ? 'word_id'
union
select s.id, (s.payload->>'prompt_word_id')::uuid
from steps s
where s.payload ? 'prompt_word_id'
union
select s.id, (s.payload->>'answer_word_id')::uuid
from steps s
where s.payload ? 'answer_word_id';
