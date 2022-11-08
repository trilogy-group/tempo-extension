import { isPresent } from 'ts-is-present';
import { SlaEvent, SlaEventType } from './models';
import $ from 'jquery';

function loadSla() {
  const pageTitle: string = document.head.getElementsByTagName('title')[0].innerHTML;
  console.log(
    `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
  );

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
  }
  console.log(
    `SLA is: '${slaText} (${slaColor})'`
  );

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
    (response) => {
      console.log(`Response: ${response?.message}`);
    }
  );
}

$(() => {
  $('body').on('DOMSubtreeModified', loadSla);
});
