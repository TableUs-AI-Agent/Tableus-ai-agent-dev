# TableUs mobile design

The brand, Pip and the 3D table follow `frontend/DESIGN.md`. These are the
mobile rules on top of it. Tokens live in `src/theme.ts`, parts in
`src/components/ui.tsx`.

- **Icons are SF Symbols** through `Icon`, never emoji. Settings-style rows use
  `IconTile` with a `tiles` color. Every action that has an obvious symbol gets
  one.
- **One accent.** Radicchio is the primary action, selected chips and the
  current plan step. Butter marks your ranks and the chosen place. Green means
  done (wishes added, voted, decided).
- **Shape lock.** Actions and chips are pills, cards and grouped lists 20,
  inputs 14. Cards share one soft elevation; a ranked pick swaps it for the
  Bottle offset outline.
- **Art.** Pip and the spot illustrations sit on the 3D table's sky color
  (`palette.sky`), through `SpotTile` / `SpotArt` in `src/components/art.tsx`.
  Where a step or state has a spot, use it instead of a symbol tile, the way
  Airbnb's 2025 app uses 3D objects. The sign-in hero is
  `assets/art/hero-table.webp`; new art comes from `scripts/art.sh` in the same
  plush style.
- **The picture leads.** Plans still in play are poster cards: art band on
  top, the stage as a white `Pill tone="onArt"` chip on the art, then the title
  in the display face and one `Meta` icon row (place, people, time). Picks put
  "Top match" on the photo the same way. Decided plans stay compact rows.
- **Next step is docked.** The plan screen keeps the viewer's next action in a
  `Footer`: add wishes, share the link, get picks, the vote tray (your three
  slots with photos and who has voted), or Directions and Share once decided.
- **The chosen place is a ticket**: photo, a perforated edge with notches, then
  the details and the faces of everyone at the table.
- **References.** Patterns come from Apple Invites, Partiful, Resy, OpenTable,
  Beli, Luma and Airbnb (App Store screenshots, October 2026).
- **Layout.** The one primary action sits in a `Footer` above the home
  indicator on forms (sign-in, welcome, new plan, wishes) and on the plan screen. Modals have Cancel
  top left. Rare organizer actions (new link, delete) live in the plan's
  options menu.
- **Photos** always show the Google Maps logo and the photo's authors, on the
  pick cards and on the 3D table's cards.

Verify changes in the iOS Simulator in light and dark before calling a screen
done.
