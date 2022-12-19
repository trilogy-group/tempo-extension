'use strict';

import './popup.css';
import { SlaEvent, SlaEventType } from './models';
import { getSla } from './slaStorage';

(function () {
  function updateUi(event: SlaEvent) {
    const newCount = event.payload.sla;
    document.getElementById('counter')!.innerHTML = `<div style="color: ${event.payload.color}">${newCount}</div>`;
    document.getElementById('title')!.innerHTML = event.payload.title ?? 'N/A';
    document.getElementById('subtitle')!.innerHTML = event.payload.description ?? 'N/A';
  }

  async function refresh() {
    const event = await getSla();
    updateUi(event);
  }

  setInterval(refresh, 1000);
})();
