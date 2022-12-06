'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { SlaEvent, SlaEventType } from './models';
import { isPresent } from 'ts-is-present';

const counterStorage = {
  get: (cb: (count: string) => void) => {
    chrome.storage.sync.get(['count'], (result) => {
      cb(result.count);
    });
  },
  set: (value: string, cb?: () => void) => {
    chrome.storage.sync.set(
      {
        count: value
      },
      () => {
        if(isPresent(cb)) {
          cb();
        }
      }
    );
  },
};

function setupCounter(initialValue = 'n/a') {
  chrome.action.setBadgeText({
    text: initialValue.toString()
  });
}

function updateCounter(event: SlaEvent) {
  counterStorage.set(event.payload.message)
  chrome.action.setBadgeText({
    text: event.payload.message
  });
  if(event.payload.message === '5ₘ0ₛ' || event.payload.message === '1ₘ0ₛ') {
    chrome.notifications.create('', {
      title: 'Hurry up',
      message: event.payload.message,
      iconUrl: '/icons/icon_128.png',
      type: 'basic'
    });
  }
  chrome.action.setBadgeBackgroundColor({
    color: event.payload.color ?? 'rgb(84, 177, 133)'
  });
}

restoreCounter();

function restoreCounter() {
  // Restore count value
  counterStorage.get((count: string) => {
    if (typeof count === 'undefined') {
      // Set counter value as 0
      counterStorage.set('n/a', () => {
        setupCounter();
      });
    } else {
      setupCounter(count);
    }
  });
}

chrome.runtime.onMessage.addListener((request: SlaEvent, sender, sendResponse) => {
  let message;
  if (request.type === SlaEventType.New) {
    updateCounter(request)
    message = 'updated'
  } else {
    message = 'ignored'
  }
  sendResponse({
    message
  });
});
