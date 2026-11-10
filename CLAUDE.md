# Side Quest Generátor

## What the app does
A small web page that gives overwhelmed young women working in corporate a random
"side quest": a small, fun real-life challenge (e.g. "take a different route home").

- You pick a level (Lehká / Střední / Těžká) and click „Dej mi side quest ✨".
- A category filter („Kategorie", „Všechny" by default) narrows the random pick to one
  category. The card shows the quest's category as a small label. If nothing is left in
  the chosen level + category, a friendly message says so (two variants: "all done in
  this category" / "no quests of this category in this level"). Switching category
  clears the card, like switching level. The choice is not remembered.
- „Hotovo ✓" marks the shown quest as completed. Completed quests are not offered again.
- „Zpět" next to it undoes that one completion. It stays available until you generate
  a new quest, switch level or reset (also under the celebration message, if it was
  the last quest of a level).
- Switching to a different level clears the card. Clicking the already selected level
  does nothing.
- „Můj deník 📖" (under the card) opens the quest journal: a window listing all
  completed quests by level, newest first, with the completion date (e.g. „6. 11. 2026").
  Quests completed before dates were saved have no date and come last. View only.
- Each level shows its progress, e.g. „Splněno 3/20". Progress is per level only, not
  per category.
- When a level is fully completed, a celebration message appears.
- „Začít znovu" (with a confirmation box) clears all progress.
- Quests are loaded from Supabase when the page opens (card shows „Načítám questy… ✨").
  If that fails (offline, Supabase down, 10 s timeout, empty answer), the card shows a
  friendly Czech message and clicking „Dej mi side quest ✨" tries again. The deník shows
  a short message instead of the list. Saved progress is never touched by this.

## Files
- `index.html` – the whole app: page structure (HTML), look (CSS) and behaviour (JavaScript).
  At the top of the script:
  - `SUPABASE_URL` / `SUPABASE_KEY` – the project URL and the public (publishable) key.
  - `CATEGORIES` maps a short code without diacritics to the display name:
    `odvaha` „Odvaha 💪", `dobrodruzstvi` „Dobrodružství 🗺️", `komunita` „Komunita 💬",
    `metime` „Me time 💄", `kreativita` „Kreativita 🎨", `vzdelavani` „Vzdělávání 🎓".
    The filter buttons are built from this list, so a new category only needs a new line here.
  - `loadQuests()` fetches the quests and sorts them into `QUESTS` =
    `{ easy: [...], medium: [...], hard: [...] }`, each `{ id, category, text }`, the same
    shape `quests.js` used to have, so the rest of the app works on that.
- `supabase/setup.sql` – one-time database setup (table, read-only security, the original
  96 quests). Pasted into Supabase → SQL Editor. Safe to re-run: it never overwrites quests.
- `quests.js` – **backup only, not loaded by the app** (state at the move to Supabase,
  Nov 2026). Changes to it do nothing in the app.
- `icon.png` – the app icon: a hand-drawn cream star on wine (512×512, made by the
  owner). Used everywhere: browser tab (`rel="icon"`), iPhone home screen
  (`apple-touch-icon`) and Android (from the manifest). The owner replaces it by
  saving a new file with the same name.
- `manifest.webmanifest` – app name, short name „Side Quests", icon, colors and
  `display: standalone`, so Android opens the home-screen app without an address bar
  (iOS does that by itself). Ignored when the app is opened from a file.

No frameworks, no build step, nothing to install. Supabase is called with a plain
`fetch` (no Supabase library).

## Supabase (where the quests live)
- Project URL: https://rrcclzjcbupgshdsskgm.supabase.co
- Table `public.quests`: `id` (text, primary key, must match `easy|medium|hard-000`),
  `level` (`easy` / `medium` / `hard`), `category` (a `CATEGORIES` code; may be empty or
  unknown – then no label, and it only appears under „Všechny"), `text`, `budget`.
- Each quest has exactly one category.
- `budget` is required (NOT NULL) and only allows 3 codes (constraint `quests_budget_check`):
  `zdarma` „Zdarma 🆓", `do500` „Do 500 Kč 💸", `vicnez500` „Víc než 500 Kč 💰".
  The display names are for the future budget filter. The app doesn't use budget yet
  (it only selects `id, level, category, text`).
- Nov 2026: 97 quests (66 zdarma / 25 do500 / 6 vicnez500). `medium-032` has the same
  text as `easy-022` (kept on purpose unless the owner says otherwise).
- SQL files in `supabase/`, run once in the SQL Editor, in this order:
  `setup.sql` (table, security, first 96 quests) → `add-budget.sql` (budget column +
  allowed values) → `fill-budget.sql` (budgets by ID, then NOT NULL). All are safe to re-run.
- **Adding or fixing a quest:** Supabase → Table Editor → `quests` → Insert row (or edit
  the text). Fill in a budget too. Same ID rules as below. Feminine verb forms. The app picks it up on reload.
- **Security (do not loosen):**
  - The project has "Automatically expose new tables" OFF and automatic RLS ON.
  - On `quests`: RLS is on, `anon` has **only** `GRANT SELECT`, and there is one policy
    „Kdokoli může číst questy" (`for select to anon using (true)`). No insert/update/delete
    grants or policies, for `anon` or `authenticated`.
  - The publishable key (`sb_publishable_…`) is public by design (it's in the code and on
    GitHub); the rules above are what protect the data. Checked Nov 2026: with this key,
    reading works, while insert, update, upsert and delete get `401 permission denied`.
  - **Never put the secret key (`sb_secret_…` / service_role) in the code or the repo.**
- A new table must get its grants and policies written explicitly in SQL (nothing is
  exposed automatically).

## Online (GitHub)
- Live app: https://katerina-g59.github.io/side-quest-app/ (GitHub Pages, from branch `main`, folder `/`)
- Repository: https://github.com/katerina-g59/side-quest-app (public)
- To publish a change: `git add .` → `git commit -m "..."` → `git push`. The live site
  updates 1–2 minutes later. Commit messages are in English.
- Git signs commits as `katerina-g59` with the GitHub noreply email (never the real name
  or Gmail). Git is at `C:\Program Files\Git\cmd\git.exe` if `git` isn't on PATH.

## Important rules
1. **Must work by double-clicking `index.html` (no server).**
   - It needs internet, though, to load the quests from Supabase (`fetch` to an https
     address works from `file://`; the browser only blocks `fetch` of *local* files).
   - Don't add anything that needs a server, a build tool or npm.
2. **Every quest has a permanent, unique ID.**
   - Format: level + 3-digit number: `easy-001`, `medium-042`, `hard-120`.
   - A new quest gets the next unused number in its level.
   - Never change, renumber or reuse an ID, even after deleting a quest.
   - Fixing a quest's text is fine; its ID stays the same.
3. **Completed quests are saved in localStorage, by ID.**
   - Key `sideQuestDone`, value a JSON list of entries:
     `[{"id":"easy-003","date":null},{"id":"hard-007","date":"2026-11-06"}]`.
   - `date` is the local completion day as `YYYY-MM-DD`, or `null` for quests completed
     before dates were saved (Nov 2026).
   - Old format (a plain list of IDs, `["easy-003"]`) is converted on load to
     `{id, date: null}` and saved straight away. Mixed lists and duplicates are handled
     too, so never break this conversion.
   - Never save or compare by quest text.
   - All localStorage access is wrapped in try/catch, so the app still works when
     storage is blocked (it just doesn't remember).
   - Progress is per browser and per device.
4. **All quest text and UI text is in Czech.** The quests are written for women,
   so use feminine verb forms (e.g. „nebyla", „vděčná"). Code comments in the files
   are in Czech too.

## Look
- Colors (defined once in `:root` in `index.html`): wine `#772C3A`, cream `#F4E5A7`,
  dark brown `#35211F`, dusty pink `#E8C5C3`.
- Fonts (Google Fonts): Playfair Display for headings and quest text, Montserrat for
  everything else.
- Must also look good on a phone.

## How to test
- Open `index.html` straight from disk (`file:///…`), the way the user does.
- Note: the built-in browser pane turns local files into a snapshot, so test with real
  Edge/Chrome instead, e.g. headless Edge (`msedge --headless=new --dump-dom` or
  `--screenshot`) on a copy of the files in a temporary folder.
- After changes, check:
  - quests load (97 in Nov 2026), and the progress counts are right
  - filter, Hotovo / Zpět and deník work
  - a copy with a wrong `SUPABASE_URL` shows the friendly error, and the button retries
- After any database change, recheck with the publishable key (e.g. `curl`) that
  insert / update / delete are still refused.

## Working with the user
The owner is a beginner. Explain plans in simple words and wait for approval before
writing code.

## Roadmap / ideas
- ~~**Quest categories**~~ – done (6 categories + filter). Every level has at least
  4 quests in every category (96 quests in total, Nov 2026).
- ~~**Putting the app online with GitHub Pages**~~ – done, see "Online (GitHub)" above.
- ⭐ **Mobile polish + your own icon**: make it look great on phones. The icon is done
  (`icon.png`, also the tab icon). Still to do: further mobile polish. Maybe a version
  with thicker lines for the tab, if the thin star looks too faint there.
- ~~**„Zpět" (undo) for „Hotovo ✓"**~~ – done (undo for the most recent completion).
- ~~**List of completed quests**~~ – done as „Můj deník 📖" (view only, with dates).
- **Budget filter**: filter quests by how much they cost. Data part done (Nov 2026):
  every quest has a `budget` in Supabase (see the Supabase section). Still to do: the
  filter and budget label in the app.
- **Hide filters under one button**: put all filtering options (categories, and later
  budget) behind a single button, so the main screen isn't crowded.
- **Syncing progress across devices (later)**, so the phone and the computer know
  the same completed quests. This would need an account or a small online storage
  service. Because progress is already stored by ID, it can be moved there later.
