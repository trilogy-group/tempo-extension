'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { SlaEvent, SlaEventType } from './models';
import { restoreCounter, updateCounter } from './counterStorage';

restoreCounter();

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
