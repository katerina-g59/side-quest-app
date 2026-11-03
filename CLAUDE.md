# Side Quest Generátor

## What the app does
A small web page that gives overwhelmed young women working in corporate a random
"side quest": a small, fun real-life challenge (e.g. "take a different route home").

- You pick a level (Lehká / Střední / Těžká) and click „Dej mi side quest ✨".
- „Hotovo ✓" marks the shown quest as completed. Completed quests are not offered again.
- Each level shows its progress, e.g. „Splněno 3/20".
- When a level is fully completed, a celebration message appears.
- „Začít znovu" (with a confirmation box) clears all progress.

## Files
- `index.html` – the whole app: page structure (HTML), look (CSS) and behaviour (JavaScript).
- `quests.js` – only the list of quests, grouped by level (`easy`, `medium`, `hard`).
  Each quest is `{ id: "easy-001", text: "..." }`. The file starts with a Czech comment
  explaining how to add quests.

Both files must stay in the same folder. No frameworks, no build step, nothing to install.

## Important rules
1. **Must work by double-clicking `index.html` (no server).**
   - The browser blocks `fetch()` of local files, so quests live in a `.js` file loaded
     with `<script src="quests.js">`, not in `.json`/`.txt`.
   - Don't add anything that needs a server, a build tool or npm.
2. **Every quest has a permanent, unique ID.**
   - Format: level + 3-digit number: `easy-001`, `medium-042`, `hard-120`.
   - A new quest gets the next unused number in its level.
   - Never change, renumber or reuse an ID, even after deleting a quest.
   - Fixing a quest's text is fine; its ID stays the same.
3. **Completed quests are saved in localStorage, by ID.**
   - Key `sideQuestDone`, value a JSON list of IDs, e.g. `["easy-003","hard-007"]`.
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
- Note: the built-in browser pane turns local files into a snapshot that can't load
  `quests.js`. Test with real Edge/Chrome instead, e.g. headless Edge
  (`msedge --headless=new --dump-dom` or `--screenshot`) on a copy of the files in a
  temporary folder.

## Working with the user
The owner is a beginner. Explain plans in simple words and wait for approval before
writing code.

## Roadmap / ideas
- **"In progress" state for long quests**, e.g. a 20 km hike or reading a whole book:
  mark a quest as started and come back to it later. Save it by ID in localStorage too.
- **Quest categories**, e.g. movement, creativity, relationships, rest, so you can
  filter or pick by mood. Add a `category` field to each quest in `quests.js`.
- **Putting the app online with GitHub Pages**, so it can be opened from a phone.
  It's a static site, so this needs no changes to the code: just upload both files.
- **Syncing progress across devices (later)**, so the phone and the computer know
  the same completed quests. This would need an account or a small online storage
  service. Because progress is already stored by ID, it can be moved there later.
