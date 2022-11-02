import { isPresent } from 'ts-is-present';
import { SlaEventType } from './models';
// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

const pageTitle: string =
  document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

const slaSelector = document.querySelector("#__next > div > div.overflow-y-auto.false.w-full > div > div > div > div.flex.flex-col.gap-y-8.py-5 > div.flex.justify-center.items-center.py-11.px-0.h-\\[240px\\].rounded-lg.bg-white.rounded-lg.shadow-lg.p-3.w-full > div.flex.relative.justify-center.items-center.w-full.h-full.false > div > div > div > div > div > div > div > span.break-words.undefined.text-lg.font-medium.text-black");
const slaText = slaSelector?.textContent;

if(isPresent(slaText)) {
}
// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: isPresent(slaText) ? SlaEventType.New : SlaEventType.No,
    payload: {
      message: slaText,
    },
  },
  (response) => {
    console.log(response.message);
  }
);

