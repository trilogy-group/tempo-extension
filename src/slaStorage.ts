import { SlaEvent, SlaEventType } from './models';
import { isPresent } from 'ts-is-present';

const slaStorage = {
  get: (cb: (count: SlaEvent) => void) => {
    chrome.storage.sync.get(['sla'], (result) => {
      cb(result.sla);
    });
  },
  set: (value: SlaEvent, cb?: () => void) => {
    chrome.storage.sync.set(
      {
        sla: value,
      },
      () => {
        if (isPresent(cb)) {
          cb();
        }
      },
    );
  },
};

function setupSla(initialValue = 'n/a') {
  chrome.action.setBadgeText({
    text: initialValue.toString(),
  });
}

export function updateSla(event: SlaEvent) {
  slaStorage.set(event);
  chrome.action.setBadgeText({
    text: event.payload.sla,
  });
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

export async function getSla() {
  // Restore count value
  const count = new Promise<SlaEvent>((resolve, reject) => {
    slaStorage.get((count: SlaEvent) => {
      if (typeof count === 'undefined') {
        let initValue: SlaEvent = {
          type: SlaEventType.New,
          payload: {
            sla: 'n/a',
            color: 'black'
          }
        };
        slaStorage.set(initValue, () => {
          setupSla();
        });
        resolve(initValue)
      } else {
        setupSla(count.payload.sla);
        resolve(count)
        return count;
      }
    });
  });
  return count;
}
