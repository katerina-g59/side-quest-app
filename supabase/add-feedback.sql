-- Side Quest Generátor – tabulka "feedback" pro formulář „Napiš mi 💌"
-- Jak použít: Supabase → SQL Editor → vložit celý soubor → Run. Jde spustit i znovu
-- (nic nesmaže, uložené zprávy zůstanou).
--
-- Bezpečnost: veřejný klíč (anon) smí zprávy JEN přidávat.
-- Číst, měnit ani mazat je nesmí nikdo kromě tebe v Supabase dashboardu
-- (Table Editor → feedback).

-- 1. Tabulka
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null,
  message     text not null,
  instagram   text,
  device_info text
);

-- 2. Pravidla pro obsah (při opakovaném spuštění se jen nahradí stejnými)
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

-- 3. Row Level Security zapnuté
alter table public.feedback enable row level security;

-- 4. Oprávnění: nejdřív všechno odebrat, pak povolit jen přidání
--    a jen u 4 polí (id a created_at si databáze vyplní sama, nejdou podvrhnout)
revoke all on table public.feedback from anon, authenticated;
grant insert (type, message, instagram, device_info) on table public.feedback to anon;

-- 5. Jediné pravidlo (policy): kdokoli může přidat zprávu. Žádné pro čtení, změnu ani mazání.
drop policy if exists "Kdokoli může poslat zprávu" on public.feedback;
create policy "Kdokoli může poslat zprávu"
  on public.feedback
  for insert
  to anon
  with check (true);
