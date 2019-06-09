import { subscribe, getSubscriptions, logSendNotification, logSendNotificationResponse } from './db';
const webpush = require("web-push");
const privateVapidKey = "35sBP_xyUzYe8D7dKsQY2xUf72czD0Tc-I_pozVLOxw"
const publicVapidKey = 'BN5UGEhzNjmw3AG6tMdIXtKIkVv9t-i67F71jpcL60rdAMseJWeLYQBfHRU2K4b54F2pdfaaAH6NZcIoBJUbhyk'
webpush.setVapidDetails(
  "mailto:support@sam-media.com",
  publicVapidKey,
  privateVapidKey
);

export const subscribeToPush = async (req, res) => {
  const user = req.user
  const subscription = req.body;
  try {
    await subscribe(user, subscription)
    res.status(201).json({});

    webpush
      .sendNotification(subscription, JSON.stringify({
        title: "Thank you for Subscribing!",
        body: "More advanced features will be coming."
      }))

  } catch(ex) {
    res.status(500).json({error: ex.toString()})
  }  
}

export const sendPush = async (req, res) => {
  const body = req.body
  const to_user = body.to
  try {
    const subscriptions = await getSubscriptions(to_user)

    const results = await Promise.all(
      subscriptions.map(async subscription => { 
        const title = body.title
        const payload = { title, body: body.body, icon: body.icon }

        // Pass object into sendNotification
        const {id} = (await logSendNotification(subscription.id, title, payload));
        return webpush
          .sendNotification(subscription.sub_object, JSON.stringify(payload))
          .then(async response => {
            await logSendNotificationResponse(id, true, response)
            return {to: to_user, success: true, response}
          })
          .catch(async error => {
            await logSendNotificationResponse(id, false, error)
            return {to: to_user, success: false, error}
          });
      })
    )

    res.send(results)
  } catch(ex) {
    console.error(ex)
    res.status(500).send({error: ex.toString()})
  }
}