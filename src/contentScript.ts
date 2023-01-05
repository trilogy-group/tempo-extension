import {
  HistoryEvent,
  HistoryObject,
  PingEvent,
  SlaEvent,
  SlaEventType,
} from './models';
import $ from 'jquery';
import { isPresent } from 'ts-is-present';
import { debounceTime, fromEvent, interval } from 'rxjs';
import { subMilliseconds } from 'date-fns';

async function getHistory(): Promise<HistoryObject|undefined> {
  const keys = Object.keys(localStorage).filter(x => x.startsWith('CognitoIdentityServiceProvider.') && x.endsWith('.idToken'));
  if (keys.length === 0) {
    console.log("No token id found")
    return undefined;
  }
  const idToken: string = localStorage.getItem(keys[0])!;

  const result = await fetch("https://api.alp-pulse.com/graphql", {
    'headers': {
      "accept": "*/*",
      "authorization": idToken,
      "content-type": "application/json",
    },
    "body": "{\"operationName\":\"CurrentTasks\",\"variables\":{},\"query\":\"query CurrentTasks {\\n  currentTasks {\\n    task {\\n      ...Task\\n      __typename\\n    }\\n    history {\\n      ...Task\\n      __typename\\n    }\\n    automations {\\n      ...HttpAutomation\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment Task on Task {\\n  id\\n  companyId\\n  productId\\n  assemblyLineId\\n  workProduct {\\n    inputArtifactURLs\\n    id\\n    name\\n    __typename\\n  }\\n  workUnitId\\n  workUnit {\\n    name\\n    __typename\\n  }\\n  taskType\\n  priority\\n  sla\\n  name\\n  artifactURLs\\n  inputArtifactURLs\\n  inputQualityBar\\n  description\\n  fetchedAt\\n  fetchedBy\\n  doerWorkerId\\n  doTaskId\\n  doCompletedAt\\n  qcOutcome\\n  status\\n  createdAt\\n  updatedAt\\n  createdBy\\n  updatedBy\\n  completedAt\\n  durationInSeconds\\n  rejectReason\\n  rejectDetails\\n  andonCordPullReason\\n  andonCordPullDetails\\n  andonCordResolution\\n  andonCordRestartALName\\n  __typename\\n}\\n\\nfragment HttpAutomation on HttpAutomation {\\n  andonCordPullReason\\n  andonCordPullDetails\\n  fetchedAt\\n  httpStatus\\n  url\\n  workProductId\\n  __typename\\n}\"}",
    "method": "POST",
  });

  return await result.json()
}

let sameData = false;
let lastTitle: string | undefined = undefined;
let lastDescription: string | undefined = undefined;
let lastColour: string | undefined = undefined;

async function loadSla() {
  const pullWork = $('button:contains("Pull Work")');
  let event: SlaEvent;
  if (pullWork.length > 0) {
    event = {
      type: SlaEventType.New,
      payload: {
        sla: 'pull',
        color: 'black',
      },
    };
    if (lastTitle !== event.payload.sla) {
      sameData = false;
      lastTitle = event.payload.sla;
      lastDescription = event.payload.description;
      lastColour = event.payload.color;
    }
    if (!sameData) {
      chrome.runtime.sendMessage(event).then();
      sameData = true;
    }
  } else {
    const color = $('path.CircularProgressbar-path')?.css('stroke');

    const slaSelector = document.querySelector('#__next > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span');
    const slaText = slaSelector?.textContent ?? '';
    const sla = slaText
      ?.replaceAll('h', 'ₕ')
      ?.replaceAll('m', 'ₘ')
      ?.replaceAll('s', 'ₛ')
      ?.replaceAll(' ', '');

    const slaObjectRegex = /^((\d{1,2})h\s*)?((\d{1,2})m\s*)?((\d{1,2})s\s*)?$/g;
    const res = slaObjectRegex.exec(slaText);
    let slaObject;
    if (isPresent(res)) {
      slaObject = {
        h: parseInt(res[2] ?? 0),
        m: parseInt(res[4] ?? 0),
        s: parseInt(res[6] ?? 0),
      };
    }

    const mainSection = $('#__next > div > div > div > div > div > div > span');
    const title = mainSection?.get(0)?.textContent ?? '';
    const description = mainSection?.get(1)?.textContent ?? '';
    let eventDate = subMilliseconds(new Date(), 1000); // because of bounce and processing time till displayed
    event = {
      type: SlaEventType.New,
      payload: {
        sla,
        createdAt: eventDate,
        slaObject,
        color,
        title,
        description,
      },
    };
    if (lastTitle !== title && lastDescription !== description) {
      sameData = false;
      lastTitle = title;
      lastDescription = description;
    }
    if (!sameData && slaText.replaceAll(' ', '') !== '') {
      chrome.runtime.sendMessage(event).then();
      const result = await getHistory();
      if (result === undefined) {
        return;
      }
      const authEvent: HistoryEvent = {
        type: SlaEventType.History,
        payload: result,
      };
      chrome.runtime.sendMessage(authEvent).then();
      sameData = true;
    }
  }
}

function ping() {
  const event: PingEvent = {
    type: SlaEventType.Ping
  };
  chrome.runtime.sendMessage(event).then();
}

$(() => {
  fromEvent($(document),'DOMSubtreeModified')
    .pipe(debounceTime(500))
    .subscribe(loadSla);
  interval(1000).subscribe(ping)
});

