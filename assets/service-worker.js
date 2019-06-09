
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});



self.addEventListener("push", e => {
  const data = e.data.json();
  return self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    requireInteraction: true,
    actions: [
      {action: '/user_sessions/+2.0/2019-06-02/2019-06-10/-/-/-/day?', title: '📊 User Sessions'},
      {action: 'OK!', title: '👊 OK'}
    ]
  });
});

self.addEventListener('notificationclick', ev => {
  ev.notification.close()
  return clients.openWindow('/revenue')
  if(!!ev.action && ev.action[0] == "/") {
    return clients.openWindow(ev.action)
  } else {
    return clients.openWindow('/')
  }
});

self.addEventListener("notificationclose", function(event) {
  console.log('notification close');
  // log send to server
});

