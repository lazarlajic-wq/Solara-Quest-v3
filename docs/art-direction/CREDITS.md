# Art Credits & Attribution

## Character sprites

All five class character sheets (`apps/client/public/assets/characters/*-directional.png`)
were composed with the **Universal LPC Spritesheet Character Generator**
(https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator),
combining body/hair/clothing/armor/weapon layers from the **Liberated Pixel Cup**
(LPC) art collection. This is a real, required attribution — not optional
flavor text — per the licenses below.

> Sprites by: Johannes Sjölund (wulax), Michael Whitlock (bigbeargames), Matthew Krohn
> (makrohn), Nila122, David Conway Jr. (JaidynReiman), Carlo Enrico Victoria (Nemisys),
> Thane Brimhall (pennomi), laetissima, bluecarrot16, Luke Mehl, Benjamin K. Smith
> (BenCreating), MuffinElZangano, Durrani, kheftel, Stephen Challener (Redshrike),
> William.Thompsonj, Marcel van de Steeg (MadMarcel), TheraHedwig, Evert, Pierre Vigier
> (pvigier), Eliza Wyatt (ElizaWy), Sander Frenken (castelonia), dalonedrau, Lanea
> Zimmerman (Sharm), Manuel Riecke (MrBeast), Barbara Riviera, Joe White, Mandi Paugh,
> Shaun Williams, Daniel Eddeland (daneeklu), Emilio J. Sanchez-Sierra, drjamgo, gr3yh47,
> tskaufma, Fabzy, Yamilian, Skorpio, Tuomo Untinen (reemax), Tracy, thecilekli, LordNeo,
> Stafford McIntyre, PlatForge project, DCSS authors, DarkwallLKE, Charles Sanchez
> (CharlesGabriel), Radomir Dopieralski, macmanmatty, Cobra Hubbard (BlueVortexGames),
> Inboxninja, kcilds/Rocetti/Eredah, Napsio (Vitruvian Studio), The Foreman, AntumDeluge,
> and other contributors — see [`LPC-CREDITS.csv`](LPC-CREDITS.csv) for the full,
> per-file breakdown.
>
> Sprites contributed as part of the Liberated Pixel Cup project from
> OpenGameArt.org: http://opengameart.org/content/lpc-collection
>
> Licenses: OGA-BY 3.0, CC-BY-SA 3.0/4.0, GPL 2.0/3.0 (varies per asset —
> see [`LPC-CREDITS.csv`](LPC-CREDITS.csv) for exactly which license applies
> to which file). None of the assets used are CC0-only in a way that would
> remove the attribution requirement.

**This notice must stay reachable from inside the shipped game** (a Credits
screen, or equivalent) — a text file in the repo alone does not satisfy the
license. `CharacterCreateScene` currently shows a short pointer to this file;
replace that with a real in-game Credits screen before shipping publicly (see
`docs/gameplay/phase-status.md`).

## Tileset & UI icons

`apps/client/public/assets/tilesets/starttown.png`,
`apps/client/public/assets/ui/icon_heart.png`, `icon_coin.png` — carried over
from an earlier prototype pass; origin/license not yet re-verified for this
repo. Treat as placeholder until sourced/licensed properly (tracked in
`docs/gameplay/phase-status.md`).

## Regenerating or extending the character sheets

The exact selections used for each class (body/hair/armor/weapon/recolors)
are recorded as URL hash strings in
`docs/art-direction/style-guide.md#lpc-selections`. To rebuild or tweak one:

```bash
git clone https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator
cd Universal-LPC-Spritesheet-Character-Generator
npm install --ignore-scripts
npm run dev
```

Open the printed URL with the class's hash string appended, use the
"Spritesheet (PNG)" export, then crop the walk block (see the style guide)
and run it through the same reorder/upscale steps.
