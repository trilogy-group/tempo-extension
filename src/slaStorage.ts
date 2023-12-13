import { HistoryEvent, SlaEvent, SlaEventType } from './models';
import { isPresent } from 'ts-is-present';
import { differenceInSeconds } from 'date-fns';

export const NON_SLA_EVENTS = ['pull', 'n/a'];
export enum STORAGE_TYPE {
  LAST_MINUTE = 'LAST_MINUTE',
  LAST_FIVE_MINUTES = 'LAST_FIVE_MINUTES',
  LAST_TEN_MINUTES = 'LAST_TEN_MINUTES',
  IS_PULL = 'IS_PULL',
};

export const booleanStorage = (type: STORAGE_TYPE) => ({
  get: async () => await chrome.storage.local.get([type]).then(x => isPresent(x) ? x[type] : false),
  set: async (value: boolean) => await chrome.storage.local.set({ [type]: value }),
})

const slaStorage = {
  get: async () => {
    return await chrome.storage.local.get(['sla']).then(result => {

      let payload = (<SlaEvent|undefined>result?.sla)?.payload;
      if(!isPresent(payload)){
        return undefined;
      } else if (isPresent(payload.slaObject) && !NON_SLA_EVENTS.includes(payload.sla)) {
        const lastSla = payload.slaObject;
        const slaDate = payload.createdAt!;
        const newDate = new Date();
        const dateDiffSec = differenceInSeconds(newDate, new Date(slaDate));
        const oldSlaSec = (lastSla?.h ?? 0) * 3600 + (lastSla?.m ?? 0) * 60 + (lastSla?.s ?? 0);
        const secDiff = oldSlaSec - dateDiffSec;
        lastSla.s = Math.ceil(secDiff % 60);
        lastSla.m = Math.floor(((secDiff / 60) % 60));
        lastSla.h = Math.floor(secDiff / 3600);
        payload.createdAt = newDate;
        if (lastSla.h > 0) {
          payload.sla = `${lastSla.h}ₕ${lastSla.m}ₘ`;
        } else if (lastSla.m > 9) {
          payload.sla = `${lastSla.m}ₘ`;
        } else if (lastSla.m > 0) {
          payload.sla = `${lastSla.m}ₘ${lastSla.s}ₛ`;
        } else {
          payload.sla = `${lastSla.s}ₛ`;
        }
      }
      return result.sla;
    });
  },
  set: (value: SlaEvent, cb?: () => void) => {
    chrome.storage.local.set(
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
    chrome.storage.local.get(['history'], (result) => {
      cb(result.history);
    });
  },
  set: (value: HistoryEvent, cb?: () => void) => {
    chrome.storage.local.set(
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

function getInitSla() {
  let initValue: SlaEvent = {
    type: SlaEventType.New,
    payload: {
      sla: "n/a",
      color: "black"
    }
  };
  return initValue;
}

export async function getSla() {
  return await slaStorage.get().then((count: SlaEvent|undefined) => {
      if (isPresent(count)) {
        return count;
      }
      return getInitSla();
    });
}

export function getTimer(event: SlaEvent) {
  let newCount = event.payload.sla;
  const config = {
    minimumIntegerDigits: 2,
    useGrouping: false
  };
  const locale = 'en-US';
  if(isPresent(event.payload.slaObject)) {
    const slaObject = event.payload.slaObject;
    newCount = `${slaObject.h?.toLocaleString(locale, config)}:${slaObject.m?.toLocaleString(locale, config)}:${slaObject.s?.toLocaleString(locale, config)}`
  }
  return newCount;
}
