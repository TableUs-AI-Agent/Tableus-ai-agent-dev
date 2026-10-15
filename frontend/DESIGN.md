# TableUs web design

The one memorable thing is the hero: four people's wishes visibly folding into
one pick with a specific reason. Everything else stays quiet so that moment and
the real picks carry the brand.

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
- One orchestrated motion (the hero fold). Other motion only answers a tap.
  `prefers-reduced-motion` shows the end state.
- App screens are a single centered column (max 36rem) built for phones first.
