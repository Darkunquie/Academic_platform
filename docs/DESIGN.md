# Academic Platform — Design System (v2)

**Editorial × Geometric.** A modern learning surface where scholarly typography meets precise geometry. Calm but alive. NYT meets Vercel meets a great textbook.

## Aesthetic

- **Voice:** Editorial confidence with technical precision. Curious, never childish.
- **Mood:** Library on a Sunday morning, but on a 4K monitor.
- **Inspiration:** Instrument (editorial), Linear (precision), Vercel (geometric clarity), Brilliant.org (energy), New York Times (typographic hierarchy).
- **Personality words:** Crisp, deliberate, expressive, generous.

## Color tokens

**Primary — Forest (deep, growth, trust)**
- `primary/950` `#062B1F`
- `primary/900` `#0B3D2E`
- `primary/700` `#155E45`
- `primary/500` `#1F8765`
- `primary/200` `#A8DCC5`
- `primary/100` `#D9EBE3`
- `primary/50`  `#F2F9F6`

**Accent — Coral (editorial spark, CTA highlights, headlines underline)**
- `coral/700` `#C9462C`
- `coral/500` `#EE6A47`
- `coral/300` `#F6A488`
- `coral/100` `#FCE3DA`

**Secondary — Indigo (links, info, geometric accents)**
- `indigo/700` `#3E3A8C`
- `indigo/500` `#5852C9`
- `indigo/300` `#A6A3E8`
- `indigo/100` `#E5E3F8`

**Ink + paper (warm, never pure black)**
- `ink/950` `#0A0B0D`
- `ink/900` `#16181C` (body text)
- `ink/700` `#3A3F47`
- `ink/500` `#6B7280`
- `ink/300` `#C9CCD3`
- `ink/200` `#E2E4E8` (borders)
- `ink/100` `#EFEEEA` (subtle bg)
- `paper`   `#F8F6F1` (page bg — warm cream)
- `white`   `#FFFFFF`

**Dark mode (full system, default-light, user-togglable)**
- `bg`      `#0E1014`
- `surface` `#161A21`
- `border`  `#262B35`
- `text`    `#E8EAED`
- Accents lighten 1 step in dark.

**Semantic**
- `success` `#1F8765`
- `warning` `#D97A1F`
- `danger`  `#B23A3A`
- `info`    `#5852C9`

## Gradients + meshes

- **Hero mesh:** Radial blobs of `coral/300` + `primary/200` + `indigo/300` at 18% opacity, 600px blur, layered behind hero typography. Soft, never loud.
- **Card glow:** Optional 1px-thick `primary/200` ring on featured cards.
- **Glass:** `backdrop-filter: blur(20px)` on overlay cards over hero meshes, with `white/70` fill + `ink/200` border.

## Typography

- **Display headlines:** `Instrument Serif` (or `Fraunces` italic) — used at scale, often italic for editorial flourish
- **Body + UI:** `Geist` (or Inter as fallback)
- **Monospace:** `Geist Mono` (or JetBrains Mono)

Scale (desktop):
- `hero` 72/76 · Instrument Serif 400 italic · -0.02em tracking
- `display` 48/56 · Instrument Serif 400 italic
- `h1` 36/44 · Instrument Serif 400 · -0.01em
- `h2` 24/32 · Geist 600 (sans for section heads — sharper)
- `h3` 18/26 · Geist 600
- `body` 15/24 · Geist 400
- `body-lg` 17/28 · Geist 400 (reading mode)
- `small` 13/20 · Geist 400
- `eyebrow` 11/16 · Geist 500 uppercase tracking 0.12em

Mix rule: serif italic for editorial moments (page heroes, topic titles, empty states). Sans for UI, tables, buttons, navigation.

## Spacing + radius

- Spacing scale: 4 8 12 16 24 32 48 64 96 128 (8pt grid extended)
- Radius:
  - `sm` 8px (chips, pills)
  - `md` 14px (inputs, buttons)
  - `lg` 20px (cards)
  - `xl` 28px (hero cards)
  - `pill` 999px
- **Shadows (layered, multi-stop — not flat)**:
  - `soft`: `0 1px 2px rgba(10,11,13,0.04), 0 4px 12px rgba(10,11,13,0.04)`
  - `pop`: `0 4px 12px rgba(10,11,13,0.05), 0 16px 40px rgba(10,11,13,0.08)`
  - `glow-coral`: `0 0 0 1px #FCE3DA, 0 8px 24px rgba(238,106,71,0.18)`

## Layout

