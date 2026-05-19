# SDC! Summer Design Camp 2026 — Cursor Build Prompt

## Project Overview

Rebuild the SDC! Summer Design Camp 2026 app as a production-quality **Next.js 14** mobile-first web app (App Router). The reference file is `SDC2026_v3.html` — replicate it as closely as possible. Every interaction, layout, color, typeface, and component behavior in the HTML file is the source of truth. This prompt explains the architecture, design system, and key behaviors. When in doubt, open the HTML file and match what you see.

The app is used by ~170 high school campers at UTK's College of Architecture + Design, their teaching assistants, and camp staff. It runs primarily on phones. Desktop users are mostly staff/admins.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS Modules for component-level overrides
- **Database:** Supabase (PostgreSQL via Prisma)
- **Auth:** NextAuth.js with credentials provider (pre-assigned logins only, no self-registration)
- **File storage:** Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`
- **Image processing:** Sharp (resize, strip EXIF, compress on upload)
- **Realtime:** Supabase Realtime for group chat
- **PDF export:** Puppeteer (portfolio PDF) + custom IDML generator (camp book)
- **Language:** TypeScript throughout
- **Deployment:** Vercel

---

## Design System

### Fonts
Load from Google Fonts. All three must be present before first paint.

```
Barlow Condensed — weights 400, 600, 700, 800, 900; also italic 700, 900
Barlow            — weights 300, 400, 500, 600; also italic 300
DM Mono           — weights 300, 400, 500
```

Usage rules:
- `Barlow Condensed 800–900` — all display text, page titles, headings, nav labels, stat numbers, person names, event names. Always tracked slightly loose (`letter-spacing: 0.02em`).
- `Barlow 300` — all body copy, bios, descriptions, chat messages
- `DM Mono 400` — all metadata, tags, timestamps, labels, monospaced data. Always uppercase with `letter-spacing: 0.08–0.18em`.

### Color Palette (CSS variables)

```css
:root {
  --orange:       #FF8200;   /* UTK orange — primary brand, CTAs, active states */
  --orange-dk:    #C86000;   /* Pressed/darker orange */
  --orange-pale:  #FFF3E6;   /* Orange tint backgrounds */
  --orange-mid:   rgba(255,130,0,0.14);

  --white:   #FFFFFF;
  --off:     #F6F3EE;   /* Page background */
  --cream:   #EDE8DF;   /* Secondary backgrounds, chips */
  --border:  rgba(0,0,0,0.09);
  --border2: rgba(0,0,0,0.05);

  --ink:   #18150F;   /* Primary text */
  --ink2:  #3A342A;   /* Secondary text */
  --ink3:  #6B6257;   /* Tertiary text, labels */
  --ink4:  #A09890;   /* Placeholder, muted */

  /* Track/discipline accent colors */
  --blue:     #1A6FAA;   /* Graphic Design */
  --blue-pale:#EAF4FB;
  --green:    #2E7D46;   /* Landscape Architecture */
  --grn-pale: #EAF5EE;
  --purple:   #6B3FA0;   /* Interior Architecture */
  --pur-pale: #F2ECFA;
  --gold:     #B88A00;   /* Final Project day */
  --gld-pale: #FDF6E3;
  --warm:     #8C4A2F;
  --warm-pale:#FBF0EB;

  /* Border radius tokens */
  --r:    16px;   /* Cards, sheets, large elements */
  --rsm:  10px;   /* Small cards, tags */
  --pill: 999px;  /* Pills, nav, buttons */
}
```

### Schedule Track Colors

| Day       | Track Name            | Color     | Pale BG   |
|-----------|-----------------------|-----------|-----------|
| Sunday    | Arrival Day           | #6B6257   | #EDE8DF   |
| Monday    | Architecture Day      | #FF8200   | #FFF3E6   |
| Tuesday   | Graphic Design Day    | #1A6FAA   | #EAF4FB   |
| Wednesday | Landscape Architecture| #2E7D46   | #EAF5EE   |
| Thursday  | Interior Architecture | #6B3FA0   | #F2ECFA   |
| Friday    | Final Project Day     | #B88A00   | #FDF6E3   |
| Saturday  | Departure Day         | #6B6257   | #EDE8DF   |

### SDC! Logo
The logo is a single inline line of text, not a grid. Rendered as:
```
SDC!
```
Where `D` is in `--orange`, the other letters in `--ink`. Font: Barlow Condensed 900 Italic. Sizes: `xl=72px`, `lg=48px`, `md=32px`, `sm=22px`. No image file — always text.

### Key spacing rules
- Page content max-width: `430px`, centered
- Horizontal padding: `20px` on most content, `16px` on cards
- Page top padding: `52px` (accounts for status bar area)
- Bottom padding: `104px` (nav bar clearance)
- Card gap: `8–12px`
- All bottom sheets use `calc(88px + env(safe-area-inset-bottom))` as bottom padding so content clears the liquid glass nav

---

## Navigation

### Liquid Glass Bottom Nav

Fixed, floating pill at the bottom of the screen. Exact CSS:

```css
position: fixed;
bottom: 14px;
left: 50%;
transform: translateX(-50%);
width: calc(100% - 28px);
max-width: 402px;
background: rgba(255,255,255,0.6);
backdrop-filter: blur(28px) saturate(200%);
-webkit-backdrop-filter: blur(28px) saturate(200%);
border: 1px solid rgba(255,255,255,0.85);
border-radius: 999px;
box-shadow: 0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.95);
display: flex;
align-items: center;
z-index: 500;
padding: 6px 8px;
gap: 2px;
```

**Nav items (left to right):** Schedule · Gallery · **Home (center)** · Profile · About

The **Home button is the center item** — rendered as a raised orange circle (`52×52px`, `border-radius: 50%`, `background: --orange`, `box-shadow: 0 4px 18px rgba(255,130,0,0.42)`, `margin: -6px 2px`). It must use `display:flex; align-items:center; justify-content:center` so the house icon is perfectly centered. The other four nav items are `flex:1`. Active state: `color: --orange`, `background: rgba(255,130,0,0.09)`, `border-radius: 999px`.

---

## Pages

### 1. Home

**Hero section** (white card with subtle decorative circles):
- Top row: "SUMMER DESIGN CAMP" eyebrow (DM Mono, orange, with 18px orange line before) flush left, UTK CoA+D metadata flush right
- SDC! logo at `xl` size (72px)
- Tagline: "One week. Four disciplines. Real studio work." (Barlow 300, `--ink3`)
- Three stat circles in a row, `justify-content: space-between`: **7 Days**, **170 Campers**, **12 Groups**. Each circle is `78×78px`, `border-radius:50%`, `background: --orange-pale`, `border: 1.5px solid rgba(255,130,0,0.2)`. Number in Barlow Condensed 900 orange, label in DM Mono.

**Today banner** (full-width orange card, `border-radius: --r`, cursor pointer):
- Clock icon in white circle left
- "NOW · UP NEXT" label (DM Mono, white/70%)
- Activity name (Barlow Condensed 800, white, 22px)
- Chevron right, white/70%

**Mini Group Chat** (on home, not in profile):
- Chat preview showing last few messages (max-height: 180px, scrollable)
- Message bubbles: others = `--off` background, you = `--orange` background white text, TA messages = `--orange-pale` background with orange border
- Input bar at bottom with send button (orange circle)
- Header taps to open full-screen chat overlay
- Full-screen chat: slides up from bottom, back button top left, same message rendering, input at bottom with `padding-bottom: env(safe-area-inset-bottom)`

**Mini Campus Map** (below chat, tappable to full map page):
- SVG illustration, no third-party map API needed at this stage
- Tapping opens the full Campus map page

---

### 2. Schedule

**Day selector**: horizontal scroll of 7 circle chips (52×52px). Active chip: `background: track color`, white text. Below chips: track banner showing day name and date in track color on pale background.

**Timeline**: two-column grid (`52px` time column + event column). Each event is a white card with a 3px left border in the track color. Tapping opens a bottom sheet.

**Bottom sheet content** (for studio/charrette events):
- Type pill (track color)
- Event name (Barlow Condensed 900, 30px)
- Time + location in DM Mono with inline SVG icons
- Body description (Barlow 300)
- Materials list (each item in `--off` background card with colored dot)
- **"View Charrette Brief" button** when `event.charrette` is set — tapping this replaces sheet content with the full charrette brief (number, title, intro paragraph, bulleted task list, notes). The button must NOT use template literals to set its `onclick` string — use `data-charrette` attribute and a delegated click handler instead.

**Jam Session** appears at 4:30 PM every day Monday–Thursday. Type: `social`. No charrette.

---

### 3. Gallery

Instagram-style vertical feed. **Only on the Gallery page** — no other page has this component.

Each post structure:
```
<article class="fd-post">
  <div class="fd-img-wrap">
    <img> (full width, object-fit:cover, natural aspect ratio, max-height:420px)
  </div>
  <div class="fd-foot">
    <div class="fd-actions">
      <HeartButton />           ← left side
      <TrackDayTag />           ← pill with track color
    </div>
    <p class="fd-caption">     ← clearly below actions row, Barlow 14px
  </div>
