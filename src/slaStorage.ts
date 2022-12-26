import { HistoryEvent, SlaEvent, SlaEventType } from './models';
import { isPresent } from 'ts-is-present';
import { differenceInSeconds } from 'date-fns';

export const NON_SLA_EVENTS = ['pull', 'n/a'];
const slaStorage = {
  get: (cb: (count: SlaEvent) => void) => {
    chrome.storage.sync.get(['sla'], (result) => {
      let payload = (<SlaEvent>result.sla).payload;
      if(isPresent(payload.slaObject) && !NON_SLA_EVENTS.includes(payload.sla)) {
        debugger;
        const lastSla = payload.slaObject;
        const slaDate = payload.createdAt!;
        const newDate = new Date();
        const secDiff = differenceInSeconds(newDate, new Date(slaDate));
        const sec = Math.ceil(secDiff % 60);
        const min = Math.floor(((secDiff / 60) % 60));
        const hours = Math.floor(secDiff / 3600);
        lastSla.h = (lastSla?.h ?? 0) - hours;
        lastSla.m = (lastSla?.m ?? 0) - min;
        lastSla.s = (lastSla?.s ?? 0) - sec;
        payload.createdAt = newDate;
        if (lastSla.h > 0) {
          payload.sla = `${lastSla.h}ₕ${lastSla.m}ₘ`;
        } else if (lastSla.m > 0) {
          payload.sla = `${lastSla.m}ₘ${lastSla.s}ₛ`;
        } else {
          payload.sla = `${lastSla.s}ₛ`;
        }
      }
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

const historyStorage = {
  get: (cb: (count: HistoryEvent) => void) => {
    chrome.storage.sync.get(['history'], (result) => {
      cb(result.history);
    });
  },
  set: (value: HistoryEvent, cb?: () => void) => {
    chrome.storage.sync.set(
      {
        history: value,
      },
      () => {
        if (isPresent(cb)) {
          cb();
        }
      },
    );
  },
};

export function updateHistory(event: HistoryEvent) {
  historyStorage.set(event);
}

export async function getHistory() {
  return new Promise<HistoryEvent>((resolve, reject) => {
    historyStorage.get((e: HistoryEvent) => {
      resolve(e);
      return e;
    });
  });
}

function setupSla(initialValue = 'n/a') {
  chrome.action.setBadgeText({
    text: initialValue.toString(),
  });
}

export function updateSla(event: SlaEvent) {
  slaStorage.set(event);
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
