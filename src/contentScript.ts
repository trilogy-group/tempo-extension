import { isPresent } from 'ts-is-present';
import { SlaEventType } from './models';
import $ from 'jquery';

function loadSla() {
  const pageTitle: string = document.head.getElementsByTagName('title')[0].innerHTML;
  console.log(
    `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
  );

  const slaSelector = document.querySelector("#__next > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span");
  const slaText = slaSelector?.textContent;
  console.log(
    `SLA is: '${slaText}'`
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
      },
    },
    (response) => {
      console.log(`Response: ${response?.message}`);
    }
  );
}

$(() => {
  $('body').on('DOMSubtreeModified', loadSla);
});
