# Forest Fire Watch design guide

This is the rulebook for how the app looks, moves and reads. Nuno owns the visual decisions. When a new one is made, it goes here, and every screen is built from this file.

Reference screens: the **user preferences panel**, the **map tooltip panels** and the **ignition detail page**. When in doubt, copy what they do.

How we work:
- A rule applies across the whole app unless it names a place.
- A change that touches several screens is shown as screenshots of every affected screen before it is called done.

Shared code lives in `prefs.js`: styles, themes, the switcher, buttons and the scroll fade.

---

## 1. Text

### Styles

| Style | Size / weight | Use |
|---|---|---|
| Title M | 26px semibold, 32px line | Title of a screen, blade or panel (area name, "Incidents", profile name, "Notifications") |
| Title S | 17px bold | First line of a list item; titles inside cards |
| Title XS | 15px semibold (`.wf-title-xs`) | Place name in map tooltips |
| Normal text | 17px regular, same colour as titles | The line under a screen title; body text |
| Annotation | 15px regular, mid grey `#6E6E73` | Secondary sentence under content; ends with a full stop |
| Label | Same look as annotation | Names a switcher, dropdown or group of controls; no full stop |
| Note | 13px regular, mid grey (`.wf-note`) | Estimate and simulation notices only ("Simulated", "Estimated from…", "… (estimate)", demo notices) |
| KPI | Large bold, dark grey `#3A3A3C` (`.wf-like-xs` in tooltips) | Big numbers; the label is centred with the number |

### Rules

- **Only these sizes** exist in the app: 26 (Title M), 17 (Title S or normal text), 15 (Title XS, annotation, label), 13 (note, for estimates and simulations only). The exceptions are KPI numbers (responsive), cartographic labels drawn on the maps, small badges and pills (count badges, 18–22px tags), avatar initials and the logo. New sizes are added here first, and only when truly needed.
- **Save space whenever possible:** put things on one line when they fit (a band and its tag, two actions), drop repeats. When Claude spots such a chance it applies it and says so in one line.
- **Hierarchy follows the references** (user preferences, map tooltips, ignition detail): conclusion first (the KPI and state a firefighter acts on), then where, then evidence and detail, then actions. Every screen should help a Portuguese or Californian firefighter decide faster and better.
- **Case:** sentence case everywhere. No all caps.
- **Middle dots:** none between topics; use a full stop ("All features. All regions."). Any " · " is turned into a full stop at display time (i18n.js).
- **Counts in titles stay black**, even at zero ("No ignition candidates" is not green).
- **Coloured numbers:** only an ignition's likelihood %. Other numbers stay dark grey. Red is kept only for alerts such as over time or casualties.
- **Shortest wording** that keeps the meaning, in every language. Examples: "Surveillance", not "Under surveillance"; "Final duration", not "Time it took to resolve".
- **Relative times** say "ago" ("3 min ago"). Live counters use short units ("58 min 12 s").
- **Real data only.** When something isn't published, say so plainly ("Start time not published.").
- **Simulated data** (no public feed exists yet: units, shifts, water, aircraft cycles) is allowed for the demo but is always labelled "Simulated" next to its title.
- **Burned area always shows** on a fire detail: the source's figure; where it has none yet, the fire model's estimate with an "Estimate" note; else "—" with "Not published yet."
- **Detail pages don't repeat the tooltip's KPI in big.** The tooltip already gave it; the detail leads with the next question (fire: containment as a big % where it is published; where only a stage exists, e.g. ANEPC, the stage is a colour-matched tag, never a big word), and the tooltip's KPI moves to a medium KPI beside the others (time active, burned area).
- **Forces are read by strain, not totals:** "1 of 2 crews need relief" (12 h shift), "1 of 2 tenders below 20% water"; each unit shows its own state (stamina, water, aircraft attacking / returning / refilling).

## 2. Spacing and shape

- **Rhythm:** 16px padding and gaps. Nothing touches a screen or container edge.
- **Groups:**
  - a title and its description sit closer than 8px;
  - closely related content (a name and its details) sits 8px apart;
  - separate groups sit 16px apart;
  - selection groups (labelled controls) sit 24px apart.
- **Corners:**
  - blades, sheets, dialogs and tooltips use 28px;
  - text buttons are pills;
  - avatars are full circles, the same size as the round X.
