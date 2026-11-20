-- Side Quest Generátor – příprava na "🌟 Quest dne"
-- Jak použít: Supabase → SQL Editor → vložit celý soubor → Run. Jde spustit i znovu.
-- DŮLEŽITÉ: spustit DŘÍV, než se zveřejní verze appky s Questem dne
-- (appka se bude ptát na nové sloupce; bez nich by se questy nenačetly).

-- 1) Kdy byl quest přidaný (Quest dne: nový quest se zařadí až do dalšího "kola",
--    takže přidání questu nikdy nezmění dnešní Quest dne).
--    Stávající questy dostanou 1. 1. 2026, nové automaticky dnešní datum podle českého času.
alter table public.quests
  add column if not exists added_on date not null default date '2026-01-01';
alter table public.quests
  alter column added_on set default ((now() at time zone 'Europe/Prague')::date);

-- 2) Speciální quest (např. Den matek): ukáže se JEN jako Quest dne ve svůj speciální den.
--    Nepočítá se do "Splněno X/Y", nepadne z "Dej mi side quest ✨" ani jako běžný Quest dne.
alter table public.quests
  add column if not exists special_only boolean not null default false;

-- 3) Speciální dny: v dané datum se místo automatického Questu dne ukáže vybraný quest
--    (jakýkoli – běžný i speciální, jakákoli úroveň a budget). Jeden řádek = jedno datum.
--    Když se quest smaže, smaže se i jeho speciální den.
create table if not exists public.daily_quest_overrides (
  date     date primary key,
  quest_id text not null references public.quests (id) on delete cascade
);

-- 4) Bezpečnost: veřejný klíč smí speciální dny jen ČÍST, nic jiného
alter table public.daily_quest_overrides enable row level security;
revoke all on public.daily_quest_overrides from anon, authenticated;
grant select on public.daily_quest_overrides to anon;

drop policy if exists "Kdokoli může číst speciální dny" on public.daily_quest_overrides;
create policy "Kdokoli může číst speciální dny" on public.daily_quest_overrides
  for select to anon using (true);

-- Oprávnění k tabulce quests se nemění: veřejný klíč ji dál smí jen číst
-- (čtení platí pro celou tabulku, takže i pro nové sloupce).
