import { subscribe, getSubscriptions, logSendNotification, logSendNotificationResponse, mkPool, logAnalyticsDeliveryNotificationReceived, logAnalyticsUserClicked, logAnalyticsClosed } from './db';
import uuid from "uuid/v1"
import { resolveNaptr } from 'dns';
const webpush = require("web-push");
const privateVapidKey = "35sBP_xyUzYe8D7dKsQY2xUf72czD0Tc-I_pozVLOxw"
const publicVapidKey = 'BN5UGEhzNjmw3AG6tMdIXtKIkVv9t-i67F71jpcL60rdAMseJWeLYQBfHRU2K4b54F2pdfaaAH6NZcIoBJUbhyk'
webpush.setVapidDetails(
  "mailto:support@sam-media.com",
  publicVapidKey,
  privateVapidKey
);

const pool = mkPool(process.env.sigma_stats);

export const subscribeToPush = async (req, res) => {
  const user = req.user
  const subscription = req.body;
  try {
    await subscribe(pool, user, subscription)
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
    const subscriptions = await getSubscriptions(pool, to_user)

    const results = await Promise.all(
      subscriptions.map(async subscription => { 
        const title = body.title
        const message_uuid = uuid()
        const payload = { title, body: body.body, icon: body.icon, message_uuid }

        // Pass object into sendNotification
        const {id} = (await logSendNotification(pool, message_uuid, subscription.id, title, payload))
        return webpush
          .sendNotification(subscription.sub_object, JSON.stringify(payload))
          .then(async response => {
            await logSendNotificationResponse(pool, id, true, response)
            return {to: to_user, success: true, response}
          })
          .catch(async error => {
            await logSendNotificationResponse(pool, id, false, error)
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

export const analyticsDeliveryNotification = async (req, res) => {
  try {
    await logAnalyticsDeliveryNotificationReceived(pool, req.body.message_uuid)
    res.send({})
  } catch(ex){
    console.error(ex)
    res.status(500).send({})
  }
}

export const analyticsClicked = async (req, res) => {
  try {
    await logAnalyticsUserClicked(pool, req.body.message_uuid, req.body.action)
    res.send({})
  } catch(ex){
    console.error(ex)
    res.status(500).send({})
  }
}

export const analyticsClosed = async (req, res) => {
  try {
    await logAnalyticsClosed(pool, req.body.message_uuid)
    res.send({})
  } catch(ex){
    console.error(ex)
    res.status(500).send({})
  }
}