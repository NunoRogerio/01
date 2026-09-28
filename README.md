# Forest Fire Watch

A phone web app prototype for spotting forest-fire ignitions and following active fires, using live
open data for Portugal, the United States, British Columbia, Brazil (including Amazônia Legal) and
satellite hotspots across Europe and the Americas.

Open the site on a phone and use **Add to Home Screen** for a full-screen app.

- Sign in (`Login.dc.html`): pick a demo profile. Each role only sees its own area.
- Coordinator flow: Incidents → Ignition candidate → Drone verification → Dispatch
- Citizen reporter: `Report.dc.html` → `ReportSent.dc.html`
- Incident chats (`Chat.dc.html`, `chat.js`): one chat per candidate or fire with the coordinator and the nearest stations' team leads; a scripted demonstration follows the incident from ignition candidate to closed

Prototype only: not for real emergency decisions.

## Licence

Copyright (c) 2026 Nuno Rogerio. All rights reserved. This is not open source: you may view the code
here, but you may not copy, reuse or redistribute any part of it without written permission.
See [LICENSE](LICENSE). Data, map tiles and photos from third parties keep their own terms.
