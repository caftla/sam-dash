import { post } from "./helpers";

if ("serviceWorker" in navigator) {
}
else {
  console.warn("Your browser does not support service workers")
}
navigator.serviceWorker.register("/service-worker.js", {
  scope: "/"
}).catch(console.error)

navigator.serviceWorker.ready.then(() =>  {
  navigator.serviceWorker.controller.postMessage(JSON.stringify({type: 'retrieve-client-id'}))
  navigator.serviceWorker.onmessage = function (e) {
    // messages from service worker.
    console.log('>>> e.data', e.data);
  };
})

const publicVapidKey = 'BN5UGEhzNjmw3AG6tMdIXtKIkVv9t-i67F71jpcL60rdAMseJWeLYQBfHRU2K4b54F2pdfaaAH6NZcIoBJUbhyk'

export default async function register() {
  const registration = await navigator.serviceWorker.ready

  // Register Push
  console.log("Registering for Push...");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Push Registered.");

  // Send Push Notification
  console.log("Subscribing for Push...");
  await post({ url: "/api/v1/subscribe", body: subscription })
  console.log("Subscribed to Push.");

  return true
}

export async function getSubscription() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    console.log('Already subscribed', subscription.endpoint);
    return subscription
  } else {
    return null
  }
}


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
