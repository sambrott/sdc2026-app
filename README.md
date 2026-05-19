# SDC! Summer Design Camp 2026

Mobile-first camp app (single-page HTML). Visual and behavior spec: `SDC2026_cursor_prompt.md` (also `README-source-prompt.md`).

## Run locally

```bash
cd sdc2026-app
npx serve . -p 3456
```

Open [http://localhost:3456/](http://localhost:3456/)

## Structure

- `index.html` — full app (Home, Schedule, Gallery, Profile, Campus, About)
- `assets/gallery/` — 9 gallery photos (extracted from the original prototype)
- `build.mjs` — rebuild from `../SDC2026.html` if you edit the source prototype

## Features

- Liquid glass bottom nav (Schedule · Gallery · **Home** · Profile · About)
- Schedule with day strip, track colors, activity sheets, charrette briefs
- Gallery feed (caption below image), filters, lightbox, upload sheet, hearts
- Home: hero, today banner, group chat (mini + fullscreen), mini map
- Profile: portfolio sessions, book preview, export buttons
- Campus map with pulsing “you are here” and TA pin
- About: staff, programs, building, UT + Knoxville; person modal with carousel groups
- Evening poll sheet (from schedule events that reference the poll)

## Rebuild from source

```bash
node build.mjs
```
