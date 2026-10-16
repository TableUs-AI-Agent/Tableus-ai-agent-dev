# TableUs art

Custom images for web and mobile: the mascot, the app icon and a few spot
illustrations. Source images live here; the sized copies the apps load live in
`frontend/public/art/` and `mobile/assets/art/`.

## How images get made

GPT Image through Brian's ChatGPT subscription, by way of the Codex CLI signed
in with that account. No API key and no per-image bill.

```bash
scripts/art.sh mascot-wave
```

`scripts/art.sh <name>` reads `design/art/prompts/<name>.txt`, prepends the
shared style in `design/art/prompts/_style.txt`, and saves the result to
`design/art/source/<name>.png`. Run it with no name to list the prompts.

If Codex can't run, paste the same two files into ChatGPT, download the image,
and drop it in `design/art/inbox/` named after the prompt (`mascot-wave.png`).
`scripts/art.sh --inbox` moves inbox files into `source/`.

Curated images from elsewhere must allow commercial app use without per-use
fees (Unsplash or Pexels licenses, MIT or Apache icon sets). Record the source
and license in `design/art/CREDITS.md` when one is added.

## Mascot

Four concepts are in `concepts/` (`mascot-concepts.jpg` shows them together).
The recommendation is **Pip**, a small plush moon that orbits the group's
planet and carries the pick cards. Pip is part of the 3D table's world rather
than another guest at it: everyone else is an animal or fruit plush, and the
picks already orbit the planet. Pip is Butter yellow, the color that already
means "the chosen place". Bao, Olive and Toast are the alternatives. Brian
picks.

## Where art goes

| Asset | Web | Mobile |
| --- | --- | --- |
| Mascot waving | `/welcome`, `/signin` | `welcome`, `sign-in` |
| Mascot thinking | Plan page while picks are found | `plan/[id]` while picks are found |
| Mascot cheering | Lock-in celebration, over the 3D confetti | Same, through the embedded table |
| Mascot holding a blank card | Empty plans list | Empty plans list on `index` |
| Mascot sleepy | No places found, expired invite, errors | Same |
| Mascot with an invite | `/join/[id]` | `join/[id]` |
| App icon | Favicon and Apple touch icon | iOS icon, Android adaptive icon, splash |
| Link preview image | Open Graph image for shared join links | n/a |
| Spot icons (wishes, dietary, budget, distance, vote, lock in) | Landing "how it works", wish chips | Same moments |
| Pip in 3D | Orbiting the planet, carrying the cards | Same, through the embedded table |

Restaurant photos on pick cards come from Google Places and are handled in
their own change, not here.

## Style

The mascot and every illustration share the 3D table's world: toon-shaded
plush toys, soft felt texture, bead eyes, the planet's sky-blue `#31C9FF` and
sunny `#FFE033`→`#7FBE35`, plus the app's Radicchio `#B3245C`, Butter
`#F4CF4A` and Bottle `#17301F`. No text inside images.

UI controls stay on system icons (lucide on web, SF Symbols on iOS) so they
keep native weight and accessibility. Custom art is for moments, not buttons.
