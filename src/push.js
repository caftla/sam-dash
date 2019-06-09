import { post } from "./helpers";

const publicVapidKey = 'BN5UGEhzNjmw3AG6tMdIXtKIkVv9t-i67F71jpcL60rdAMseJWeLYQBfHRU2K4b54F2pdfaaAH6NZcIoBJUbhyk'

export default async function register() {
  // Check for service worker
  if ("serviceWorker" in navigator) {
    try {
      await send()
      return true;
    } catch(err) {
      console.error(err);
      return false;
    }
  }
  else {
    console.warn("serviceWorker is not available")
    return false;
  }
}

// Register SW, Register Push, Send Push
async function send() {
  // Register Service Worker
  console.log("Registering service worker...");
  const register = await navigator.serviceWorker.register("/service-worker.js", {
    scope: "/"
  });
  console.log("Service Worker Registered...");

  // Register Push
  console.log("Registering for Push...");
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Push Registered.");

  // Send Push Notification
  console.log("Subscribing for Push...");
  await post({url: "/api/v1/subscribe", body: subscription})
  console.log("Subscribed to Push.");
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