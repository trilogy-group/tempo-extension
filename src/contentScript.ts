import { SlaEvent, SlaEventType } from './models';
import $ from 'jquery';

function loadSla() {
  const pullWork = $('button:contains("Pull Work")');
  let event: SlaEvent;
  if(pullWork.length > 0) {
    event = {
      type: SlaEventType.No,
      payload: {
        sla: 'pull',
        color: 'black',
      }
    }
  } else {
    const color = $("path.CircularProgressbar-path")?.css('stroke');

    const slaSelector = document.querySelector("#__next > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span");
    const sla = slaSelector?.textContent?.replaceAll('h', 'ₕ')
      ?.replaceAll('m', 'ₘ')
      ?.replaceAll('s', 'ₛ')
      ?.replaceAll(' ', '') ?? '';

    const mainSection = $("#__next > div > div > div > div > div > div > span");
    const title = mainSection?.get(0)?.textContent ?? ''
    const description = mainSection?.get(1)?.textContent ?? ''
    event = {
      type: SlaEventType.New,
      payload: {
        sla,
        color,
        title,
        description
      }
    }
  }

  chrome.runtime.sendMessage(event,(response) => {});
}

$(() => {
  $('body').on('DOMSubtreeModified', loadSla);
});
