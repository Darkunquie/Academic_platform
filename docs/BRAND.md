# Preplyfly — Brand Kit

## Name & meaning
**Preplyfly** = **Prep + Fly**. Prepare hard on the platform, then *take off* in
real exams, interviews, and careers. The `-ly-` middle nods to *amplify*.

- **Tagline:** Prep. Fly.
- **Promise:** *Prepare yourself.*
- **One-liner:** Your AI study platform — learn, practice, and assess from
  School to Professional.

## Voice
Gen-z, hype, plain-spoken. Short sentences. Encouraging, never stuffy.
- Say: "Lock in. Prep. Fly." · "You got this." · "Take off."
- Avoid: corporate jargon, ALL-CAPS shouting, long formal sentences.

## Logo
- **Mark:** coral paper plane on a forest rounded square (`src/app/icon.svg`,
  `src/components/brand/logo.tsx`).
- **Wordmark:** `preplyfly` — lowercase, bold, tight tracking (`-0.02em`).
- Clear space ≥ the mark's height on all sides. Don't recolor the plane or
  stretch the wordmark.

## Color palette
**Primary (brand — auth, admin, marketing):**
| Token | Hex | Use |
|---|---|---|
| Forest 900 | `#0B3D2E` | headings, dark UI |
| Forest 700 | `#155E45` | primary buttons, logo bg |
| Forest 500 | `#1F8765` | accents, success |
| Coral 300 | `#F6A488` | plane highlight |
| Coral 500 | `#EE6A47` | accent / CTA highlight |
| Coral 700 | `#C9462C` | plane fold, emphasis |
| Paper | `#F8F6F1` | page background |
| Ink 900 | `#16181C` | body text |

**Solar accent (student dashboard sub-theme):** amber `#b58900`, orange
`#cb4b16`, blue `#1e40af` — used only inside the student "command" dashboard.
Keep marketing + auth + admin on the **primary forest/coral** palette.

> Canonical brand = **forest + coral**. Solar is a contained sub-theme.

## Typography
- **Display / headings:** Instrument Serif (`--font-serif`)
- **Body / UI:** Geist (`--font-sans`)
- **Labels / mono:** Geist Mono (`--font-mono`) — sentence case, no wide
  tracking (labels were de-shouted app-wide).

## Assets in repo
- Favicon: `src/app/icon.svg`
- App icon (PWA/iOS): `src/app/apple-icon.tsx`
- Social share (OG, 1200×630): `src/app/opengraph-image.tsx`
- Logo component: `src/components/brand/logo.tsx`

## To reserve (do before launch)
- **Domains:** `preplyfly.com` + `preplyfly.app` (Porkbun) · `preplyfly.in` (BigRock)
- **Social:** @preplyfly on Instagram · X · YouTube · LinkedIn
- **Email:** `hello@preplyfly.com`
- **Clearance:** Google + trademark quick-check (domains were free → likely clear)
