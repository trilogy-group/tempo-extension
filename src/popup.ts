'use strict';

import './popup.css';
import { CurrentTask, History, HistoryEvent, SlaEvent } from './models';
import { getHistory, getSla } from './slaStorage';

(function () {
  function updateSlaUi(event: SlaEvent) {
    const newCount = event.payload.sla;
    document.getElementById('counter')!.innerHTML = `<div style="color: ${event.payload.color}">${newCount}</div>`;
    document.getElementById('title')!.innerHTML = event.payload.title ?? 'N/A';
    document.getElementById('subtitle')!.innerHTML = event.payload.description ?? 'N/A';
  }

  function renderHistory(history: History): string {
    return `
<div class="history-item">
  <div>Executor: ${history.fetchedBy}</div>
  <div>Fetched at: ${history.fetchedAt}</div>
  <div>Completed at: ${history.completedAt}</div>
  <div>Status: ${history.status}</div>
  <div>Reject reason: ${history.rejectReason}</div>
  <div>Reject details: ${history.rejectDetails.replaceAll(/(https?:\/\/\S+)/g,'<a target="_blank" href="$1">$1</a>')}</div>
  <div>Durations: ${new Date(history.durationInSeconds * 1000).toISOString().slice(11, 19)}</div>
</div>`
  }

  function renderHistoryTask(task: CurrentTask): string {
    return task.history.map(renderHistory).join(' ');
  }

  function updateHistoryUi(event: HistoryEvent) {
    const historyItems = '<div  class="history-item">History: </div>' + event.payload.data.currentTasks.map(renderHistoryTask).join(' ');
    const historyElement = document.getElementById('history')!;
    const currentContent = historyElement.innerHTML.toString();
    if(currentContent.replaceAll(/\s/g, "") !== historyItems.replaceAll(/\s/g, "")) {
      historyElement.innerHTML = historyItems;
    }
  }

  async function refresh() {
    const sliEvent = await getSla();
    updateSlaUi(sliEvent);

    const historyEvent = await getHistory();
    updateHistoryUi(historyEvent);
  }

  setInterval(refresh, 1000);
})();

