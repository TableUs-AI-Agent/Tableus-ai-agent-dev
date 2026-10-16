# TableUs art

Custom images for web and mobile: the mascot, the app icon and a few spot
illustrations. Source images live here; the sized copies the apps load live in
`frontend/public/art/` and `mobile/assets/art/`.

## How images get made

GPT Image through Brian's ChatGPT subscription, by way of the Codex CLI signed
in with that account. No API key and no per-image bill.

```bash
scripts/art.sh pip-wave
```

`scripts/art.sh <name>` reads `design/art/prompts/<name>.txt`, adds the
shared style in `design/art/prompts/_style.txt`, and saves the result to
`design/art/source/<name>.webp`. Run it with no name to list the prompts.

If Codex can't run, paste the same two files into ChatGPT, download the image,
and drop it in `design/art/inbox/` named after the prompt (`pip-wave.png`).
`scripts/art.sh --inbox` moves inbox files into `source/`.

Curated images from elsewhere must allow commercial app use without per-use
fees (Unsplash or Pexels licenses, MIT or Apache icon sets). Record the source
and license in `design/art/CREDITS.md` when one is added.

## Mascot

**Pip**, a small plush moon that orbits the group's planet and carries the
pick cards. Pip belongs to the 3D table's world rather than being another
guest at it: everyone else is an animal or fruit plush, and the picks already
orbit the planet. Pip is Butter yellow, the color that already means "the
chosen place". The other concepts (Bao, Olive, Toast) are in `concepts/`.

Prompts that mention Pip are sent with `prompts/_pip-reference.jpg` so new
poses stay on model. After generating, `python3 scripts/art_export.py` sizes
everything into the apps.

## Where art goes

| Art | Web | Mobile |
| --- | --- | --- |
| Pip waving | `/signin`, `/welcome` | `sign-in`, `welcome` |
| Pip holding a blank card | Empty plans list | Empty plans list |
| Pip thinking (bobs while picks are found) | "Ready when everyone is" card | Same card |
| Pip with an invite | "Send this link" card, `/join` while joining, landing CTA | "Send this link" card, `join` before sign-in |
| Pip cheering | "You're going to" after lock-in | Same |
| Pip sleepy | Load errors, broken invite links | Load errors, broken or failed joins |
| Spot icons (distance, wishes, vote) | Landing "How it works" | Not used |
| App icon | Favicon and Apple touch icon | iOS icon, Android adaptive icon |
| Link preview | Open Graph image for shared links | n/a |

Also generated and ready, not yet used: spot icons for dietary, budget and
lock-in. Ideas for later: Pip orbiting the planet in the 3D table, a splash
screen.

Restaurant photos on pick cards come from Google Places and are handled in
their own change, not here.

## Style

The mascot and every illustration share the 3D table's world: toon-shaded
plush toys, soft felt texture, bead eyes, the planet's sky-blue `#31C9FF` and
sunny `#FFE033`→`#7FBE35`, plus the app's Radicchio `#B3245C`, Butter
`#F4CF4A` and Bottle `#17301F`. No text inside images.

UI controls stay on system icons (lucide on web, SF Symbols on iOS) so they
keep native weight and accessibility. Custom art is for moments, not buttons.
