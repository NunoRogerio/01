# Working on this repo

- Read DESIGN.md before any visual change and follow it; record new visual decisions there.
- Rules apply app-wide unless a place is named.
- For changes touching several screens, show screenshots of every affected screen before calling it done.
- Bump the ?v= of any changed shared script (prefs.js, i18n.js, live.js, fit.js, chat.js, tour.js, stats.js, feedcam.js, trophy.js, avatar.js, menu.js, mapsearch.js) in every .html, update version.txt, commit and push to main.
- To clean unused files and sync, use the Cleaner agent (`.claude/agents/cleaner.md`).
- Every screen and panel, new or old, responds to the preferences panel choices (primary colour, palette, text size, spacing; theme when it is on). Use `var(--wf-y)` for the primary and the palette variables `--wf-page`, `--wf-surface`, `--wf-fill`, `--wf-ink`, `--wf-ink2`, `--wf-sec`, `--wf-track` (prefs.js) in style sheets and SVG; inline styles must be in the browser's own form (`font-size: 16px`, `rgb(…)`) so prefs.js can match them (stats.js `norm()` shows how for HTML built as text). Check a new screen with a non-default palette, text size and spacing before calling it done.
