-- Side Quest Generátor – přidá ke každému questu rozpočet (sloupec "budget")
-- Jak použít: Supabase → SQL Editor → vložit celý soubor → Run. Jde spustit i znovu.
-- Povolené hodnoty: 'zdarma' (Zdarma 🆓), 'do500' (Do 500 Kč 💸), 'vicnez500' (Víc než 500 Kč 💰)
-- Oprávnění se nemění: veřejný klíč smí tabulku dál jen číst.

alter table public.quests add column if not exists budget text;

alter table public.quests drop constraint if exists quests_budget_check;
alter table public.quests add constraint quests_budget_check
  check (budget in ('zdarma', 'do500', 'vicnez500'));
