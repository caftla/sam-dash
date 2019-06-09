
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());

  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(`your message :) id: ${client.id}`);
    })
  })
});

self.addEventListener("message", e => {
  const data = JSON.parse(e.data)
  switch(data.type) {
    case 'retrieve-client-id':
      return e.source.postMessage(JSON.stringify({type: 'client-id', client_id: `${e.source.id}`}));
      break;
  }
})

self.addEventListener("push", e => {

  /*
  // decide wether to show the push message or not (depending on client visibility and focus)
  self.clients.matchAll().then(clients => {
    
    clients.map(c => {
      frameType = top-level
      focused :: boolean
      type = "window"
      url = "http://127.0.0.1:8080/..."
      visibilityState = "hidden" | "visible"
      id :: uuid
      console.log("push client", `visibilityState: ${c.visibilityState}, focused: ${c.focused}, frameType: ${c.frameType}, url: ${c.url}`)
    })
  })
  */

  const data = e.data.json();
  const message_uuid = data.message_uuid

  // report analytics
  post("/api/v1/analytics/push-delivery-notification", {message_uuid, now: new Date()})
  .catch(() => {}) // eat the error

  setTimeout(() => { // https://github.com/firebase/quickstart-js/issues/268#issuecomment-439392522
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      requireInteraction: true,
      data: {
        message_uuid
      },
      actions: [
        {action: `/user_sessions/+2.0/2019-06-02/2019-06-10/-/-/-/day?message_uuid=${message_uuid}`, title: '📊 User Sessions'},
        {action: 'OK!', title: '👊 OK'}
      ]
    });
  }, 100);

  
});

self.addEventListener('notificationclick', ev => {

  const message_uuid = ev.notification.data.message_uuid

  post("/api/v1/analytics/push-clicked", {message_uuid, now: new Date(), action: ev.action})
  .catch(() => {}) // eat the error

  ev.notification.close();

  ev.waitUntil(
    self.clients.matchAll().then(clients => {

      // try to find an appropriate client to client.focus();
      // clients.map(c => {
      //   console.log("click client", c)
      // })

      return  (!!ev.action && ev.action[0] == "/")
        ? self.clients.openWindow(ev.action)
        : self.clients.openWindow('/revenue')
    })
  )

});

self.addEventListener("notificationclose", function(ev) {
  const message_uuid = ev.notification.data.message_uuid

  post("/api/v1/analytics/push-closed", {message_uuid, now: new Date()})
  .catch(() => {}) // eat the error
});


async function post (url, body) {
  const res = await fetch(url , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data
}
