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
- **"Estimate"** is the one word for estimated or simulated figures everywhere (the shortest of Estimate / Simulated / Simulation): cards' vertical notes, section labels, Endurance, stations. The vertical note sits at 40% opacity.
- **Simulated data** (no public feed exists yet: units, shifts, water, aircraft cycles) is allowed for the demo but is always labelled "Estimate" next to its title.
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
- **Horizontal bars** (progress, stamina, water, stage timelines): 4px tall, fully rounded, dark grey (#3A3A3C; light grey at night) on a light grey track, 8px under their text; the state keeps its colour in the tag beside, not in the bar.
- **KPI groups** read label (annotation) → value → micro chart. Micro trends are small charts in dark grey (#3A3A3C; a line's area in the primary lime at 50%; the size class's other steps in light grey) (22px tall, 56% of the card width, centred; a line for rates, bars for amounts; a note, if any, goes under the chart so charts stay level) over the item's own span; all charts in a group share one span, so one note under them gives it ("Since 18 Sep.") plus "Estimated…" when estimated. A KPI whose chart would say nothing (time active) has none.
- **Fire detail KPIs:** white cards (16px corners, light shadow), three per row: containment (NIFC %, else the model's estimate), spread rate, head spread (model), contained in (model's expected time), burned area, size class, personnel by default. Inside a card, always from the top (never centred vertically, whatever space is left below): label at the top centre, then the number (unit after it in 15px semibold), 16px gap, then the chart. An "Estimate" (or "No data", "Calculating") note runs vertically along the card's right edge, in the space under the label, in the note style at 11px (the one place below 13px) and 50% opacity. It floats over the card: nothing else in the card makes room for it, so the content stays centred and the card does not change when the note goes; cards share one minimum height. Size class uses the US NWCG scale (A to G by acres) for every region, since Portugal publishes no size classes; its chart is the A–G steps with the fire's class in colour. Press and hold a card (250 ms), move it over another place and let go to reorder; while a card is held the page does not scroll, so it moves up and down too; haptic on Android at the lift and drop (an iPhone web page can only buzz on a plain tap, not during a drag); the order is kept on the phone. Time active is not a KPI card: it sits on the title row, right-aligned.
- **Fire detail ground and weather:** two sections of cards like the KPIs, three per row, each reorderable on its own. Terrain: relief, fuel, fuel moisture, slope (relief from the slope; an assumed fuel type carries the vertical "Estimate" note, never "(assumed)" in the text; flat / rolling / hilly / mountainous, plus the cover, forest / deep forest / bush / rural / grassland, from what burned per ICNF in Portugal or else the fuel model), fuel, slope. Weather: temperature (unit preference, else °C in Portugal and °F in the US), wind with its direction, humidity. When the figures are simulated, one "Simulated" note sits on the right of the section title, not on each card. The fire model's own rows (perimeter, prediction, expected containment) are gone from the detail: the KPI cards carry them.
- **No empty cards:** a KPI or condition with no figure yet shows a plausible simulated one (seeded by the fire, so it stays put) with the vertical "Estimate" note; a held fire drops the cards that stopped being useful (spread rate, head spread, contained in, and containment once it is 100%) and keeps size class, burned area and personnel; containment stays while the source still publishes less than 100% (e.g. NIFC 88%). Every KPI card except "contained in" carries a small chart. The card count never changes, so the layout never jumps while data arrives. The number shrinks to fit beside its unit.
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

### Search field

One look everywhere (Find a place, the area picker, any future search): centred in the space it sits in (equal room above and below), a 48px pill, light grey fill `rgba(118,118,128,0.12)`, a 20px magnifier, 17px text, 12px inner padding. Where the search is a panel of its own, a round 44px X closes it beside the field.

### Icons

Line icons share one drawn thickness on screen: 1.5px, whatever their size (stroke-width = 36 ÷ the icon's pixel size in a 24-unit viewBox): arrows, chevrons, the magnifier, chat, bell, full screen, close. Weather and terrain cards show a 24px icon instead of a label (the name stays for screen readers); a tap on the card shows the name in a small dark tooltip above it for 1.8 s (a second tap hides it), while press-hold-move still reorders. The icons: thermometer, wind arrow pointing where the wind blows, drop (humidity), leaf with a drop (fuel moisture), mountains (relief), flame (fuel), slope.

### Round buttons

Every round icon button (chat, notifications, profile photo, close X, copy, map search and full screen) is 44px, the minimum comfortable touch target on a phone.

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

### Calm lists (incidents, chats, notifications)

Rows edge to edge between full-width dividers: the name in Title S, one grey annotation line under it, the value or time on the right in grey, a chevron. No avatars, no coloured status words, no cards around the list; colour only for an ignition's likelihood and the lime unread count (notifications: a lime dot before the time while unread).

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
- It is a mask on the scrolling panel (`prefs.js`, `fadeOne`), so the panel's own background shows through in both themes. Its height is 54px (at most 30% of the panel).

### Detail pages (being tried)

- The page scroll has no snapping.
- Actions sit side by side on one row, 16px from the sides and 32px from the bottom edge: Back on the left (subtle button, a left arrow before the label, returns to the previous screen), Team chat on the right (primary, chat icon before the label; unread messages as a small black dot, 20px, no outline, with the count in white; the chat is not in the header). These two are the text buttons with a leading icon, by Nuno's choice.
- No blades and no back button (Done at the bottom closes the page, so the header aligns with the content): only the header (name, place, kind band with the stage tag on its right) and the action buttons stay fixed; the map (a 234px band framed on the fire's shape, with the perimeter legend and no weather chips, full screen from its button or a tap) and all the information scroll together in one column.
- The kind band on a fire detail reads: dot (active orange, resolved dark brown), the kind ("Active fire"), and the stage tag on the right. The band has 18px corners and the tag sits 4px inside it with 14px corners (concentric). The start time sits on the place line, right-aligned under the time active ("Started 8:54", annotation), saving a line. No stages bar. The ignition detail does the same with its detection time.
- **People at risk** ("Populações" in Portuguese) is a key-figure card on fires and ignition candidates: Yes / No for a populated place within 5 km. On a candidate it comes from the satellite point's nearest place ("1.8 km north of Torrance"), with the place and distance under the answer. On a fire, when Yes, a small tag says how far the evacuation has got (not evacuated, evacuating, evacuated); no public feed gives evacuations, so the fire card is simulated and labelled; a held fire says No. It replaces the ignition's Detections card.
- **Detail headers name only the level above the place, by its own name:** "Los Angeles", "Aveiro"; never "County", "District", the state or the country (fires, ignition candidates, stations).
- **Choosing cards:** every card group ends with a grey + tile, a 56×56 square with 8px corners (half the cards'), the same in every group, at the top left of the next free slot. It opens the group's list with toggles: the cards on show, and extra ones (off at first) to explore: fire key figures add aircraft, vehicles, perimeter, structures, smoke, water drops, fireline built, evacuated, cost to date, hotspots; weather adds gusts, rain in 24 h, fire weather, dew point, visibility, cloud cover, UV index, pressure; terrain adds elevation, aspect, nearest road, canopy cover, land use, nearest water, last burned, soil moisture; an ignition adds nearest fire, satellite, nearest road, confidence, detections, nearest home, nearest station, protected area. Cards added later start off even when the user already changed the group. The last card on cannot be switched off (its toggle dims): a group is never empty. A grey "Reset" chip beside the list's title brings back the group's default cards and order.
- **Kind bands** use the search field's grey (`rgba(118,118,128,0.12)`). In detail headers (fire, ignition, drone, station) the band is as tall as the segmented control (52px, fully rounded) and its tag as tall as the control's thumb (32px). The ignition candidate's tag reads "Unconfirmed ⌄" in the lime accent (dark text), as it is an action that needs attention: a tap opens a sheet (dialog model) titled "Confirm fire?" with only the place under it, and Dismiss / Confirm.
- **Ignition detail actions:** Back and Team chat (primary) fixed at the foot, as on a fire. Dismiss asks for confirmation, then the candidate disappears and the main screen shows. Confirm keeps the page: the band turns into "Active fire / Not contained", the widgets under the map fade, and the fire's page takes over with the same header and map (no header fade) and its own widgets; a just-confirmed fire starts at 0% contained.
- **The ignition detail has Weather and Terrain too**, from the fire model's reading at the point when there is one, else simulated and labelled.
- **Detail pages read like the user preferences:** each section (Key figures, Weather, Terrain, Endurance, Stations on this fire) is named by a label (15px regular mid grey, 4px in from the content's edge, no full stop), 8px above its content, sections 24px apart, no dividers between them; the content sits in white cards (16px corners, light shadow). Lists of units sit in one white block with dividers inside it. A section's "Simulated" or "Estimate" note sits on the right of its label.
- Fire detail order: map band (234px, perimeter legend only, framed on the fire's shape), KPIs with charts, weather, terrain, endurance (simulated), stations as small cards, as many as the resources make plausible (about two ground vehicles per station, personnel / 5 when vehicles are not published, 1 to 4), each with the station's crest as on the station detail (the shield when it has none), name in Title XS, distance and drive time, crews free simulated), source.
- Where no perimeter is mapped, the model's outline is irregular and fire-like (lobes, stretched along one axis) with the reported area, never a circle.
- **Detail map loading:** for 2.5 s at least, and on a fire until its perimeter is drawn and framed and the tiles for that view are in (at most 12 s), so the map appears already framed on the shape, the band shows (centred in the grey that shows, under the header) the search grey with the app's flame (22px wide) in dark grey in the middle, swaying slightly, its eye blinking every 2 s, and "Loading map…" under it (annotation); it fades out as the map appears.
- **Detail map zoom:** the fire's current perimeter fills about 60% of the band's width (or 92% of the clear height under the legend), centred in the clear part below the legend, whatever the fire's size, up to the map's closest zoom (as on Timber).
- The ignition's full-screen map shows the candidate and its nearest stations only: the main screen's shield markers with the station's short name and the distance above them, on two lines (no chip), no route lines, no sight lines. A tap opens the main screen's station card, with the distance added after the region.
- Mini card numbers are responsive: value and unit always fit inside the card's 8px side padding (the number shrinks, never clips).
- A fire's detail map shows only the fire: its perimeter (burned area, burning edge, held line) with that legend, framed on it; no stations, no routes, no unit tracks.
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
  - fire stations are a simple shield (flat top, straight sides, meeting in a point below), drawn 20% larger than the first version (about 24px), outline 2px like the ignition candidate's, fill a livelier blue rgba(64,156,255,0.6): a 2px dark grey outline, no inner detail, filled light blue at 50%; the same shield in legends, cards, notifications and headers;
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
  - only the full-screen button (or turning the phone sideways) fills the screen; a tap on the map itself never does;
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
- **Loading:** a loading screen appears only between login and the first screen. The black-and-white photo turns to colour from the centre, and the counter reads how much of the screen the colour has reached (measured inside the colour's soft edge): they start together and the colour finishes just before the count reaches 100%.

## 7. Data scope

- Live regions are Portugal and California only (`window.__wfOnly` in `live.js`). Every other region is paused: no fires, candidates or area-picker entries.
- To bring a region back, add it to that list.
- **No sticky hover on touch:** on phones a tapped element never keeps a hover fill or glow (iOS keeps :hover on the last tap); only the tap feedback shows. `prefs.js` strips hover fills on touch screens app-wide.
- Main screen bottom blade: the counts sit 37px under the blade's top edge (16px higher than before).
- **Drone verification screen:** the same fixed header as a fire or an ignition (Drone D-3 with the distance to the scene on the right; the place with "Arriving in 21 s" as annotation; the kind band "Drone verification" with its status tag), then the live video (maximise 44px like every round button, no viewfinder corners), Key figures as mini cards (Simulated), and the ignition's actions fixed at the foot: Confirm and Dismiss on one row, Back full width under them.
- **Units in mini cards:** the unit beside a number is in the annotation style (15px regular, mid grey), never bold; area units short: ac, ha.
- **Trend lines** (from the drone screen): 1.5px dark grey line over the lime area, with the reference point marked by a dot ringed in the card's white (the latest value on history charts, "now" on forecasts).
- **Dark palette (one set):** page #1E1E20, surface #262629 (blades, sheets, headers), raised #333336 (cards), band and fills #3A3A3C; text #E8E8ED (titles and big numbers alike), secondary #AEAEB2 (annotations, labels, notes), tertiary #8E8E93, controls and icons #D1D1D6. Light-theme greys map onto these; no other dark greys.
- **Decision labels:** "Confirm" and "Dismiss" everywhere a candidate is decided (status sheet, drone screen, chat actions); the context says what is confirmed.
- **Crews on a confirmed fire:** the fire page shows a "Resources" section above Key figures: a white row "Assign crews" with a lime "To do" tag and "None assigned yet." (after orders: "Crews", units and stations). It opens the dispatch configuration (select stations, configure dispatch, Send order) on the same page; Back and Done return to the fire page.
- **Mini card anatomy:** the title may take two lines and always reserves them (40px), then the value, then any tag or note; the chart sits anchored 8px from the card's bottom. Cards in a row share the tallest card's height. Only a leading number splits off its unit ("12 min"); words stay whole ("Very high").
- **Loading flame (one element everywhere):** the app's flame with its eye blinking every 2 s, on the app loading screen and every map loader; light on dark grey in the dark theme.
- **Endurance** (water, shifts) shows only once crews are assigned: a fire confirmed in the app with no orders yet has no Endurance section.
- **Station tooltip:** on a candidate's map the distance is the tooltip's XS KPI ("Distance" annotation above it, responsive like every tooltip KPI); then the station (Title XS) and its region; View where allowed; the state tag ("Available", "1 fire") docks on the card's top edge as a tab with square top corners and rounded bottom ones, then a gap and the rest; View stays 8px from the card's bottom (main screen and candidate maps alike).
- **Fire map band:** no size label on the map (the size is in the cards). The perimeter always shows its edge state, estimated outline or not: burning front in orange while the fire is active, held line in green where contained. The burned area stays visible on the night map (light fill). The map loader shows once per map: full screen and back are instant.
- **List rows (calm lists, incidents, chats, notifications, other candidates):** at least the area picker's row height (60px) with 16px above and below the text; two-line rows grow, never shrink below that.
- **Station screen:** the fixed header of a fire or ignition (short name, level above with the station type on the right, kind band "Fire station" with its state tag); the 234px map band; Key figures as mini cards (active fires within 25 km, nearest active fire, drive to it); "Fires near this station" as a calm list; "Station" as rows (crest and full name, then label and value, GPS with copy); one note line for sources; Back and Call (or Directions) fixed at the foot. No lime card.
- **Map full screen:** opens on the same place at the band's zoom plus 20% (never zoomed out); the user zooms out if they want.
- **Crew configuration** (from a fire's "Assign crews"): the fire's header, then "Stations" as two suggested mini cards (the nearest with crews free) (name, distance KPI, time or free crews; tap to choose, a check and a dark outline when chosen; the + tile lists the stations further away too, with their crews free as example figures), then "Resources per station" (choose crews and vehicles), and Send order. After sending, Done returns to the fire page.
- **Chats and notifications titles:** "Chats" / "Notifications", with the chosen area and the counts under the title in normal text ("Los Angeles. 13 open. 23 unread."); both lists show only the chosen area.
- **Chats list** closes with the round X at the top right (like the notifications panel), not a back chevron.
- **App icon:** the flame on the US firefighters' lime (#CCFF00). Home screen icons cannot animate on iPhone (a still image); the blink lives in the app's loading screens.
- **Lists (all):** no dividers between items; only the line that separates the list from its header (or group title). Chevrons align with the first line of the item, not its centre.
- **Map speed:** nothing outside the map watches it per frame (fades and card sizing ignore map changes; no page-wide searches on timers); a selected station alone draws its mask; while dragging the drawn map moves as one picture and redraws fully at most about twice a second.
- **Round controls press:** besides the translucent press highlight, a round control swells 10% and returns at once (260 ms), app-wide.
- **Incidents list:** a switcher (All / Candidates / Fires) then the app's search field, which searches only what the switcher shows ("Search fires" when on Fires); the subtitle keeps the full counts.
- **Under the status bar (installed app):** the status bar is translucent; the frame runs from the very top, so maps and blurs continue under the clock and the camera. The incidents list, open, rises to the top safe area (just under the status bar).
- **Endurance by station:** the units on a fire are listed per station, one white card each, headed by the station (crest, name, distance, crews still free after those on this fire, or "All crews on this fire"); air support in its own card. No separate "Stations on this fire" block when units are shown.
