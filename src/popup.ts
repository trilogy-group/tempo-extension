'use strict';

import './popup.css';
import { SlaEvent } from './models';

// (function () {
//   // We will make use of Storage API to get and store `count` value
//   // More information on Storage API can we found at
//   // https://developer.chrome.com/extensions/storage
//
//   // To get storage access, we have to mention it in `permissions` property of manifest.json file
//   // More information on Permissions can we found at
//   // https://developer.chrome.com/extensions/declare_permissions
//
//   const counterStorage = {
//     get: (cb: (count: string) => void) => {
//       chrome.storage.sync.get(['count'], (result) => {
//         cb(result.count);
//       });
//     },
//     set: (value: string, cb: () => void) => {
//       chrome.storage.sync.set(
//         {
//           count: value,
//         },
//         () => {
//           cb();
//         }
//       );
//     },
//   };
//
//   function setupCounter(initialValue = 'n/a') {
//     document.getElementById('counter')!.innerHTML = initialValue.toString();
//     chrome.action.setBadgeText({
//       text: initialValue.toString()
//     });
//
//     // document.getElementById('incrementBtn')!.addEventListener('click', () => {
//     //   updateCounter({
//     //     type: 'INCREMENT',
//     //   });
//     // });
//     //
//     // document.getElementById('decrementBtn')!.addEventListener('click', () => {
//     //   updateCounter({
//     //     type: 'DECREMENT',
//     //   });
//     // });
//   }
//
//   function updateCounter(event: SlaEvent) {
//     counterStorage.get((count: string) => {
//       const newCount = count.toString();
//
//       chrome.action.setBadgeText({
//         text: newCount
//       });
//
//       counterStorage.set(newCount, () => {
//         document.getElementById('counter')!.innerHTML = newCount;
//       });
//     });
//   }
//
//   function restoreCounter() {
//     // Restore count value
//     counterStorage.get((count: string) => {
//       if (typeof count === 'undefined') {
//         // Set counter value as 0
//         counterStorage.set('n/a', () => {
//           setupCounter();
//         });
//       } else {
//         setupCounter(count);
//       }
//     });
//   }
//
//   document.addEventListener('DOMContentLoaded', restoreCounter);
//
//   // Communicate with background file by sending a message
//   // chrome.runtime.sendMessage(
//   //   {
//   //     type: 'GREETINGS',
//   //     payload: {
//   //       message: 'Hello, my name is Pop. I am from Popup.',
//   //     },
//   //   },
//   //   (response) => {
//   //     console.log(response.message);
//   //   }
//   // );
//
//   // Listen for message
//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.type === 'new_sla') {
//       console.log(`Current SLA is ${request.payload.message}`);
//       updateCounter(request.payload.message)
//     }
//
//     // Send an empty response
//     // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
//     sendResponse({});
//     return true;
//   });
// })();
