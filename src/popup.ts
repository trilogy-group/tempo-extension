'use strict';

import './popup.css';
import { CurrentTask, History, HistoryEvent, SlaEvent } from './models';
import { getHistory, getSla, getTimer } from './slaStorage';
import { isPresent } from 'ts-is-present';

(function () {
  function updateSlaUi(event: SlaEvent) {
    let timer = getTimer(event);
    document.getElementById(
      'counter'
    )!.innerHTML = `<div style="color: ${event.payload.color}">${timer}</div>`;
    document.getElementById('title')!.innerHTML = event.payload.title ?? 'N/A';
    document.getElementById('subtitle')!.innerHTML =
      event.payload.description ?? 'N/A';
  }

  function renderHistory(history: History): string {
    return `
<div class="history-item">
  <div><b>Executor:</b> ${history.fetchedBy}</div>
  <div><b>Task Type:</b> ${history.taskType}</div>
  <div><b>Status:</b> ${history.status}</div>
  ${
    isPresent(history.qcOutcome)
      ? `<div><b>QC outcome:</b> ${history.qcOutcome} </div>`
      : ''
  }
  <div><b>Fetched at:</b> ${new Date(history.fetchedAt).toLocaleString()}</div>
  <div><b>Completed at:</b> ${new Date(
    history.completedAt
  ).toLocaleString()}</div>
  ${
    history.rejectReason
      ? `<div><b>Reject reason:</b> ${history.rejectReason}</div>`
      : ''
  }
  ${
    history.rejectDetails
      ? `<div><b>Reject details:</b> ${history.rejectDetails?.replaceAll(
          /(https?:\/\/\S+)/g,
          '<a target="_blank" href="$1">$1</a>'
        )}</div>`
      : ''
  }
  <div><b>Duration:</b> ${new Date(history.durationInSeconds * 1000)
    .toISOString()
    .slice(11, 19)}</div>
</div>`;
  }

  function renderHistoryTask(task: CurrentTask): string {
    return task.history.map(renderHistory).join(' ');
  }

  function updateHistoryUi(event: HistoryEvent) {
    const historyHtml =
      event?.payload?.data?.currentTasks?.map(renderHistoryTask).join(' ') ??
      '';
    let historyItems;
    if (isPresent(historyHtml) && historyHtml.replaceAll(' ', '') !== '') {
      historyItems =
        '<div  class="history-item"><b>History:</b> </div>' + historyHtml;
    } else {
      historyItems = '<div  class="history-item">No history found</div>';
    }
    const historyElement = document.getElementById('history')!;
    const currentContent = historyElement.innerHTML.toString();
    if (
      currentContent.replaceAll(/\s/g, '') !==
      historyItems.replaceAll(/\s/g, '')
    ) {
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
