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
  // document.getElementById('counter')!.innerHTML = initialValue.toString();
  chrome.action.setBadgeText({
    text: initialValue.toString()
  });

  // document.getElementById('incrementBtn')!.addEventListener('click', () => {
  //   updateCounter({
  //     type: 'INCREMENT',
  //   });
  // });
  //
  // document.getElementById('decrementBtn')!.addEventListener('click', () => {
  //   updateCounter({
  //     type: 'DECREMENT',
  //   });
  // });
}


function updateCounter(event: SlaEvent) {
  counterStorage.set(event.payload.message)
  chrome.action.setBadgeText({
    text: event.payload.message
  });
  // counterStorage.get((count: string) => {
  //   const newCount = count.toString();
  //
  //   chrome.action.setBadgeText({
  //     text: newCount
  //   });
  //
  //   // counterStorage.set(newCount, () => {
  //   //   document.getElementById('counter')!.innerHTML = newCount;
  //   // });
  // });
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
  // chrome.action.setBadgeText({
  //   text: '12'
  // });
  let message;
  if (request.type === SlaEventType.New) {
    // const message: string = `Hi ${
    //   sender.tab ? 'Con' : 'Pop'
    // }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    updateCounter(request)
    message = 'updated'
  } else {
    message = 'ignored'
  }
  sendResponse({
    message
  });
});
