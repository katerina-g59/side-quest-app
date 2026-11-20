# Side Quest Generátor

## What the app does
A small web page that gives overwhelmed young women working in corporate a random
"side quest": a small, fun real-life challenge (e.g. "take a different route home").

- **„🌟 Quest dne" (Nov 2026):** one shared quest for everyone per day.
  - **Placement (owner's choice, "option C"):** a quiet outline pill „🌟 Quest dne" next
    to „Můj deník 📖" under the card (`.extras` row). It becomes „🌟 Quest dne ✓" when
    today's is done. The owner rejected a big wine card at the top: the app felt heavy
    and samey. Keep it subtle.
  - Tapping the pill opens a popup (`<dialog id="daily">`, Filtry style: ✕, tap
    outside, Esc). It shows „Jeden společný quest pro všechny na dnešek." and a pink
    card like the main one.
  - The popup card:
    - shows labels for level (or „🌟 Speciální quest"), category and budget
    - ignores filters
    - if quests can't load, shows „Quest dne se teď nepodařilo načíst 😕" and the rest
      of the app works
  - „Hotovo ✓" works like on the normal card (deník with date, level progress).
    Afterwards it shows „Splněno 🎉" + „Sdílet 📤" + „Zpět" (`dailyJustDone`).
  - If it was completed earlier (or after a reload): „Tenhle už máš splněný ✓" +
    „Sdílet 📤". `updateProgress()` calls `renderDaily()`, so completing/undoing it on
    the normal card, or „Začít znovu", updates this card too.
  - **Date:** Czech date via `Intl` `timeZone: "Europe/Prague"` (`pragueDate()`); it
    changes at midnight, checked every minute and when the app comes back to the screen.
  - **Testing only:** `?datum=2026-11-27` in the address shows that day's Quest dne
    (special days included) with „Náhled pro 27. 11. 2026". An invalid date is ignored.
    „Hotovo" in a preview still saves the real date.
  - **How it's chosen** (`refreshDaily()`):
    1. A special day in `daily_quest_overrides` for that date wins (any quest, any
       level/budget, normal or special-only). If that table can't be read, the
       automatic one is used.
    2. Otherwise `automaticDailyQuest(date)`, a "shuffled deck in rounds".
  - **The automatic deck:**
    - Pool: easy + medium, budget zdarma / do500, not special-only (66 quests in Nov 2026).
    - Rounds start at `DAILY_START = "2026-11-01"` (**never change it**, or every day's
      Quest dne changes).
    - Each round uses only quests with `added_on` **before** the round's first day, in
      an order shuffled by `hash32(round + ":" + id)` (FNV-1a, the same on every device),
      one per day, no repeats. A round lasts as many days as it has quests.
    - Quests from the second half of the previous round are moved to the end of the
      next round, so a quest comes back after at least ~a month (34 days in a 3-year
      test) and never two days in a row.
  - **Trade-off the owner chose:**
    - Adding a quest never changes today or the rest of the round; it joins the next
      round.
    - Removing a quest (or making it no longer eligible) shifts the current round:
      today's Quest dne changed in 20 of 66 test cases (~30 %).
    - Making an old quest newly eligible (e.g. budget vicnez500 → do500) works like
      adding it *now*, so also set its `added_on` to today, and it waits for the next
      round.
  - **Special-only quests** (`special_only = true`, kept in `SPECIAL_QUESTS`, not in
    `QUESTS`): shown only as the Quest dne on their special day.
    - Not counted in „Splněno X/Y", never picked by „Dej mi side quest ✨", filters or
      the automatic deck.
    - Completed ones get their own deník section „🌟 Speciální questy · N" (only shown
      when there's at least one).
    - On the share image their pill says „🌟 Speciální quest".
- **🔥 Weekly streak (Nov 2026):** a gentle "weeks in a row" streak.
  - **Counting** (pure functions in `streak.js`):
    - A week runs Monday–Sunday. It counts if at least 1 quest (any) was completed in
      it, by the deník dates.
    - Undated (old) entries and future dates don't count.
    - The streak is **calculated, never stored**: `computeStreak(doneEntries, today)`.
  - **This week still empty:** the streak still counts up to last week, and the hint
    „Tento týden ti ještě chybí quest 🔥" shows. It only drops to 0 after a whole week
    without a quest.
  - **"Today":** `streakToday()` = Prague date, or the `?datum=` date when testing.
  - **Main screen:** a small wine text line under the subtitle, „🔥 3 týdny v řadě"
    (no box), plus the hint when needed. Hidden when the streak is 0.
  - **Deník:** „Nejdelší streak: X týdnů 🔥" at the top (hidden when 0).
  - **Plurals** (`weeksText`): 1 týden · 2–4 týdny · 0 and 5+ týdnů.
  - **Milestones 2, 4, 8, 12** (`streakMilestone`):
    - Right after a „Hotovo ✓" (main card or Quest dne) that reaches one, the streak
      line shows a kind message (`streakMessages`) on a pink pill for 6 s.
    - It disappears straight away if „Zpět" / „Začít znovu" drops the streak below
      the milestone.
    - Each milestone is celebrated **only once ever**. Shown ones are remembered in
      localStorage key `sideQuestStreakMilestones` (e.g. `[2,4]`, in try/catch); this is
      the owner's choice.
    - On page load, milestones the streak has already reached are marked silently (no
      surprise message).
    - „Začít znovu" clears the list.
  - **Share image:** when the streak is ≥ 2, the card's top line becomes
    „✅ Splněno · 16. 11. · 🔥 3 týdny v řadě" (the streak at share time; the font
    shrinks if the line is too long).
  - `updateProgress()` calls `renderStreak()`, so Hotovo / Zpět / Začít znovu update it.
- You pick a level (Lehká / Střední / Těžká) and click „Dej mi side quest ✨".
- **Filters:** a round icon button (sliders icon, inline SVG, wine on cream; label
  „Filtry" for screen readers) at the end of the Lehká / Střední / Těžká row opens a popup
  (a `<dialog>` like the deník; closes with the round ✕ in the corner, a tap outside, or
  Esc). The icon turns dusty pink while any filter is on. The owner chose this look and
  place (Nov 2026) instead of a text button.
  - Two sections, **multi-select** (Nov 2026): „Kategorie" („Všechny" + `CATEGORIES`) and
    „Budget" („Všechny" + `BUDGETS`). Both start on „Všechny".
    - Each option is an on/off switch; several can be on (e.g. Odvaha + Komunita).
    - Tapping „Všechny" turns the others off; tapping any other option turns „Všechny"
      off; turning off the last option brings back „Všechny".
    - Look: a selected option is a filled wine pill with cream text and „✓ "; an
      unselected one is a wine outline. Min 44 px tall. (`aria-pressed` for screen readers.)
  - **Nothing applies until confirmed.** Tapping an option only changes the selection
    inside the popup (`draftCategories` / `draftBudgets`); the main page doesn't change.
  - Two full-width buttons at the bottom, stacked: **„Potvrdit filtry"** (primary: wine
    with cream text) saves the selection, closes the popup and, only if something
    changed, updates tags/icon and clears the card. **„Zrušit filtry"** (secondary: dusty
    pink with wine text) removes all filters **right away**, in the popup and on the
    main screen (tags gone, icon not pink, card cleared if a filter was on); the popup
    stays open. Faded and inactive when there's nothing to cancel (nothing selected in
    the popup and nothing applied). The owner changed this (Nov 2026, during testing):
    users expect „Zrušit" to cancel the shown filters, and the separate „Potvrdit
    filtry" button already avoids accidental resets.
  - Closing without confirming (✕, tap outside, Esc) discards the unconfirmed selection;
    reopening shows the filters that are actually on.
  - On the main screen, every selected option shows as its own pink tag in a row under
    the levels, e.g. „Odvaha 💪 ✕" „Komunita 💬 ✕" (in list order; the row wraps onto more
    lines and is hidden when no filter is on). Tapping a tag removes only that option
    right away (no confirmation needed); removing the last one of a section brings that
    section back to „Všechny".
  - Any applied filter change clears the card, like switching level (this also ends „Zpět").
  - Filters are not remembered: the app always starts on „Všechny / Všechny".
  - The random pick uses level + category + budget: a quest matches if its category is
    ANY of the selected categories AND its budget is ANY of the selected budgets. If
    nothing uncompleted matches, a friendly message names the filters (e.g. „Odvaha 💪,
    Komunita 💬 · Zdarma 🆓") and suggests removing one. Two variants:
    "all matching quests done" / "no quest matches these filters in this level".
    A fully completed level still shows its celebration first.
  - Progress („Splněno X/Y"), the celebration and the deník ignore filters.
- The card shows the quest's category and budget as two small labels (e.g. „Odvaha 💪"
  „Zdarma 🆓"); an unknown code just has no label.
- **Quest author credit:** if a quest has `author_instagram`, a small cream tag
  „Quest od @handle 💌" appears under the quest text and opens
  `https://www.instagram.com/handle/` in a new tab (`rel="noopener noreferrer"`).
  Not shown in the deník.
  - **XSS protection (keep it):** the handle comes from a stranger, so `showAuthor()`
    checks it again against `IG_HANDLE` (`^[A-Za-z0-9._]{1,30}$`, same as the database
    rule). An invalid handle means no tag.
  - The text is set only with `textContent` (never `innerHTML`), and the link is built
    from the fixed prefix + `encodeURIComponent(handle)`, so no `javascript:` or other
    link is possible.
- „Hotovo ✓" marks the shown quest as completed. Completed quests are not offered again.
- „Zpět" next to it undoes that one completion. It stays available until you generate
  a new quest, switch level or reset (also under the celebration message, if it was
  the last quest of a level).
- **„Sdílet 📤" (Instagram-story image, Nov 2026):**
  - Where: on the card, next to „Zpět", visible exactly when „Zpět" is (a
    `MutationObserver` copies `undo`'s `hidden`; shares `lastDone`). In the deník, a
    button on every completed quest; the share popup opens on top of the deník.
  - Popup (Filtry style: ✕, tap outside, Esc), top to bottom:
    - live preview (`<canvas id="share-preview">`, 1080×1920 shown small)
    - „Přidej fotku ze svého questu 📷" (`<input type=file accept="image/*">`, so the
      phone offers gallery + camera); with a photo: „Změnit fotku 📷" + link „Bez fotky"
    - „Kartička" Nahoře / Dole (default Dole)
    - „Sdílet" (primary)
    - „Stáhnout jen kartičku" (smaller secondary)
    - „Tvoje fotka nikam neodchází 🔒"
  - Image 1080×1920:
    - **Background:** the photo (cover, centre crop) or, without a photo, a wine
      gradient with faint hand-drawn cream stars (seeded random, so always the same).
    - **Photo handling:** it's decoded with an `<img>`, so the browser applies iPhone
      rotation (EXIF), then drawn straight into one 1080×1920 canvas, so huge photos
      don't stay in memory.
    - **Card:** semi-transparent wine (`rgba(119,44,58,0.86)`), radius 48, 72 px side
      margin. Contents:
      - „✅ Splněno · 16. 11." (no date for old undated quests)
      - the quest in cream Playfair Display 700: 72 px, shrinking by 4 down to 44 px to
        stay within 5 lines; wraps between words
      - pills for level + category
      - „Side Quest Generátor · @after_hours_project_" in Montserrat
    - **Card position:** kept out of Instagram's top 260 px and bottom 320 px.
    - **Fonts:** waits for `document.fonts.load` (with the quest text, so Czech letters
      load too), max 3 s, then draws with fallback fonts.
  - **Both images are prepared in advance** after every change (`storyBlob` JPEG,
    `cardBlob` PNG). iPhones only allow `navigator.share` right after a tap; „Sdílet"
    says „Připravuju obrázek…" and is disabled until then.
  - „Sdílet":
    - If the device can share files: `navigator.share({ files, text })` with
      „Side quest splněný ✅ Vygeneruj si svůj: <live URL>" (Instagram ignores the text).
    - Otherwise: the JPEG downloads, the text is copied, and it shows „Zkopírováno ✓"
      (or „Obrázek se stáhl ✓" if copying isn't allowed).
  - „Stáhnout jen kartičku": the card only, **fully opaque** wine, on a transparent PNG.
    On a phone (`pointer: coarse` + can share files) it opens the share menu, because
    "Uložit obrázek" puts it in Photos; on a computer it's a normal download.
  - **Privacy (never break):** the photo is only read and drawn in the browser. No
    upload, no Supabase, no other server. On closing the popup (`close` event) the
    photo and images are dropped. A photo still loading when the popup closes is
    thrown away (`shareSession`).
- Switching to a different level clears the card. Clicking the already selected level
  does nothing.
- „Můj deník 📖" (under the card) opens the quest journal: a window listing all
  completed quests by level, newest first, with the completion date (e.g. „6. 11. 2026").
  Quests completed before dates were saved have no date and come last. View only.
- Each level shows its progress, e.g. „Splněno 3/20". Progress is per level only, not
  per category.
- When a level is fully completed, a celebration message appears.
- „Začít znovu" (with a confirmation box) clears all progress.
- **„Napiš mi 💌"** (in the footer, next to the Instagram link) opens a popup in the
  Filtry style (✕, tap outside, Esc) for sending a message, saved to the Supabase table
  `feedback`:
  - Choose a type: „Chyba 🐛" (`chyba`), „Zpětná vazba 📩" (`zpetna_vazba`),
    „Navrhnout quest ✨" (`quest`). Nothing is chosen at the start.
  - „Tvoje zpráva": required, max 500 characters, counter „0/500". „Tvůj Instagram
    (nepovinné)": max 50, a leading „@" is removed.
  - „Odeslat 💌" is faded until a type and some text are filled in.
  - Only for „Navrhnout quest ✨" **with** an Instagram filled in: a checkbox
    „Když tvůj quest přidám, můžu u něj uvést tvůj Instagram." It's **unchecked by
    default**: the owner wanted it pre-ticked, but under GDPR a pre-ticked box isn't
    valid consent, so she chose unticked. Its value is sent as `consent_credit`
    (true/false); in all other cases the field isn't sent at all. It resets after
    sending.
  - Only for „Chyba 🐛": a note says basic browser/device info is attached (no personal
    data), and `device_info` gets the browser (user agent), screen/window size, language,
    whether it runs from the home screen, and whether it's a local file or the website.
  - Sent with `Prefer: return=minimal` (anon may not read the table, so asking for the
    saved row back would fail). 10 s timeout.
  - Success: a thank-you message (`feedbackThanksTexts`), and the form is cleared.
    „Navrhnout quest ✨" has two texts of its own, and neither promises to contact her
    (Nov 2026):
    - credit box ticked: „Když tvůj quest přidám, bude u něj tvůj Instagram…"
    - otherwise: „Když tvůj quest přidám, objeví se v appce bez podpisu." Failure: a friendly error,
    and the text stays in the form. Closing the popup also keeps the unsent text.
  - Spam protection: max 1 message per 30 s (time kept in localStorage key
    `sideQuestFeedbackSent`, in try/catch). This is only a check in the browser, not in
    the database.
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
  - `BUDGETS` does the same for budget: `zdarma` „Zdarma 🆓", `do500` „Do 500 Kč 💸",
    `vicnez500` „Víc než 500 Kč 💰".
  - `loadQuests()` fetches the quests and sorts them into `QUESTS` =
    `{ easy: [...], medium: [...], hard: [...] }`, each
    `{ id, level, category, budget, text, author, addedOn, special }`
    (`author` = `author_instagram`, usually empty). Special-only quests go into
    `SPECIAL_QUESTS` instead, never into `QUESTS`.
  - Quest dne: `DAILY_START`, `DAILY_LEVELS`, `DAILY_BUDGETS`, `pragueDate()`,
    `automaticDailyQuest()`, `refreshDaily()`, `renderDaily()`.
  - Filter state: `currentCategories` / `currentBudgets`, lists of codes in
    `CATEGORIES` / `BUDGETS` order (empty list = Všechny); `matchesFilters(quest)` decides
    what can be picked, `toggleDraft()` holds the „Všechny" rules, `removeFilter()` is
    used by the tags.
- `streak.js` – the weekly streak calculation:
  - `streakWeekIndex`, `computeStreak`, `weeksText`, `streakMilestone`,
    `STREAK_MILESTONES`
  - pure functions with no page access, loaded by `index.html` **and** `tests.html`
    with `<script src>`, so it must stay in the same folder
- `tests.html` – automated tests: open it in the browser, by double-clicking or at
  …/side-quest-app/tests.html.
  - It checks the streak calculation with made-up dates (3 weeks in a row, gap,
    New Year week, Sunday/Monday, empty current week, undated, longest, plurals,
    milestones, future dates) and shows ✅/❌ plus „24 / 24 prošlo ✅".
  - **Open it after every change to the streak.** New cases go in as more `check(...)`
    lines.
- `supabase/setup.sql` – one-time database setup (table, read-only security, the original
  96 quests). Pasted into Supabase → SQL Editor. Safe to re-run: it never overwrites quests.
- `supabase/functions/feedback-email/index.ts` – backup of the Edge Function that emails
  new feedback (the real one lives in the Supabase dashboard; no secrets in this file).
- `quests_old_backup.js` (renamed from `quests.js`) – **backup only, not loaded by the app** (state at the move to Supabase,
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
  The display names live in `BUDGETS` in `index.html` (used by the Budget filter and
  the card label). The app selects `id, level, category, budget, text, author_instagram,
  added_on, special_only`, and reads `daily_quest_overrides` for the Quest dne.
- `author_instagram` (optional): the Instagram of the woman who suggested the quest,
  without @. Constraint `quests_author_instagram_check` allows only
  `^[A-Za-z0-9._]{1,30}$`. Added by `add-credit.sql`; reading rights unchanged.
- Nov 2026: 96 quests (easy 34 / medium 31 / hard 31). The owner deleted `medium-032`
  (a duplicate of `easy-022`), so that ID must never be used again. `fill-budget.sql`
  still lists it; re-running it is harmless (it just matches nothing).
- SQL files in `supabase/`, run once in the SQL Editor, in this order:
  `setup.sql` (table, security, first 96 quests) → `add-budget.sql` (budget column +
  allowed values) → `fill-budget.sql` (budgets by ID, then NOT NULL) →
  `add-feedback.sql` (feedback table, insert-only) → `add-credit.sql`
  (`quests.author_instagram`, `feedback.consent_credit`) → `add-daily-quest.sql`
  (`quests.added_on`, `quests.special_only`, table `daily_quest_overrides`; run
  20 Nov 2026). All are safe to re-run.
- `added_on` (date, NOT NULL): when the quest was added. Existing quests have
  2026-01-01; the default for new rows is today's Czech date
  (`(now() at time zone 'Europe/Prague')::date`). It's used by the Quest dne deck.
- `special_only` (yes/no, default no): a quest that appears **only** as the Quest dne on
  its special day (Den matek, best friends day…). It still needs a normal ID, level,
  category and budget (same ID rules: next free number in its level), but it isn't
  counted in that level. Note: the public key can read these too, so a curious person
  could see future special quests in the API; that's fine.
- **Table `daily_quest_overrides` (special days):** `date` (primary key, one row per
  date) and `quest_id` (must exist in `quests`; `on delete cascade`, so deleting the
  quest removes its special day).
  - Security: RLS on, `anon` has **only** `GRANT SELECT`, plus one policy „Kdokoli může
    číst speciální dny" (`for select to anon using (true)`). Checked 20 Nov 2026:
    insert / update / delete get `401`.
- **Adding a special day (owner's steps):**
  1. *(Optional, for a special-only quest)* Table Editor → `quests` → Insert row: the
     next free `id` in a level (e.g. `easy-044`), `level`, `category`, `budget`, `text`,
     and tick **`special_only`** (true). `added_on` fills in by itself.
  2. Table Editor → `daily_quest_overrides` → Insert row: `date` (e.g. `2027-05-09`)
     and `quest_id` (e.g. `easy-044`, or any normal quest's ID). Save.
  3. Check it in the app with `?datum=2027-05-09` at the end of the address, e.g.
     https://katerina-g59.github.io/side-quest-app/?datum=2027-05-09
  - A special day doesn't shift the automatic deck: the next day continues normally.
  A new column the app asks for must exist **before** the app version using it is pushed
  (otherwise quest loading / sending fails).
- **Adding or fixing a quest:** Supabase → Table Editor → `quests` → Insert row (or edit
  the text). Fill in a budget too. Same ID rules as below. Feminine verb forms. The app picks it up on reload.
- **Adding a quest someone suggested (owner's manual approval steps):**
  1. Table Editor → `feedback`: find the row with `type = quest`, and note its
     `instagram` and `consent_credit`.
  2. Table Editor → `quests`: sort by `id` and find the highest number in the chosen
     level. The new quest gets the **next free number** (never reuse an ID; never
     `medium-032`).
  3. Insert row: `id`, `level`, `category`, `budget`, and `text` (rewritten if needed,
     feminine verb forms).
  4. Fill in `author_instagram` (without @) **only if** `consent_credit` is true **and**
     the owner has opened `instagram.com/<handle>` and checked the account exists.
     Otherwise leave it empty: the quest is added without a signature.
  5. Reload the app: the quest shows „Quest od @handle 💌".
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

### Table `feedback` (messages from „Napiš mi 💌")
- Created by `supabase/add-feedback.sql` (run once in the SQL Editor; safe to re-run, it
  never deletes messages).
- Columns: `id` (uuid, automatic), `created_at` (automatic), `type` (only `chyba`,
  `zpetna_vazba`, `quest`), `message` (required, 1–500 characters, not only spaces),
  `instagram` (optional, max 50), `device_info` (optional, only allowed when
  `type = 'chyba'`, max 500), `consent_credit` (optional yes/no; "yes" only allowed
  when `type = 'quest'` and `instagram` is filled in, constraint
  `feedback_consent_credit_check`).
- **Security (do not loosen):** RLS on. `anon` has **only** `GRANT INSERT` on the five
  columns `type, message, instagram, device_info, consent_credit` (so `id` / `created_at`
  can't be faked),
  and one policy „Kdokoli může poslat zprávu" (`for insert to anon with check (true)`).
  No select/update/delete grants or policies for `anon` or `authenticated`: nobody can
  read the messages through the app or the public key.
- **Reading messages:** only the owner, in the Supabase dashboard → Table Editor →
  `feedback` (sort by `created_at`). Deleting old messages is done there too.

### Email for new feedback (Edge Function `feedback-email` + Resend)
- Flow: new row in `feedback` → **Database Webhook** (on INSERT into `public.feedback`) →
  Edge Function `feedback-email` → Resend → email to the owner. If the email fails, the
  row is still saved.
- Everything is set up in the **dashboard only** (the owner doesn't use the Supabase CLI).
  `supabase/functions/feedback-email/index.ts` is a **backup copy** of the code in the
  dashboard: after changing it, paste it into Edge Functions → the function → Code and
  Deploy.
- **Name vs. address:** the dashboard shows the name `feedback-email`, but the function's
  slug (its address, fixed at creation) is **`super-responder`**:
  `https://rrcclzjcbupgshdsskgm.supabase.co/functions/v1/super-responder`. The webhook
  points to it. Working since 15 Nov 2026; the first test email arrived fine.
- Email:
  - Subject by type: „🐛 Nová chyba v Side Quest appce", „📩 Nová zpětná vazba v Side
    Quest appce", „✨ Nový návrh questu v Side Quest appce".
  - Content: the type, the time (Czech time, e.g. „15. 11. 2026 21:04"), Instagram (as
    a link if it looks valid), for quest suggestions with Instagram „Souhlas s uvedením
    IG: ✅ ano / ❌ ne", the message, and the device info for bugs.
  - User text is HTML-escaped.
- **Secrets** (Supabase → Edge Functions → Secrets; set by the owner; **never** in the
  code, the repo or the chat):
  - `RESEND_API_KEY`
  - `WEBHOOK_SECRET` (a long random password)
  - `NOTIFY_EMAIL` (the owner's address; kept out of the public repo)
  - optional `FROM_EMAIL`; default `Side Quest <onboarding@resend.dev>`, which without
    a verified domain can only send to the Resend account's own email.
- **Protection:** "Verify JWT" is **off** for this function. Instead, every request must
  have the header `x-webhook-secret` equal to `WEBHOOK_SECRET` (compared in constant
  time), otherwise `401` and no email. Only POST; only `INSERT` on `feedback` sends
  anything.
- **Webhook settings:**
  - table `public.feedback`, event Insert
  - type "Supabase Edge Functions" → `super-responder` (shown as `feedback-email`), method POST
  - HTTP header `x-webhook-secret: <the same password>`
- **Logs:** Edge Functions → `feedback-email` → Logs / Invocations. Webhook calls:
  Database → Webhooks, or the `net._http_response` table.
- Limits: Resend free plan is about 100 emails/day. The 30 s spam limit is only in the
  app.

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
4. **Users' photos never leave the browser.** The share feature draws them locally
   (canvas) and only the user sends the finished image, through her own share menu.
   Never upload, log or store a photo anywhere.
5. **All quest text and UI text is in Czech.** The quests are written for women,
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
  - quests load (96 in Nov 2026, all with a valid budget), and the progress counts are right
  - Filtry popup (options change nothing until „Potvrdit filtry", closing without
    confirming discards, Zrušit filtry cancels everything at once, tags, both "nothing matches"
    messages), Hotovo / Zpět and deník work
  - a copy with a wrong `SUPABASE_URL` shows the friendly error, and the button retries
  - „Sdílet 📤":
    - The button shows and hides with „Zpět", and the deník has one per quest.
    - The image is 1080×1920 with the card top/bottom inside the safe zone, and a long
      quest fits at 44 px or more.
    - The card-only PNG has transparent corners.
    - A JPEG with EXIF orientation 6 comes out upright, and an 8000×6000 photo works.
    - The share / fallback paths work (stub `navigator.share` / `canShare`).
    - The only network requests are fonts and the Supabase quests read.
    - Test photos go in as base64 in a `.js` file, set via `DataTransfer` on the input.
    - Headless Edge's `--virtual-time-budget` doesn't wait for decoding big images or
      `createImageBitmap`: give it real time (a busy loop) or check the canvases
      directly.
  - Streak: `tests.html` shows all ✅. In the app:
    - the line + hint, Hotovo → +1, Zpět → back
    - milestone celebration once (none on load, gone after Zpět)
    - Quest dne Hotovo counts
    - deník longest
    - share top line
    - Začít znovu → hidden + milestones cleared
    - `?datum=` next week (kept + hint) and 2 weeks later (0)
  - Quest dne:
    - **Simulate 3 years:** the same date gives the same quest, no repeats within a
      round, every quest once per round, the gap before a repeat is ≥ 30 days, and
      only the right pool is used.
    - **Prague midnight:** check winter, summer and both clock-change days.
    - **Stability:** adding a fake quest with `added_on` = today changes nothing until
      the next round; removing a quest changes today in ~30 %.
    - **The pill + popup:** the pill sits next to „Můj deník 📖", opens and closes the
      popup, and shows ✓ when done. Inside: Hotovo / Zpět / Sdílet (Sdílet opens over the
      popup), "already done", filters ignored, a stubbed
      override (any quest + a special-only one), and override fetch failing →
      automatic.
    - **Address:** `?datum=` and an invalid `?datum=`; a wrong `SUPABASE_URL` shows the
      friendly message.
    - Load the test script in `<head>` (to stub `fetch`) and start it on
      `DOMContentLoaded`.
  - „Napiš mi 💌": send stays faded without type/text, counter, bug note only for
    „Chyba 🐛", thank-you after sending, error keeps the text, 30 s wait message
- After any database change, recheck with the publishable key (e.g. `curl`) that
  `quests`: insert / update / delete are still refused, and `feedback`: insert works
  (with `Prefer: return=minimal`) but select / update / delete are refused.
- After changing `feedback-email`: calling `…/functions/v1/super-responder` without /
  with a wrong `x-webhook-secret` must give `401`, and a test row in `feedback` must produce one email.

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
- ~~**Budget filter**~~ – done (Nov 2026): `budget` in Supabase, Budget section in the
  Filtry popup, budget label on the card.
- ~~**Hide filters under one button**~~ – done as the „Filtry" popup with tags.
- ~~**Feedback form**~~ – done (Nov 2026) as „Napiš mi 💌", see the `feedback` table above.
- ~~**Email notification when new feedback arrives**~~ – done (Nov 2026): Database
  Webhook → Edge Function `feedback-email` → Resend, see above.
- ~~**Multi-select in filters**~~ – done (Nov 2026): several options per section, one tag
  per option.
- ~~**Sharing a completed quest as an Instagram story**~~ – done (Nov 2026): „Sdílet 📤".
- **Freely movable card on the share image (drag with a finger)**, instead of only
  Nahoře / Dole.
- ~~**Quest dne**~~ – done (Nov 2026): daily shared quest, special days, special-only quests.
- ~~**Streak**~~ – done (Nov 2026) as a gentle **weekly** streak (any quest counts), see
  above. (The original idea was days in a row of Quest dne; the owner chose weeks.)
- ⭐ **Profile ("Můj profil") – liked by the owner, on the back burner (Nov 2026).** Goal:
  a lighter main screen (the owner finds the app getting heavy and samey).
  - **Entry:** a round avatar button in the top-right corner (her photo, else her first
    letter, else a star). It opens a full-screen sheet (a `<dialog>`, slides up on a
    phone, ✕ to close). Not a separate page, so double-clicking `index.html` still works.
  - **Contents:**
    1. Profile picture + name (optional), e.g. „Ahoj, Káťo ✨".
    2. „Můj deník 📖" moves here (off the main screen).
    3. Small stats: total completed, per level, Quest dne count; the 🔥 streak later.
    4. **Colour themes** (the owner likes them): Víno (default, today's colours),
       Levandule, Šalvěj, Noc (dark). A theme swaps the 4 `:root` colours; check text
       contrast for each.
    5. **„Začít znovu" and „Napiš mi 💌" move here** (owner's decision), plus the
       Instagram link.
  - Main screen afterwards: Quest dne, levels, button, card.
  - **Storage:** everything stays on the device (localStorage, in try/catch, like
    progress). No accounts. Each browser/device (and iPhone Safari vs. home-screen app)
    has its own profile; links to the "syncing" idea below.
  - **Privacy:** the profile photo follows rule 4 (never leaves the browser). Store it
    downscaled to a small circle, e.g. 256×256, so it's tiny.
  - Maybe later: her name on the share image („Splnila Káťa ✅"), only if she opts in.
  - **Streak next to the profile picture (owner's wish):** e.g. „🔥 3" when she has
    already completed a quest this week, „⚠ 3" when this week still has no quest
    (uses `computeStreak(...).thisWeekDone` from `streak.js`).
  - **Suggested order:** (1) avatar + sheet with photo, name and deník; (2) stats +
    moving Začít znovu / Napiš mi; (3) themes. The Quest dne pill could later sit next
    to the avatar.
- **Syncing progress across devices (later)**, so the phone and the computer know
  the same completed quests. This would need an account or a small online storage
  service. Because progress is already stored by ID, it can be moved there later.