- **Dividers** between list items run the full width of their container.
- **Horizontal bars** (progress, stamina, water, stage timelines): 16px tall, fully rounded ends.
- **KPI groups** read label (annotation) → value → micro chart. Micro trends are small charts (22px tall, 56% of the card width, centred; a line for rates, bars for amounts; a note, if any, goes under the chart so charts stay level) over the item's own span; all charts in a group share one span, so one note under them gives it ("Since 18 Sep.") plus "Estimated…" when estimated. A KPI whose chart would say nothing (time active) has none.
- **Fire detail KPIs:** four white cards (16px corners, light shadow) in a 2 × 2 grid: spread rate, burned area, size class, personnel by default. Inside a card: label, number (unit after it in 15px semibold), 16px gap, then the chart. An "Estimate" note sits under its card, outside it. Size class uses the US NWCG scale (A to G by acres) for every region, since Portugal publishes no size classes; its chart is the A–G steps with the fire's class in colour. Press and hold a card (250 ms), move it over another place and let go to reorder; haptic at the press and at the drop (iPhone only buzzes inside the touch itself); the order is kept on the phone. Time active is not a KPI card: it sits in the header band.
- **Burned area comes with its spread rate:** area added per interval (hourly under a day, every 6 h under a week, else daily), latest interval as the KPI ("17 ha/day") and in full colour.

## 3. Colour and themes

- **Accent:** the primary lime (`--wf-y`), used for the primary button, the switcher thumb and selection.
- **Dark theme:**
  - balanced contrast, never pure white on near-black;
  - every inline colour has a dark mapping in `prefs.js` (`darkCss`), and a new colour needs one too;
  - maps get a night filter and should not go too dark.
- **Light theme:** map tiles are slightly desaturated.

## 4. Components

### Buttons (`.wf-b`)

| Class | Look | Notes |
|---|---|---|
| `.wf-pri` (primary) | Lime | 48px tall |
| `.wf-sec` (secondary) | Dark grey with a lime label | 48px tall |
| `.wf-ter` (subtle) | Faint lime | Full width inside its container, with 16px padding all round |
| `.wf-cond` (condensed) | 32px tall | For compact surfaces (tooltips) |

- Text buttons carry no decorative leading icon.
- A disabled button looks clearly unclickable: more transparent background and text.
- Once one of several choices is made (e.g. Approve / Not now), the others disappear and the chosen button goes full width with a past-tense label and a check ("✓ Approved").

### Switcher (segmented control, `.wf-seg`)

The one from the user preferences, used everywhere:
- **Track:** pill-shaped, 52px tall, 10px inner padding, `rgba(118,118,128,.12)`.
- **Thumb:** lime pill (`.segthumb > .segblob`). On a new choice it grows 12px (6 above, 6 below), glides to the option and settles on arrival.
- **Options:** 17px text (`.segopt`), with the selected one in semibold dark.
- **Over a map or photo:** same geometry with a dark translucent track.

### Lists

- The first line is Title S (bold).
- The second line is an annotation (15px mid grey).
- Values sit on the right: numbers are right-aligned, and status uses its tone colour.

### Status tags

- Pill with no dot, in the fire-stage tone colours.
- Wraps onto two centred lines when the label needs it.

### Dialogs

- **Shape:** a panel reaching the bottom edge, with 28px top corners.
- **Padding:** 30px top, 24px sides, 32px bottom.
- **Spacing:** 24px between the text and the buttons.
- **Surface:** the same shadow as the settings panel, with no outline.

### Scroll fade (sfumatto)

- Only signals hidden content: the content fades near the top and/or bottom edge only while more content is hidden past that edge.
- No scroll means no fade.
- It is a mask on the scrolling panel (`prefs.js`, `fadeOne`), so the panel's own background shows through in both themes.

### Detail pages (being tried)

