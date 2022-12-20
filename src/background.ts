'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { HistoryEvent, SlaEvent, SlaEventType } from './models';
import { getSla, updateSla, updateHistory } from './slaStorage';

getSla().then();

chrome.runtime.onMessage.addListener((request: SlaEvent | HistoryEvent, sender, sendResponse) => {
  let message;
  switch (request.type) {
    case SlaEventType.New:
      updateSla(<SlaEvent>request)
      message = 'updated';
      break;
    case SlaEventType.History:
      updateHistory(<HistoryEvent>request)
      message = 'updated history';
      break;
    default:
      message = 'ignored';
      break;
  }
  sendResponse({
    message
  });
});
