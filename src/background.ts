'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { HistoryEvent, SlaEvent, SlaEventType } from './models';
import {
  getSla,
  updateSla,
  updateHistory,
  NON_SLA_EVENTS,
  getTimer
} from "./slaStorage";
import { isPresent } from 'ts-is-present';
import { differenceInSeconds } from 'date-fns';
import { debounceTime, fromEventPattern } from "rxjs";
import MessageSender = chrome.runtime.MessageSender;

getSla().then();

let lastTimer: number | NodeJS.Timer | undefined = undefined;
let lastRun: Date | undefined = undefined;
let isInitialized: boolean = false
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
  if ((isPresent(lastTimer) && isPresent(lastRun) && differenceInSeconds(lastRun, new Date()) > 2) || !isInitialized) {
    console.log('reactivating timer');
    const event = await getSla();
    runTimer(event);
    isInitialized = true;
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
    title: `Tempo extension.\n${getTimer(event)}`
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

function onMessageListener(request: SlaEvent | HistoryEvent, sender: MessageSender, sendResponse: (response?: any) => void) {
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
      checkTimer().then();
      message = 'pong';
      break;
    default:
      message = 'ignored';
      break;
  }
  sendResponse({
    message
  });
}

const eventSubscription = fromEventPattern<Parameters<typeof onMessageListener>>((handler) => {
  chrome.runtime.onMessage.addListener(handler);
});
eventSubscription.pipe(debounceTime(500)).subscribe({
  next: ([x,y,z]) => onMessageListener(x, y, z)
});

function restart() {
  chrome.tabs.query({ url: "https://app.alp-pulse.com/" }, function(tabs) {
    let isFirst = true;
    for (let tab of tabs) {
      if (tab.id) {
        chrome.tabs.reload(tab.id).then();
        if (isFirst) {
          isFirst = false;
        } else {
          chrome.tabs.remove(tab.id).then();
        }
      }
    }
  });
}

const restartRequired = fromEventPattern((handler) => {
  chrome.runtime.onInstalled.addListener(handler);
  chrome.runtime.onRestartRequired.addListener(handler);
  chrome.runtime.onStartup.addListener(handler);
});
restartRequired.pipe(debounceTime(1000)).subscribe(restart);
