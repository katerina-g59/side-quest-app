-- Side Quest Generátor – podpis autorek navržených questů
-- Jak použít: Supabase → SQL Editor → vložit celý soubor → Run. Jde spustit i znovu
-- (nic nesmaže, questy ani zprávy se nemění).
--
-- DŮLEŽITÉ: spusť to DŘÍV, než se na web nahraje nová verze appky
-- (ta už se na tyhle sloupce ptá; bez nich by se questy nenačetly).

-- 1. quests: Instagram autorky questu (nepovinný)
alter table public.quests add column if not exists author_instagram text;

-- Jen platné jméno účtu: písmena, čísla, tečka, podtržítko, 1–30 znaků, bez @
alter table public.quests drop constraint if exists quests_author_instagram_check;
alter table public.quests add constraint quests_author_instagram_check
  check (author_instagram is null or author_instagram ~ '^[A-Za-z0-9._]{1,30}$');

-- Oprávnění se nemění: veřejný klíč (anon) smí questy dál jen číst
-- (GRANT SELECT na celou tabulku platí i pro nový sloupec). Nic dalšího se nepovoluje.

-- 2. feedback: souhlas s uvedením Instagramu u přidaného questu (ano/ne, nepovinné)
alter table public.feedback add column if not exists consent_credit boolean;

-- "Ano" jde jen u návrhu questu, který má vyplněný Instagram
alter table public.feedback drop constraint if exists feedback_consent_credit_check;
alter table public.feedback add constraint feedback_consent_credit_check
  check (consent_credit is null or consent_credit = false
         or (type = 'quest' and instagram is not null));

-- Appka smí nový sloupec jen vyplnit při odeslání; číst, měnit ani mazat dál nesmí nic
grant insert (consent_credit) on table public.feedback to anon;
