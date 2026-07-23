-- Arabiya+ — Migration 1/5
-- Extensions and enum types shared across the schema.

create extension if not exists "pgcrypto";

create type unit_cycle as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

create type step_kind as enum (
  'intro',
  'mcq_ar_to_fr',
  'mcq_fr_to_ar',
  'order',
  'listen',
  'dictee'
);

create type progress_status as enum ('not_started', 'in_progress', 'completed');

create type review_result as enum ('correct', 'incorrect');

create type subscription_status as enum ('free', 'active', 'canceled', 'past_due');
