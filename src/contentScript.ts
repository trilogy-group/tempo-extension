import { isPresent } from 'ts-is-present';
import { SlaEvent, SlaEventType } from './models';
import $ from 'jquery';

function loadSla() {
  let slaColor;
  let slaText;
  const pullWork = $('button:contains("Pull Work")');
  if(pullWork.length > 0) {
    slaText = 'pull';
    slaColor = 'black'
  } else {
    slaColor = $("path.CircularProgressbar-path")?.css('stroke');

    const slaSelector = document.querySelector("#__next > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span");
    slaText = slaSelector?.textContent;

    const title = $("#__next > div > div.overflow-y-auto.false.w-full > div > div > div > div.undefined.flex.justify-between.items-center.items-center.pb-5 > span")
  }

  chrome.runtime.sendMessage(
    {
      type: isPresent(slaText) ? SlaEventType.New : SlaEventType.No,
      payload: {
        message: slaText
          ?.replaceAll('h', 'ₕ')
          ?.replaceAll('m', 'ₘ')
          ?.replaceAll('s', 'ₛ')
          ?.replaceAll(' ', ''),
        color: slaColor
      },
    } as SlaEvent,
    (response) => {}
  );
}

$(() => {
  $('body').on('DOMSubtreeModified', loadSla);
});
