'use strict';

import './popup.css';
import { HistoryEvent, SlaEvent } from './models';
import { getHistory, getSla } from './slaStorage';

(function () {
  function updateSlaUi(event: SlaEvent) {
    const newCount = event.payload.sla;
    document.getElementById('counter')!.innerHTML = `<div style="color: ${event.payload.color}">${newCount}</div>`;
    document.getElementById('title')!.innerHTML = event.payload.title ?? 'N/A';
    document.getElementById('subtitle')!.innerHTML = event.payload.description ?? 'N/A';
  }

  function updateHistoryUi(event: HistoryEvent) {
    const history = JSON.stringify(event.payload.data);
    document.getElementById('history')!.innerHTML = history;
  }

  async function refresh() {
    const sliEvent = await getSla();
    updateSlaUi(sliEvent);

    const historyEvent = await getHistory();
    updateHistoryUi(historyEvent);
  }

  setInterval(refresh, 1000);
})();