- Max content width: 1280px desktop, fluid below
- Sidebar nav (admin): 260px fixed, dark surface (`ink/900`) with subtle dotted overlay
- Topic reader: 720px column with 96px side margins, generous
- **Auth pages:** **Split-screen** — left 50% editorial hero (giant italic serif + mesh gradient), right 50% white form panel with vertical centered card
- **Dashboard:** asymmetric grid — featured card spans 2 cols, others 1 col
- Cards: white surface on `paper` background, `lg` radius, `soft` shadow, 1px `ink/200` border

## Decorative geometry

Subtle, never busy:
- **Dotted background pattern:** `radial-gradient(circle, ink/200 1px, transparent 1px)` 24px spacing. Used on hero areas + admin sidebar.
- **Geometric chips:** Floating SVG decorations — small circle, triangle, plus sign, soft square — in `coral/300` or `indigo/300` at 30% opacity, anchored top-right or bottom-left of hero cards.
- **Underline accents:** Hand-drawn-feeling thick underline (`coral/500`, 4px, slightly skewed) under key italic words in hero headlines.
- **Numeric eyebrow:** Section labels prefixed `01 — Section Name` in Geist Mono eyebrow style. Adds editorial counting feel.

## Components

**Buttons**
- Primary: `primary/700` bg, white text, `md` radius, 12px 20px padding, `soft` shadow, hover lifts (`pop` shadow) + bg `primary/900`
- Accent CTA: `coral/500` bg, white text, same shape. Used sparingly for editorial highlights.
- Secondary: white bg, 1px `ink/200` border, `ink/900` text, hover `paper` bg
- Ghost: transparent, `primary/700` text, hover underline accent (4px coral underline animation)
- Icon button: 40px circle, `paper` bg, `ink/700` icon, hover `ink/100` bg

**Form fields**
- 48px height (bigger than v1 — modern), `md` radius, 1.5px `ink/200` border
- Focus: 2px ring `primary/500` + `0 0 0 4px primary/100` outer glow
- Label: `eyebrow` style above field
- Floating label option supported for hero forms

**Cards**
- `lg` radius, white bg, `soft` shadow
- Featured cards: `xl` radius, optional `glow-coral` ring, slight rotation (-0.5deg) for editorial energy
- Topic cards: serif italic title + sans body + coral underline accent under title

**Tabs / Pills**
- Pill nav: `paper` bg, active = `ink/900` bg + white text, 4px radius
- Underline tabs: 2px `coral/500` indicator with spring transition

**Status pills**
- `pending` `coral/100` bg + `coral/700` text
- `approved` `primary/100` bg + `primary/700` text
- `rejected` `#FCE0DE` bg + `#B23A3A` text

**Tables**
- Header: `ink/900` bg, white text, eyebrow style
- Rows: white, hover `paper`, 1px `ink/200` row divider
- Numeric cells: Geist Mono

**Audio player (TTS)**
- Floating bar `pill` radius, glass blur, sticky top of reader
- 48px circle play button `primary/700` bg
- Waveform progress (animated bars 3px wide, `primary/500`)
- Speed chip pill: `0.75x · 1x · 1.25x · 1.5x` toggle row

**Empty states**
- Big italic serif sentence ("Nothing here yet.") + small sans helper + single CTA
- Decorated with one floating geometric chip

## Motion

- Transitions: 200ms cubic-bezier(0.22, 1, 0.36, 1) (smooth out)
- Hover: 1-2px translateY lift on cards + shadow swap
- Page enter: 12px Y fade-in, 240ms stagger 40ms per child
- Underline accents: 180ms width animation from 0 → 100%
- No bouncy springs. No parallax. Restrained but alive.

## Hero pattern (auth + landing)

Recurring hero layout:
1. Eyebrow label (`01 — Welcome back`) in mono
2. Giant italic serif headline with one **underlined accent word** in coral
3. Sub-line in sans `body-lg`
4. Floating geometric chip top-right
5. Mesh gradient behind, 18% opacity

## Voice + microcopy

- Editorial second-person. ("Open your next chapter.")
- One bold metaphor allowed per page. (e.g. "Your library, organized.")
- Errors stay factual, dignified. ("This email is already on file.")
- Empty states invite, never apologize. ("No topics yet — add the first one.")
- Never gamified, never patronizing.

## Accessibility

- WCAG AA min — 4.5:1 body, 3:1 large
- 44px min tap target (48px is default)
- Visible focus rings always (2px primary/500 + 4px primary/100 halo)
- Italic serif respects user font scaling
- TTS reads stripped text, respects user-rate preference
- Dark mode honored from `prefers-color-scheme`, user-overridable
- Reduced motion: disable transforms, keep opacity transitions

## What this is NOT

- ❌ Flat shadcn defaults
- ❌ Gamified (XP, streaks, animated mascots)
- ❌ Neon / glass-everything / brutalist
- ❌ Generic SaaS dashboard
