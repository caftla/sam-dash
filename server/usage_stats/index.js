// @flow
const fs = require('fs')
const path = require('path')
const URL = require('url').URL
const R = require('ramda')
const pg = require('pg')



async function logToDatabase(user: string, report: string, filter: string, tab: string, section: string, row: string) {
  
    const client = new pg.Client({
      connectionString: process.env.sigma_stats
    });

    await client.connect();
    let result

    try {
      
      result = await client.query(
        `
          INSERT INTO user_logs(
            user_name
          , report
          , filter_string
          , tab_breakdown
          , section_breakdown
          , row_breakdown
          ) VALUES (
            $1
          , $2
          , $3
          , $4
          , $5
          , $6
          )
          returning *;
      `,
        [user, report, filter, tab, section, row]
      );

    } finally {
      
      console.log(result.rows[0])
  
      await client.end();
    }
}



const paramsWithoutTimeAndDate = (params) => R.pipe(
  R.omit(['from_date', 'to_date', 'timezone']),
  JSON.stringify
  )(params)

module.exports = (req, res, next) => {
    const { user, params} = req
    const user_name = user.split("@")[0]
    const referer = new URL(req.headers.referer)
    const report = referer.pathname.split("/")[1]
    const { filter, tab, section, row } = params

    logToDatabase(user_name, report, filter, tab, section, row)
      .then(x => console.log(x || ""))
      .catch(ex => {
        console.error(ex);
      });

    next();
  }