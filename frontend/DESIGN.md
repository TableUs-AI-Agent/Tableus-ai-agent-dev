# TableUs web design

Two animated moments carry the brand, and Brian wants both kept and improved:

- **Landing hero** (`components/table-scene.tsx`): four people's wishes around a
  table, then the place that fits all of them lands in the middle.
- **The 3D table** (`components/tabletop-scene.tsx`, from the hackathon): each
  person in a plan is a plush character on a little planet, the planet spins
  while picks are found, and the four picks orbit as cards. It sits at the top
  of every plan. Mobile shows the same scene through `/embed/table` in a web
  view, so improvements land on both.

Everything else stays quiet so these moments and the real picks carry the brand.
The 3D table keeps its original bright sky-blue and sunny-yellow colors; Brian
prefers them to a muted version. If the palettes need to meet, change the app
palette toward the scene, never the other way.

## Tokens

| Name | Hex | Use |
| --- | --- | --- |
| Bottle | `#17301F` | Text, dark bands, primary outlines |
| Leaf | `#F2F6EE` | Page background |
| Radicchio | `#B3245C` | Primary actions, focus rings |
| Butter | `#F4CF4A` | The chosen place, vote ranks, highlights |
| Sage | `#C9D9C6` | Secondary fills, quiet borders |
| White | `#FFFFFF` | Raised surfaces (pick cards, inputs) |

Type: Darker Grotesque (800–900) for display, tight leading, sentence case.
Figtree for everything else. Scale: 14 / 16 / 20 / 28 / 44 / 72 / 112.

## Rules

- Sentence case everywhere; no all-caps labels, no eyebrows over headings.
- Numbers only where the content is a sequence (how it works, vote ranks).
- Radius follows hierarchy: pills for wishes and chips, 20px for pick cards,
  8px for inputs and buttons. No shadow kit; pick cards get a 2px Bottle
  outline instead.
- Butter marks the winner and your ranks. Nothing else is yellow.
- Motion beyond the two moments above only answers a tap.
  `prefers-reduced-motion` shows the end state.
- App screens are a single centered column (max 36rem) built for phones first.
