-- Side Quest Generátor – 24 nových těžkých questů (listopad 2026)
-- Dobrodružství, Komunita, Me time a Vzdělávání; budgety Zdarma / Do 500 Kč / Víc než 500 Kč.
--
-- Jak použít (rutina: nejdřív staging, pak produkce):
--   1. projekt "side-quest-app-staging" → SQL Editor → vložit celý soubor → Run → otestovat
--   2. až pak stejný soubor v produkci
-- Jde spustit i znovu: quest s už existujícím ID se přeskočí (nic se nepřepíše).
--
-- ID: další volná čísla v Těžké úrovni (poslední bylo hard-031). added_on se vyplní samo.
-- Těžké questy nejsou v balíčku pro Quest dne, takže dnešní Quest dne se nezmění.

insert into public.quests (id, level, category, budget, text) values
  ('hard-032', 'hard', 'dobrodruzstvi', 'do500',     'Vylez za jeden den na tři rozhledny.'),
  ('hard-033', 'hard', 'dobrodruzstvi', 'do500',     'Projeď linku vlaku nebo autobusu až na konečnou a objevuj, co tam je.'),
  ('hard-034', 'hard', 'dobrodruzstvi', 'do500',     'Navštiv za jeden víkend 5 míst ve svém kraji, kde jsi nikdy nebyla.'),
  ('hard-035', 'hard', 'komunita',      'do500',     'Uspořádej u sebe doma večírek pro lidi, kteří se navzájem neznají.'),
  ('hard-036', 'hard', 'komunita',      'do500',     'Zorganizuj se sousedy nebo kamarády úklid parku.'),
  ('hard-037', 'hard', 'komunita',      'zdarma',    'Pomáhej celý den jako dobrovolnice v potravinové bance.'),
  ('hard-038', 'hard', 'komunita',      'do500',     'Napiš dopis pěti lidem, kteří ti v životě pomohli, a pošli je.'),
  ('hard-039', 'hard', 'komunita',      'do500',     'Uspořádej sousedské setkání ve svém domě.'),
  ('hard-040', 'hard', 'komunita',      'vicnez500', 'Uspořádej rodinnou večeři v restauraci a pozvi i vzdálenější příbuzné.'),
  ('hard-041', 'hard', 'komunita',      'vicnez500', 'Zorganizuj s partou víkend na chatě.'),
  ('hard-042', 'hard', 'komunita',      'vicnez500', 'Navštiv kamarádku, která žije v zahraničí.'),
  ('hard-043', 'hard', 'komunita',      'vicnez500', 'Uspořádej někomu blízkému narozeninovou oslavu s překvapením.'),
  ('hard-044', 'hard', 'metime',        'zdarma',    'Týden choď každý večer na procházku bez mobilu.'),
  ('hard-045', 'hard', 'metime',        'do500',     'Udělej si z neděle domácí wellness den od rána do večera.'),
  ('hard-046', 'hard', 'metime',        'vicnez500', 'Dopřej si celý den v termálech nebo lázních i s masáží.'),
  ('hard-047', 'hard', 'metime',        'vicnez500', 'Jeď sama na víkendový pobyt s jógou nebo relaxací.'),
  ('hard-048', 'hard', 'metime',        'vicnez500', 'Vezmi si týden dovolené, nikam nejeď a užij si ho po svém doma.'),
  ('hard-049', 'hard', 'metime',        'vicnez500', 'Kup si permanentku na jógu nebo bazén a měsíc ji poctivě využívej.'),
  ('hard-050', 'hard', 'metime',        'vicnez500', 'Dopřej si víkend v hotelu ve svém vlastním městě.'),
  ('hard-051', 'hard', 'vzdelavani',    'vicnez500', 'Absolvuj víkendový kurz fotografie nebo vaření.'),
  ('hard-052', 'hard', 'vzdelavani',    'vicnez500', 'Přihlas se na semestrální jazykový kurz. A choď na něj.'),
  ('hard-053', 'hard', 'vzdelavani',    'vicnez500', 'Jeď na víkendovou konferenci nebo festival nápadů a dělej si poznámky.'),
  ('hard-054', 'hard', 'vzdelavani',    'vicnez500', 'Absolvuj intenzivní kurz vibecodingu nebo tvorby webu.'),
  ('hard-055', 'hard', 'vzdelavani',    'vicnez500', 'Odjeď na jazykový pobyt do zahraničí, klidně jen na týden.')
on conflict (id) do nothing;

-- Kontrola: Těžká by teď měla mít 55 questů (31 + 24)
select count(*) as tezke_questy from public.quests where level = 'hard' and not special_only;
