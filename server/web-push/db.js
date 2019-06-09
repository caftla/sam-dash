import PG from "pg";
export async function run(pool, query, params) {
  const client = await pool.connect()

  try {

    const result = await client.query(query, params);

    return result;
  }
   catch(error) {
    console.log("ERRR", error);
    throw error
  } 
  finally {
    await client.release();
  }
}

export function mkPool(connectionString, configOptions) {
  const config = {
    ...(configOptions || {}),
    connectionString
  };
  const pool = new PG.Pool(config);

  pool.on("error", (err, client) => {
    console.error("[PG Pool] Unexpected error on idle client", err);
    client.release();
  });

  function cleanup() {
    pool
      .end()
      .then(result => {
        console.log("[PG Pool] Cleaned up, bye!", result);
        process.exit(2);
      })
      .catch(error => {
        console.error(error);
        process.exit(2);
      });
  }

  process.on("SIGINT", function() {
    console.info("[PG Pool] Handling Ctrl-C...");
    cleanup();
  });

  process.on("SIGTERM", function() {
    console.info("[PG Pool] Handling SIGTERM...");
    cleanup();
  });

  process.on("uncaughtException", function(args) {
    console.warn(args)
    console.info("[PG Pool] Handling uncaughtException...");
    cleanup();
  });

  return pool;
}

export async function subscribe(pool, userEmail, object) {
  return run(pool, `
    INSERT INTO "web_push_subscriptions" ("user", "sub_object", "sub_endpoint") 
    VALUES ($1, $2, $3) 
    ON CONFLICT ON CONSTRAINT web_push_subscriptions_sub_endpoint_key
    DO NOTHING
    RETURNING *;
  `
  , [userEmail, JSON.stringify(object), object.endpoint]
  )
}

export async function getSubscriptions(pool, userEmail) {
  return (await run(pool, `
    SELECT "id", "user", "sub_object", "date_created"
    FROM "web_push_subscriptions"
    WHERE "user" = $1 and "date_disabled" is null
  `, [userEmail]
  )).rows
}

export async function logSendNotification(pool, message_uuid, subscriptions_id, title, payload) {
  return (await run(pool, `
    INSERT INTO "web_push_history" ("message_uuid", "title", "payload", "web_push_subscriptions_id") 
    VALUES($1, $2, $3, $4) RETURNING *;
  `
  , [message_uuid, title, JSON.stringify(payload), subscriptions_id])).rows[0]
}

export async function logSendNotificationResponse(pool, web_push_history_id, succeed, response) {
  return (await run(pool, `
    UPDATE "web_push_history" 
    SET "response" = $3
    ,   "response_status_code" = $2
    ,   "succeed" = $4
    WHERE id = $1
    RETURNING *;
  `
  , [web_push_history_id, response.statusCode, JSON.stringify(response), succeed])).rows[0]
}

export async function logAnalyticsDeliveryNotificationReceived(pool, message_uuid) {
  return await run(pool, `
    UPDATE "web_push_history" 
    SET "date_delivery_notification_received" = now()
    WHERE message_uuid = $1
    RETURNING *;
  `, [message_uuid]) 
} 

export async function logAnalyticsUserClicked(pool, message_uuid, action) {
  return await run(pool, `
    UPDATE "web_push_history" 
    SET "date_user_clicked" = now()
    ,   "user_click_action" = $2
    WHERE message_uuid = $1
    RETURNING *;
  `, [message_uuid, action]) 
} 

export async function logAnalyticsClosed(pool, message_uuid) {
  return await run(pool, `
    UPDATE "web_push_history" 
    SET "date_closed" = now()
    WHERE message_uuid = $1
    RETURNING *;
  `, [message_uuid]) 
} 