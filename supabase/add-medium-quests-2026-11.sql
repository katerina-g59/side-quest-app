-- Side Quest Generátor – 23 nových středních questů (listopad 2026)
-- Hlavně "Víc než 500 Kč" ve všech kategoriích + 3 questy Me time "Do 500 Kč".
--
-- Jak použít (rutina: nejdřív staging, pak produkce):
--   1. projekt "side-quest-app-staging" → SQL Editor → vložit celý soubor → Run → otestovat
--   2. až pak stejný soubor v produkci
-- Jde spustit i znovu: quest s už existujícím ID se přeskočí (nic se nepřepíše).
--
-- ID: další volná čísla ve Střední úrovni. medium-032 je smazaný a nesmí se znovu použít,
-- proto se začíná od medium-033. added_on se vyplní samo (dnešní český datum).

insert into public.quests (id, level, category, budget, text) values
  ('medium-033', 'medium', 'odvaha',        'vicnez500', 'Jdi na lekci zpěvu.'),
  ('medium-034', 'medium', 'odvaha',        'vicnez500', 'Zúčastni se odpoledního workshopu improvizace nebo herectví.'),
  ('medium-035', 'medium', 'odvaha',        'vicnez500', 'Projdi lanový park, i když se bojíš výšek.'),
  ('medium-036', 'medium', 'dobrodruzstvi', 'vicnez500', 'Dej si vyhlídkovou plavbu lodí s večeří.'),
  ('medium-037', 'medium', 'dobrodruzstvi', 'vicnez500', 'Vyzkoušej kajak nebo paddleboard s instruktorem.'),
  ('medium-038', 'medium', 'dobrodruzstvi', 'vicnez500', 'Jeď na odpoledne do aquaparku nebo termálů v jiném městě.'),
  ('medium-039', 'medium', 'komunita',      'vicnez500', 'Vezmi kamarádku na společné odpoledne ve wellness.'),
  ('medium-040', 'medium', 'komunita',      'vicnez500', 'Zahrajte si s partou laser game a pak zajděte na večeři.'),
  ('medium-041', 'medium', 'komunita',      'vicnez500', 'Uvař rodině nedělní oběd ze surovin z farmářského trhu.'),
  ('medium-042', 'medium', 'komunita',      'vicnez500', 'Vezmi rodiče nebo prarodiče na výlet a zaplať jim ho.'),
  ('medium-043', 'medium', 'komunita',      'vicnez500', 'Jděte s kamarádkami spolu na kreativní workshop.'),
  ('medium-044', 'medium', 'metime',        'do500',     'Dej si odpoledne v kavárně s knihou a dortem, bez mobilu.'),
  ('medium-045', 'medium', 'metime',        'do500',     'Zajdi si zaplavat a pak do páry.'),
  ('medium-046', 'medium', 'metime',        'do500',     'Kup si kytici, prostři si jako pro hosta a navečeř se sama se sebou.'),
  ('medium-047', 'medium', 'kreativita',    'vicnez500', 'Zúčastni se kurzu malování, třeba malování s vínem.'),
  ('medium-048', 'medium', 'kreativita',    'vicnez500', 'Jdi na kurz šití a ušij si vlastní tašku.'),
  ('medium-049', 'medium', 'kreativita',    'vicnez500', 'Zúčastni se workshopu výroby šperků.'),
  ('medium-050', 'medium', 'kreativita',    'vicnez500', 'Jdi na kurz floristiky a uvaž si vlastní kytici.'),
  ('medium-051', 'medium', 'vzdelavani',    'vicnez500', 'Jdi na kurz vaření kuchyně, kterou neznáš.'),
  ('medium-052', 'medium', 'vzdelavani',    'vicnez500', 'Absolvuj kurz baristy a nauč se latte art.'),
  ('medium-053', 'medium', 'vzdelavani',    'vicnez500', 'Jdi na degustaci vína nebo čaje s výkladem.'),
  ('medium-054', 'medium', 'vzdelavani',    'vicnez500', 'Jdi na workshop programování nebo AI pro začátečníky.'),
  ('medium-055', 'medium', 'vzdelavani',    'vicnez500', 'Absolvuj kurz sebeobrany pro ženy.')
on conflict (id) do nothing;

-- Kontrola: Střední by teď měla mít 54 questů (31 + 23)
select count(*) as stredni_questy from public.quests where level = 'medium' and not special_only;
