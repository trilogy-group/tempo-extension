'use strict';

import './popup.css';
import { CurrentTask, History, HistoryEvent, SlaEvent } from './models';
import { getHistory, getSla } from './slaStorage';
import { isPresent } from 'ts-is-present';

(function () {
  function updateSlaUi(event: SlaEvent) {
    let newCount = event.payload.sla;
    if(isPresent(event.payload.slaObject)) {
      const slaObject = event.payload.slaObject;
      newCount = `${slaObject.h}:${slaObject.m}:${slaObject.s}`
    }
    document.getElementById('counter')!.innerHTML = `<div style="color: ${event.payload.color}">${newCount}</div>`;
    document.getElementById('title')!.innerHTML = event.payload.title ?? 'N/A';
    document.getElementById('subtitle')!.innerHTML = event.payload.description ?? 'N/A';
  }

  function renderHistory(history: History): string {
    return `
<div class="history-item">
  <div>Executor: ${history.fetchedBy}</div>
  <div>Fetched at: ${new Date(history.fetchedAt).toLocaleString()}</div>
  <div>Completed at: ${new Date(history.completedAt).toLocaleString()}</div>
  <div>Status: ${history.status}</div>
  ${ history.rejectReason ? `<div>Reject reason: ${history.rejectReason}</div>` : ''}
  ${ history.rejectDetails ? `<div>Reject details: ${history.rejectDetails?.replaceAll(/(https?:\/\/\S+)/g, '<a target="_blank" href="$1">$1</a>')}</div>` : ''}
  <div>Durations: ${new Date(history.durationInSeconds * 1000).toISOString().slice(11, 19)}</div>
</div>`
  }

  function renderHistoryTask(task: CurrentTask): string {
    return task.history.map(renderHistory).join(' ');
  }

  function updateHistoryUi(event: HistoryEvent) {
    const historyHtml = event?.payload?.data?.currentTasks?.map(renderHistoryTask).join(' ') ?? '';
    let historyItems;
    if (isPresent(historyHtml) && historyHtml.replaceAll(' ', '') !== '') {
      historyItems = '<div  class="history-item">History: </div>' + historyHtml;
    } else {
      historyItems = '<div  class="history-item">No history found</div>'
    }
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

