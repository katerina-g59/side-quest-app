-- Side Quest Generátor – KOMPLETNÍ STRUKTURA DATABÁZE pro STAGING (testovací prostředí)
--
-- Jak použít: projekt "side-quest-app-staging" → SQL Editor → vložit celý soubor → Run.
-- Je to výsledný stav všech skriptů dohromady (setup, add-budget, fill-budget,
-- add-feedback, add-credit, add-daily-quest) – BEZ DAT: žádné questy, žádné zprávy.
-- Questy a speciální dny se zkopírují zvlášť (staging-data.sql).
--
-- Jde spustit i znovu. Vytváří jen to, co chybí, nic nemaže – ani kdyby se omylem
-- spustil v produkci, nic by nezměnil ani nesmazal.
-- Webhook na e-maily se sem NEpřidává (je jen v produkci).

-- =====================================================================
-- 1) QUESTS – questy (veřejný klíč je smí jen ČÍST)
-- =====================================================================
create table if not exists public.quests (
  id               text primary key,
  level            text not null,
  category         text,
  text             text not null,
  budget           text not null,
  author_instagram text,
  added_on         date not null default ((now() at time zone 'Europe/Prague')::date),
  special_only     boolean not null default false
);

-- Pravidla (stejné názvy jako v produkci)
alter table public.quests drop constraint if exists quests_id_check;
alter table public.quests add constraint quests_id_check
  check (id ~ '^(easy|medium|hard)-[0-9]{3}$');

alter table public.quests drop constraint if exists quests_level_check;
alter table public.quests add constraint quests_level_check
  check (level in ('easy', 'medium', 'hard'));

alter table public.quests drop constraint if exists quests_budget_check;
alter table public.quests add constraint quests_budget_check
  check (budget in ('zdarma', 'do500', 'vicnez500'));

alter table public.quests drop constraint if exists quests_author_instagram_check;
alter table public.quests add constraint quests_author_instagram_check
  check (author_instagram is null or author_instagram ~ '^[A-Za-z0-9._]{1,30}$');

-- Bezpečnost: RLS zapnuté, anon smí jen číst
alter table public.quests enable row level security;
revoke all on public.quests from anon, authenticated;
grant select on public.quests to anon;

drop policy if exists "Kdokoli může číst questy" on public.quests;
create policy "Kdokoli může číst questy" on public.quests
  for select to anon using (true);

-- =====================================================================
-- 2) DAILY_QUEST_OVERRIDES – speciální dny pro Quest dne (jen ČÍST)
-- =====================================================================
create table if not exists public.daily_quest_overrides (
  date     date primary key,
  quest_id text not null references public.quests (id) on delete cascade
);

alter table public.daily_quest_overrides enable row level security;
revoke all on public.daily_quest_overrides from anon, authenticated;
grant select on public.daily_quest_overrides to anon;

drop policy if exists "Kdokoli může číst speciální dny" on public.daily_quest_overrides;
create policy "Kdokoli může číst speciální dny" on public.daily_quest_overrides
  for select to anon using (true);

-- =====================================================================
-- 3) FEEDBACK – zprávy z „Napiš mi 💌" (veřejný klíč je smí jen PŘIDÁVAT)
-- =====================================================================
create table if not exists public.feedback (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  type           text not null,
  message        text not null,
  instagram      text,
  device_info    text,
  consent_credit boolean
);

alter table public.feedback drop constraint if exists feedback_type_check;
alter table public.feedback add constraint feedback_type_check
  check (type in ('chyba', 'zpetna_vazba', 'quest'));

-- Zpráva: 1–500 znaků a nesmí být jen z mezer
alter table public.feedback drop constraint if exists feedback_message_check;
alter table public.feedback add constraint feedback_message_check
  check (char_length(message) <= 500 and char_length(btrim(message)) >= 1);

-- Instagram: nepovinný, max 50 znaků
alter table public.feedback drop constraint if exists feedback_instagram_check;
alter table public.feedback add constraint feedback_instagram_check
  check (instagram is null or char_length(instagram) <= 50);

-- Info o zařízení: jen u nahlášené chyby, max 500 znaků
alter table public.feedback drop constraint if exists feedback_device_info_check;
alter table public.feedback add constraint feedback_device_info_check
  check (device_info is null or (type = 'chyba' and char_length(device_info) <= 500));

-- Souhlas s uvedením Instagramu: "ano" jen u návrhu questu s vyplněným Instagramem
alter table public.feedback drop constraint if exists feedback_consent_credit_check;
alter table public.feedback add constraint feedback_consent_credit_check
  check (consent_credit is null or consent_credit = false
         or (type = 'quest' and instagram is not null));

-- Bezpečnost: RLS zapnuté, anon smí jen přidat zprávu a jen do 5 polí
-- (id a created_at si databáze vyplní sama, nejdou podvrhnout)
alter table public.feedback enable row level security;
revoke all on table public.feedback from anon, authenticated;
grant insert (type, message, instagram, device_info, consent_credit) on table public.feedback to anon;

drop policy if exists "Kdokoli může poslat zprávu" on public.feedback;
create policy "Kdokoli může poslat zprávu" on public.feedback
  for insert to anon with check (true);