</article>
```

Caption sits **below** the heart and tag — never overlaid on the image. This is the critical design rule. The separation between image and caption must be unambiguous.

**Heart button**: outline heart by default, filled orange on tap, no count shown.

**Tap post**: opens lightbox (full-screen dark overlay, image centered, caption and tag below, left/right navigation arrows).

**Upload FAB**: fixed orange circle bottom-right, opens upload sheet. Sheet has photo picker zone, optional title input (50 char max), auto-tags for session/group/date. Submit sends to moderation queue.

**Filter chips**: horizontal scroll above feed. All / Architecture / Graphic Design / Landscape / Interior Arch / Final Project.

**Image data**: The 9 gallery images from SDC 2025 are included in the HTML as base64. In the Next.js app, these should be migrated to Cloudflare R2 and served via signed URLs. The same 9 images should appear in the same order with the same captions:

| Order | Subject | Caption |
|-------|---------|---------|
| 1 | Group at The Rock | We painted The Rock. SDC was here. |
| 2 | Cardboard lamp/furniture | Cardboard, a light, and a few good ideas. |
| 3 | Origami fish installation | Gone fishing. |
| 4 | Sketchbook spread | This is making my brain explode. |
| 5 | Handprint on head | Getting a little too into it. |
| 6 | Interior arch sketch + paper models | *(no caption)* |
| 7 | SDC clapper board | Scene 02, Take 01. SDC '25. |
| 8 | Knoxville city collages | *(no caption)* |
| 9 | Photo collage frames | *(no caption)* |

---

### 4. Profile

**Header**: circular avatar (80px, gradient), camper name (Barlow Condensed 900), track pill (colored dot + DM Mono label), group + TA in DM Mono. Stats row: Uploads / Sessions / Likes.

**Export buttons**: "PDF Portfolio" (orange primary) + "Share" (outline).

**Session blocks**: each has a session number circle, title, description, and a photo grid. Layouts vary: `2fr 1fr` with tall main photo, or `1fr 1fr 1fr` for three equal.

**Book template preview**: shows a light-on-white "print layout preview" card with the SDC! logo, camper name, 2×2 photo grid, caption paragraph, and page number.

**No chat on this page.** Chat is only on Home.

---

### 5. Campus Map

SVG illustration map (no external map API). Correct building positions:

| Pin | Label | Position in SVG (400×260 viewBox) |
|-----|-------|----------------------------------|
| H (orange) | Magnolia Hall | Top-left, ~(48, 57) |
| T (blue) | TREC / Pool | Left side, below Volunteer Blvd, ~(54, 156) |
| D (green) | Rocky Top Dining | Center-upper, ~(239, 52) |
| A (blue) | Art + Architecture | Right side, ~(337, 146) |

**You Are Here**: pulsing orange ring animation on H pin (`<animate>` SVG tag, radius 14→22→14, duration 2s, repeat indefinite).

**TA indicator**: small purple circle labeled "TA" offset from the You Are Here pin.

**Location cards below map**: Magnolia (home) → TREC/Pool (~5 min) → Rocky Top Dining (~12 min) → Art + Architecture (~14 min).

---

### 6. About

Four tabs: **SDC!** · **Programs** · **The Building** · **UT + Knoxville**

#### SDC! Tab
- Orange intro card (Summer Design Camp header, camp description)
- Staff listed in sections: Camp Director → Academic Advisors → Teaching Assistants → Floaters
- Each staff card is tappable → opens person modal
- Person modal: circular avatar or headshot photo, name, role, full bio, optional portfolio/UTK profile link, Prev/Next navigation

**Person carousel groups** — navigation is scoped. Tapping Prev/Next in the modal only cycles within the same group:
- `staff`: ac, jb1, jb2, dm, ms, sb, cw, mj
- `arch`: jmagner, mstanley, fhsu, swall
- `gd`: ccote, eepstein, kmitchell, lbrine, cstaples, tarment
- `ia`: fdean, hkim, lteston
- `la`: amadl, sbolivar

**Profile photos**: Each person object has a `photo: ''` field. When a URL is present, render as `<img>` circular headshot. When empty, render colored initials circle. To populate:
1. Log into LinkedIn in a browser
2. Navigate to the person's profile
3. Right-click headshot → "Open image in new tab"
4. Copy that URL into the `photo` field
5. UTK faculty pages at `archdesign.utk.edu` often have direct headshot images — check those first

#### Programs Tab
Four expandable program cards (Architecture / Graphic Design / Interior Architecture / Landscape Architecture). Each expands to show description and faculty carousel. Faculty carousel items are the same person cards as in SDC! tab. Tapping opens the same modal with carousel scoped to that program's faculty.

#### The Building Tab
Dark card (`--ink` background) with animated circle decorations, building stats in orange circle badges (160K sq ft / 360 ft atrium / 1981 / 450+ desks), full history text in white/70%.

#### UT + Knoxville Tab
Four culture cards with colored image header areas, title, and description text.

---

## Overlays and Sheets

All bottom sheets share this CSS:
```css
border-radius: 24px 24px 0 0;
max-height: 80vh;
overflow-y: auto;
padding: 8px 20px calc(88px + env(safe-area-inset-bottom));
animation: slideUp 0.28s cubic-bezier(0.22, 0.68, 0, 1.2);
```

The `calc(88px + env(safe-area-inset-bottom))` bottom padding is critical — it ensures the sheet content and its bottom button clear the liquid glass nav bar on all phones including iPhone notch models.

Sheet handle: `36px wide, 4px tall, border-radius: 2px, background: --cream`, centered at top.

---

## Data Structures

### PEOPLE Object (reference)
23 entries total. Key fields per person:
```typescript
interface Person {
  init: string;         // 2-letter initials for avatar fallback
  color: string;        // CSS gradient for avatar background
  photo: string;        // Direct image URL — empty string until populated
  name: string;
  role: string;
  bio: string;          // Full paragraph, no em-dashes, no AI phrasing
  link: string;         // UTK profile or portfolio URL
  linkLabel: string;    // Display text for link
}
```

### Schedule Event
```typescript
interface ScheduleEvent {
  t: string;            // Time string e.g. "9:00 AM"
  n: string;            // Event name
  type: 'meal' | 'lecture' | 'studio' | 'social' | 'free' | 'arrival';
  loc: string;          // Location string
  desc: string;         // Description, \n for paragraph breaks
  mats: string[];       // Materials list (empty array if none)
  charrette: string | null; // Charrette key e.g. 'mon_1' or null
}
```

### Charrette Brief
```typescript
interface Charrette {
  day: string;          // e.g. 'Monday'
  num: string;          // e.g. '01'
  title: string;
  track: string;
  tc: string;           // Track color hex
  tp: string;           // Track pale background hex
  intro: string;        // Overview paragraph
  tasks: string[];      // Bulleted task list
  notes: string;        // Optional note at bottom
}
```

8 charrettes total: `mon_1`, `mon_2`, `tue_1`, `tue_2`, `wed_1`, `wed_2`, `thu_1`, `thu_2`.

---

## Critical Implementation Notes

### No nested template literals
The HTML prototype had bugs caused by nested backtick template literals (backtick inside backtick) for building innerHTML strings. In the Next.js app, all dynamic rendering is done via JSX — this problem does not apply. But if any vanilla JS string-building is ever needed, use string concatenation or array `.join('')`, never nested template literals.

### No em-dashes anywhere
All copy uses plain hyphens or no dash at all. This applies to bios, descriptions, schedule copy, and any UI text. No `—` character anywhere in the codebase.

### Role-based access
Five roles with server-enforced permissions:

| Role | Key permissions |
|------|----------------|
| Boss | Full access, export book, manage all accounts |
| Advisor | Edit schedule, manage uploads, run polls |
| Student Head | View groups, flag content |
| TA / Floater | View schedule, see poll results, view group roster |
| Camper | View schedule, upload (with approval), gallery, like, vote |
| Parent | View public schedule, view child's portfolio link only |

Role is stored server-side, attached to the session. Never trust role from client.

### Upload moderation
All camper uploads go to a pending queue. Nothing is publicly visible until an Advisor or Boss approves. Reject reasons are not shown to campers. Only JPG/PNG accepted. Server validates MIME type (do not trust file extension). EXIF stripped via Sharp. Max 10MB. Max 3 uploads per session per camper.

### Group chat
Realtime via Supabase Realtime. Messages are scoped to a group (12 groups total). No cross-group messaging. Chat exists on the Home page: a compact preview (last few messages, 180px max-height) and a full-screen overlay (triggered by tapping the chat header expand icon). Both views sync — a message sent in either appears in both.

### Anonymous gallery
Camper names are not shown on gallery posts by default. Only track + day tag. Like count is not shown. Heart button is a quiet interaction with no social feedback loop. No comments anywhere.

### Evening polls
One active poll per evening. Campers vote once; vote is locked after submission. Staff see live results and headcounts. Poll options are created by advisors.

---

## File Structure (suggested)

```
/app
  /home/page.tsx
  /schedule/page.tsx
  /gallery/page.tsx
  /profile/page.tsx
  /map/page.tsx
  /about/page.tsx
  layout.tsx              ← Liquid glass nav lives here
