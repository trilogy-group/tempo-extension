'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { HistoryEvent, SlaEvent, SlaEventType } from './models';
import { getSla, updateSla, updateHistory, NON_SLA_EVENTS } from './slaStorage';
import { isPresent } from 'ts-is-present';
import { differenceInSeconds } from 'date-fns';

getSla().then();

let lastTimer: number | NodeJS.Timer | undefined = undefined;
let lastRun: Date | undefined = undefined;

function runTimer(event: SlaEvent) {
  if(isPresent(lastTimer)) {
    clearInterval(lastTimer);
    lastTimer = undefined;
  }

  if(!NON_SLA_EVENTS.includes(event.payload.sla)) {
    lastTimer = setInterval(setNotifications, 1000);
  } else {
    lastTimer = undefined;
  }
  setNotifications(event).then();
}

function checkTimer() {
  if(isPresent(lastTimer) && isPresent(lastRun) && differenceInSeconds(lastRun, new Date()) > 2) {
    console.log('reactivating timer');
  }
}

async function setNotifications(event?: SlaEvent) {
  lastRun = new Date();
  if (!isPresent(event)) {
    event = await getSla();
  }
  chrome.action.setBadgeText({
    text: event.payload.sla,
  }).then();
  if (event.payload.sla === '5ₘ0ₛ' || event.payload.sla === '1ₘ0ₛ') {
    chrome.notifications.create('', {
      title: 'Hurry up',
      message: event.payload.sla,
      iconUrl: '/icons/icon_128.png',
      type: 'basic',
    });
  }
  chrome.action.setBadgeBackgroundColor({
    color: event.payload.color ?? 'rgb(84, 177, 133)',
  }).then();
}

chrome.runtime.onMessage.addListener((request: SlaEvent | HistoryEvent, sender, sendResponse) => {
  let message;
  switch (request.type) {
    case SlaEventType.New:
      updateSla(<SlaEvent>request);
      runTimer(request);
      message = 'updated';
      break;
    case SlaEventType.History:
      updateHistory(<HistoryEvent>request);
      message = 'updated history';
      break;
    case SlaEventType.Ping:
      checkTimer();
      message = 'pong';
      break;
    default:
      message = 'ignored';
      break;
  }
  sendResponse({
    message
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.tabs.query({url: "https://app.alp-pulse.com/"}, function(tabs) {
    let isFirst = true;
    for (let tab of tabs) {
      if(tab.id) {
        chrome.tabs.reload(tab.id);
        if(isFirst) {
          isFirst = false;
        } else {
          chrome.tabs.remove(tab.id);
        }
      }
    }
  });
});
