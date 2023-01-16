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
  getTimer, STORAGE_TYPE, booleanStorage
} from "./slaStorage";
import { isPresent } from 'ts-is-present';
import { differenceInSeconds } from 'date-fns';
import { debounceTime, fromEventPattern } from "rxjs";
import MessageSender = chrome.runtime.MessageSender;

getSla().then();

let lastTimer: number | NodeJS.Timer | undefined = undefined;
let lastRun: Date | undefined = undefined;
let isInitialized: boolean = false
let isPull = booleanStorage(STORAGE_TYPE.IS_PULL);
let lastMinute = booleanStorage(STORAGE_TYPE.LAST_MINUTE);
let lastFiveMinutes = booleanStorage(STORAGE_TYPE.LAST_FIVE_MINUTES);
let lastTenMinutes = booleanStorage(STORAGE_TYPE.LAST_TEN_MINUTES);

async function runTimer(event: SlaEvent) {
  if(isPresent(lastTimer)) {
    clearInterval(lastTimer);
    lastTimer = undefined;
  }

  if(!NON_SLA_EVENTS.includes(event.payload.sla)) {
    lastTimer = setInterval(setNotifications, 1000);
    await isPull.set(false);
  } else {
    lastTimer = undefined;
    await Promise.all([
      lastMinute.set(false),
      lastFiveMinutes.set(false),
      lastTenMinutes.set(false),
    ]);
    if(!(await isPull.get())) {
      chrome.notifications.create('', {
        title: 'Previous task has finished',
        message: event.payload.sla,
        iconUrl: '/icons/icon_128.png',
        type: 'basic',
      });
    }
    await isPull.set(true);
  }
  setNotifications(event).then();
}

async function checkTimer() {
  if ((isPresent(lastTimer) && isPresent(lastRun) && differenceInSeconds(lastRun, new Date()) > 2) || !isInitialized) {
    console.log('reactivating timer');
    const event = await getSla();
    await runTimer(event);
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
    const lastTenMinutesValue = await lastTenMinutes.get();
    const lastFiveMinutesValue = await lastFiveMinutes.get();
    const lastMinuteValue = await lastMinute.get();
    if(event.payload.slaObject.h >= 0 && event.payload.slaObject.m > 10 && (lastTenMinutesValue || lastFiveMinutesValue || lastMinuteValue)) {
      await Promise.all([
        lastMinute.set(false),
        lastFiveMinutes.set(false),
        lastTenMinutes.set(false),
      ]);
    } else if (!lastTenMinutesValue && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 10) {
      lowTimeNotification(event);
      await lastTenMinutes.set(true);
    } else if (!lastFiveMinutesValue && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 5) {
      lowTimeNotification(event);
      await lastFiveMinutes.set(true);
    } else if (!lastMinuteValue && event.payload.slaObject.h < 1 && event.payload.slaObject.m < 1) {
      lowTimeNotification(event);
      await lastMinute.set(true);
    }
  }
}

async function onMessageListener(request: SlaEvent | HistoryEvent, sender: MessageSender, sendResponse: (response?: any) => void) {
  let message;
  switch (request.type) {
    case SlaEventType.New:
      updateSla(<SlaEvent>request);
      await runTimer(request);
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

chrome.runtime.onMessage.addListener(onMessageListener);

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