/components
  /ui
    BottomSheet.tsx
    PersonModal.tsx
    Lightbox.tsx
    FullscreenChat.tsx
  /home
    HeroSection.tsx
    TodayBanner.tsx
    MiniChat.tsx
    MiniMap.tsx
  /schedule
    DayStrip.tsx
    Timeline.tsx
    ActivitySheet.tsx
    CharretteSheet.tsx
  /gallery
    FeedPost.tsx
    UploadSheet.tsx
  /about
    StaffCard.tsx
    ProgramCard.tsx
    BuildingCard.tsx
/lib
  /data
    people.ts             ← PEOPLE object with photo:'' fields
    charrettes.ts         ← All 8 charrette briefs
    schedule.ts           ← Full SCHED object Mon–Sat
  /db
    prisma.ts
  /storage
    r2.ts
  /auth
    options.ts
/styles
  globals.css             ← CSS variables, font imports, base styles
```

---

## Starting Point

The reference HTML file `SDC2026_v3.html` is a single-file prototype (~8.5MB including base64 images). It is the visual and behavioral spec. When building a component, open the HTML, find that component, and match it exactly.

Priority build order:
1. Design system (CSS variables, fonts, layout shell, nav)
2. Schedule page (most-used feature, has the complex charrette system)
3. Gallery page (has the real photo data)
4. Home page
5. About page (people modal, program cards)
6. Profile page
7. Campus map
8. Auth + role system
9. Upload + moderation pipeline
10. Group chat (Supabase Realtime)
11. Poll system
12. PDF export (Puppeteer portfolio + IDML book)
