import { SlaEvent } from './models';
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
        count: value,
      },
      () => {
        if (isPresent(cb)) {
          cb();
        }
      },
    );
  },
};

function setupCounter(initialValue = 'n/a') {
  chrome.action.setBadgeText({
    text: initialValue.toString(),
  });
}

export function updateCounter(event: SlaEvent) {
  counterStorage.set(event.payload.message);
  chrome.action.setBadgeText({
    text: event.payload.message,
  });
  if (event.payload.message === '5ₘ0ₛ' || event.payload.message === '1ₘ0ₛ') {
    chrome.notifications.create('', {
      title: 'Hurry up',
      message: event.payload.message,
      iconUrl: '/icons/icon_128.png',
      type: 'basic',
    });
  }
  chrome.action.setBadgeBackgroundColor({
    color: event.payload.color ?? 'rgb(84, 177, 133)',
  });
}

export function restoreCounter() {
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
