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
let lastMinute: boolean = false
let lastFiveMinutes: boolean = false
let lastTenMinutes: boolean = false

function runTimer(event: SlaEvent) {
  if(isPresent(lastTimer)) {
    clearInterval(lastTimer);
    lastTimer = undefined;
  }

  if(!NON_SLA_EVENTS.includes(event.payload.sla)) {
    lastTimer = setInterval(setNotifications, 1000);
  } else {
    lastTimer = undefined;
    lastMinute = false;
    lastFiveMinutes = false;
    lastTenMinutes = false;
    chrome.notifications.create('', {
      title: 'Previous task has finished',
      message: event.payload.sla,
      iconUrl: '/icons/icon_128.png',
      type: 'basic',
    });
  }
  setNotifications(event).then();
}

async function checkTimer() {
  if (isPresent(lastTimer) && isPresent(lastRun) && differenceInSeconds(lastRun, new Date()) > 2) {
    console.log('reactivating timer');
    const event = await getSla();
    runTimer(event);
  }
}

function lowTimeNotification(event: SlaEvent) {
  chrome.notifications.create('', {
    title: 'Hurry up',
    message: event.payload.sla,
    iconUrl: '/icons/icon_128.png',
    type: 'basic',
  });
}

function setBadge(event: SlaEvent) {
  chrome.action.setBadgeText({
    text: event.payload.sla
  }).then();
  chrome.action.setBadgeBackgroundColor({
    color: event.payload.color ?? "rgb(84, 177, 133)"
  }).then();
  chrome.action.setTitle({
    title: `Time left: ${event.payload.sla}`
  }).then();
}

async function setNotifications(event?: SlaEvent) {
  lastRun = new Date();
  if (!isPresent(event)) {
    event = await getSla();
  }
  setBadge(event);
  if(isPresent(event.payload.slaObject) && isPresent(event.payload.slaObject.h) && isPresent(event.payload.slaObject.m)) {
    if(event.payload.slaObject.h >= 0 && event.payload.slaObject.m > 15 && (lastTenMinutes || lastFiveMinutes || lastMinute)) {
      lastMinute = true;
      lastFiveMinutes = true;
      lastTenMinutes = true;
    }
    if (!lastTenMinutes && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 10) {
      lowTimeNotification(event);
      lastTenMinutes = true;
    } else if (!lastFiveMinutes && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 5) {
      lowTimeNotification(event);
      lastFiveMinutes = true;
    } else if (!lastMinute && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 1) {
      lowTimeNotification(event);
      lastMinute = true;
    }
  }
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