- The page scroll has no snapping.
- Actions sit side by side on one row, 16px from the sides and 32px from the bottom edge. The team chat lives in its button (chat icon before the label, unread badge on it), not in the header. This is the one text button with a leading icon, by Nuno's choice.
- No blades and no back button (Done at the bottom closes the page, so the header aligns with the content): only the header (name, place, kind band with the stage tag on its right) and the action buttons stay fixed; the map (a 180px band without legend, framed on the fire's shape, full screen from its button or a tap) and all the information scroll together in one column.
- The kind band on a fire detail reads: dot (active orange, resolved dark brown), the stage tag, and on the right the time active (live) or the final duration. A 4px stages bar sits under the band; a tap on the band or bar opens the stage details (stage and time in it, start, containment estimate, the stage steps).
- Fire detail order: map band (180px, no legend, framed on the fire's shape), KPIs with charts, conditions and model, endurance (simulated), stations as small cards (station symbol, name in Title XS, distance and drive time, crews free simulated), source.
- Where no perimeter is mapped, the model's outline is irregular and fire-like (lobes, stretched along one axis) with the reported area, never a circle.
- On a fire's maps the perimeter polygon (burned, active front, held edge) replaces the fire dot when the model or source gives it.
- List rows in detail pages carry no leading icons.

### Blades and panels

- **Grabbers:** every expandable blade has one, at the same distance from the edge everywhere, with 40px clear of the content. A blade has one grabber fixed to its edge: it rides the edge as the blade opens and closes, never jumping or fading between two copies.
- **Swipe:** a blade swipes over its whole area unless it scrolls; then it swipes by its grabber only.
- **Drops:**
  - panels dropping from the top stop 48px above the bottom;
  - dropdowns stop at least 32px above it;
  - drop-ups stop 32px short of the top.
- **Behind a panel:** a slightly dark blurred glass overlay.
- **Closing:** panels close only with their X (changing a setting inside keeps them open).

## 5. Map

- **Markers:**
  - flat shapes with a translucent body (62%) and no shadows;
  - ignition candidates have a 2px dark grey outline and pulse as an outline only;
  - fire stations are a shield (like a corporation's crest): a 2px dark grey outline, no inner detail, filled light blue at 50%; the same shield in legends, cards, notifications and headers;
  - fires have no outline;
  - resolved fires use the fire marker in a much darker brown, with their own legend entry;
  - the marker icons match the legend icons.
- **Selected marker:** a 4px solid outer border in dark grey on candidates, fires and stations (candidates and stations: their 2px outline grows to 4px, same colour).
- **Tooltip panels:** one block with three variants (candidate, fire, station).
  - 180px wide, 28px corners, an even shadow all round, all centred, no header and no X.
  - Placed above or below the marker, 24px from its outer edge, and at least 16px from the screen edges.
  - Opening fades in while moving a little away from the marker; closing fades out moving back toward it.
  - They close on a second tap on the marker, a tap on the map, or when the marker leaves the screen.
  - Content from top to bottom: KPI (annotation above the XS number, which fits with 12px clear at each side), tag, place (Title XS plus the level above as an annotation), then a condensed primary View button.
  - Gaps: 8px after the KPI, 12px between groups, 16px above View.
- **Legend:** chips in the label style but dark grey. Map weather (temperature, humidity, wind) uses the same chips, under the legend, once the map spans under about 100 km.
- **Overlay placement (every map, in a band or full screen):** 16px from the edges of the visible map. Top left: the legend chips in one row, the weather chips under them. Bottom left: the map credit, always 4px from the visible map's bottom and left edges, in the note style (13px). Bottom right: the map controls stacked 8px apart (search above, full-screen / exit below), round, the blades' background with a light shadow, so they read as controls over any map. A full-screen detail map puts its title box (with the legend inside) 16px from the top.
- **Full screen:**
  - a tap on an empty part of the map, or turning the phone sideways, fills the screen;
  - blades slide away;
  - the exit button sits bottom right, 16px from the edges.
- **Zoom and pan:**
  - zoom out stops at 60% of the whole state or country of the selected area, never trapped in a county;
  - no dragging into empty space;
  - gentle momentum;
  - no flicker;
  - while a finger moves the map (and while it glides), the drawn map and markers move as one picture; the full redraw follows about four times a second and on release;
  - fire stations thin out as the map zooms out (wider spacing near the whole state or country), so the map stays light and readable.
- **Find a place:** a round search button above the full-screen button (bottom right of the main map), same size and look. It opens a panel dropping from the top (like the area picker) with a pill search field and a round X. Results are list rows (place bold, the levels above as an annotation), one row per place (a city, its municipality and district of the same name are one result). A pick closes the panel, moves the map there and the area follows the map. Searches only the live regions the account can see.

## 6. Motion and touch

- **Touch feedback:** every tappable element gets a translucent ripple starting as a 48px circle, plus a light haptic.
- **Transitions:** screen changes dissolve softly and never snap. A panel grows from, and folds back into, what opened it.
- **Icon motion:** icons move subtly and slowly (for example, the close X turns a quarter turn).
- **Selection:** no blue text-selection highlight on long press or drag; only text fields can be selected.
- **Loading:** a loading screen appears only between login and the first screen. The black-and-white photo turns to colour from the centre, and the counter reads how much of the screen the colour has reached: they start together and reach 100% together.

## 7. Data scope

- Live regions are Portugal and California only (`window.__wfOnly` in `live.js`). Every other region is paused: no fires, candidates or area-picker entries.
- To bring a region back, add it to that list.
