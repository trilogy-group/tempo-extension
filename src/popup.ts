'use strict';

import './popup.css';
import { SlaEvent, SlaEventType } from './models';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  // const counterStorage = {
  //   get: (cb: (count: string) => void) => {
  //     chrome.storage.sync.get(['count'], (result) => {
  //       cb(result.count);
  //     });
  //   },
  //   set: (value: string, cb: () => void) => {
  //     chrome.storage.sync.set(
  //       {
  //         count: value,
  //       },
  //       () => {
  //         cb();
  //       }
  //     );
  //   },
  // };

  // function setupCounter(initialValue = 'n/a') {
  //   document.getElementById('counter')!.innerHTML = initialValue.toString();
  //   chrome.action.setBadgeText({
  //     text: initialValue.toString()
  //   });
  //
  //   // document.getElementById('incrementBtn')!.addEventListener('click', () => {
  //   //   updateCounter({
  //   //     type: 'INCREMENT',
  //   //   });
  //   // });
  //   //
  //   // document.getElementById('decrementBtn')!.addEventListener('click', () => {
  //   //   updateCounter({
  //   //     type: 'DECREMENT',
  //   //   });
  //   // });
  // }

  function updateCounter(event: SlaEvent) {
    const newCount = event.payload.message;
    document.getElementById('counter')!.innerHTML = `<div style="color: ${event.payload.color}">${newCount}</div>`;
  }

  // Listen for message
  chrome.runtime.onMessage.addListener((request: SlaEvent, sender, sendResponse) => {
    if (request.type === SlaEventType.New) {
      updateCounter(request)
    }

    // Send an empty response
    // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
    sendResponse({});
    return true;
  });
})();
