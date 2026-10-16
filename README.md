# Cadence — Daily Task Tracker

A calm, personal task tracker built around **daily repetition**. Projects hold
main tasks, tasks hold subtasks, and most tasks simply repeat — every day,
on weekdays, or on days you pick. Step back to any previous day to see exactly
what existed and what you completed.

It runs **entirely in your browser**. No account, no server, no tracking — your
data is saved in this browser's `localStorage`.

> Live app: enable **GitHub Pages** for this repo (Settings → Pages → Deploy from
> branch → `main` / root). It will be served at
> `https://<your-username>.github.io/<repo-name>/`.

---

## Features

- **Projects** — group tasks under colored projects; filter the day to one project.
- **Main tasks + subtasks** — expandable checklists; checking all subtasks completes the task.
- **Recurring by default** — every task repeats daily unless you change it to weekdays, custom days, or a one-time date.
- **Day-by-day history** — ◀ / ▶ to move between days; completed tasks stay recorded on the day you did them. Archiving a task stops it repeating *without erasing past days*.
- **Due dates + priorities** — one-time tasks carry a due date; overdue ones surface on Today. Four priority levels sort and color tasks.
- **Reminders** — give a task a time and get a browser notification. *(See the honest limitation below.)*
- **Search** — filter the current day by task, subtask, or project name.
- **Minimal, calm UI** — one teal accent, light/dark/auto theme, a daily progress ring.
- **Backup / restore** — export your data to a JSON file and import it back (Settings → Backup). Worth doing now and then, since the data lives only in this browser.
- **Installable (PWA)** — "Add to Home Screen" / "Install" for an app-like window, and it works offline.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `N` | Focus the add-task box |
| `/` | Focus search |
| `[` / `]` | Previous / next day |
| `T` | Jump to today |
| `Esc` | Close panel / menu / dialog |

## Honest limitations (by design)

- **One browser, one device.** Data is stored in `localStorage`, so it does **not**
  sync between your laptop and phone, and clearing site data wipes it. Use
  **Settings → Backup → Export** to keep a copy. (Want real sync later? It would
  need a small cloud database — ask and it can be added.)
- **Reminders fire only while a Cadence tab is open.** A pure browser app with no
  server cannot push notifications in the background. Keep a pinned tab open, or
  install it as an app, for reminders to work.

## Run locally

Because the app uses a service worker and a web manifest, open it through a tiny
local server (opening `index.html` as a `file://` works for most things, but the
service worker and install features need `http`):

```bash
# from the repo folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html        markup + app shell
styles.css        all styling (light/dark tokens, calm minimal theme)
store.js          data model, localStorage, recurrence + day-history logic
app.js            rendering, interaction, detail panel, reminders, shortcuts
sw.js             service worker (offline cache + notification click)
manifest.webmanifest, icon.svg, icon-192.png, icon-512.png   PWA assets
```

No build step, no dependencies — just static files.

## License

MIT — see [LICENSE](./LICENSE).
