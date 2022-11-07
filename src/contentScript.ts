import { isPresent } from 'ts-is-present';
import { SlaEventType } from './models';
import $ from 'jquery';

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// function ready(callback: () => void){
//   // in case the document is already rendered
//   if (document.readyState!='loading') {
//     callback();
//   }
//   // modern browsers
//   else if (document.addEventListener) {
//     document.addEventListener('DOMContentLoaded', callback);
//   }
//   // IE <= 8
//   // else document.attachEvent('onreadystatechange', function(){
//   //     if (document.readyState=='complete') callback();
//   //   });
// }

function loadSla() {
  const pageTitle: string = document.head.getElementsByTagName('title')[0].innerHTML;
  console.log(
    `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
  );

  const slaSelector = document.querySelector("#__next > div > div.overflow-y-auto.false.w-full > div > div > div > div.flex.flex-col.gap-y-8.py-5 > div.flex.justify-center.items-center.py-11.px-0.h-\\[240px\\].rounded-lg.bg-white.rounded-lg.shadow-lg.p-3.w-full > div.flex.relative.justify-center.items-center.w-full.h-full.false > div > div > div > div > div > div > div > span.break-words.undefined.text-lg.font-medium.text-black");
  const slaText = slaSelector?.textContent;
  console.log(
    `SLA is: '${slaText}'`
  );

  chrome.runtime.sendMessage(
    {
      type: isPresent(slaText) ? SlaEventType.New : SlaEventType.No,
      payload: {
        message: slaText
          ?.replaceAll('0h', '')
          ?.replaceAll(' ', ''),
      },
    },
    (response) => {
      console.log(`Response: ${response?.message}`);
    }
  );
  if (isPresent(slaText)) {
    // Communicate with background file by sending a message
  }
}

$(() => {
  // loadSla();
  $('body').on('DOMSubtreeModified', loadSla);
});




// do something
// MutationObserver = window.MutationObserver;// || window.WebKitMutationObserver;

//   const observer = new MutationObserver(function(mutations, observer) {
//     // fired when a mutation occurs
//     console.log(mutations, observer);

//     // ...
//   });
//
// // define what element should be observed by the observer
// // and what types of mutations trigger the callback
//   observer.observe(document, {
//     subtree: true,
//     attributes: true
//     //...
//   });
