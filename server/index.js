// @flow
const express = require('express');
const {query, makeQuery} = require('./sql-api')
const fs = require('fs')
const R = require('ramda')
const query_weekly_reports = require('./sql-templates/weekly_reports')
const { cache_get, cache_set } = require('./cache')
const generate_invoice = require('./pdf_generator')
//
const md5 = require('md5')
const QuseryServer = require('../output/Server.QueryServer')
const QueryTemplateParser = require('../output/Server.QueryTemplateParser')
const { fromAff } = QuseryServer
const tolaQueryServer = QuseryServer.connect(process.env.osui_connection_string)()
const jewelQueryServer = QuseryServer.connect(process.env.jewel_connection_string)()
import {CronJob} from 'cron'
import {
  getUploadedPages,
  getPageReleases,
  findOrCreateCampaign,
  getSources,
  getAllCampaigns,
  createCampaign,
  findCampaigns,
  findMultipleCampaigns,
  updateCampaignStatus,
  createMultipleCampaigns,
  getSearchPages,
  updateCampaign,
  updatePublishedPage,
  createScenarioConfiguration,
  getScenarios
} from './ouisys_pages/db';
import fetch from "node-fetch"
import { subscribeToPush, sendPush, analyticsDeliveryNotification, analyticsClicked, analyticsClosed } from './web-push/handlers';
import { cons } from '../output/Data.Array/foreign';

const app = express();
app.use(express.static('dist'))
app.use(require('cookie-parser')());
// app.use(require('express-session')({secret: 'secret-dash'}));

app.use(require('body-parser')());

app.post('/api/v1/run_query', (req, res) => {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) { 
    req.rawBody += chunk;
  });

  req.on('end', function() {
    res.end(req.rawBody)
    // respond_jewel(req.rawBody, {}, res)
  })
})

// login
const authenticate = require('./auth')(app)
const logUserAction = require('./usage_stats')

app.post("/api/v1/subscribe", [ authenticate() ], subscribeToPush)
app.post("/api/v1/push", sendPush)
app.post("/api/v1/analytics/push-delivery-notification", analyticsDeliveryNotification)
app.post("/api/v1/analytics/push-clicked", analyticsClicked)
app.post("/api/v1/analytics/push-closed", analyticsClosed)

const connection_strings = {
    helix_connection_string: process.env['helix_connection_string']
  , jewel_connection_string: process.env['jewel_connection_string']
  , sigma_stats: process.env['sigma_stats']
}

const filter_params = params => R.pick(['from_date', 'to_date', 'timezone', 'filter', 'page', 'section', 'row'], params)

const respond = (connection_string: string, sql, params, res, map = x => x) => {
  return (!!params.cache_buster ? query(connection_string, sql, params) : cache_get(60 * 60, query, connection_string, sql, params))
  .then(x => {
    // console.log(JSON.stringify(x.fields, null, 2))
    const filtered_params = filter_params(params)
    cache_set(60 * 60, x, connection_string, sql, filtered_params)
    res.set('Content-Type', 'text/json')
    res.set('Cache-Control', 'public, max-age=7200')
    res.end(JSON.stringify(map(x.length > 0 ? R.prop('rows')(R.find(y => y.rows.length > 0)(x)) : x.rows)))
  })
  .catch(x => {
    console.error(x)
    res.status(500)
    res.end(`Error:\n${x.toString()}`)
  })
}

const respond_with_connection_name = (connection_name: string, sql, params, res, map = x => x) => {
  const connection_string = connection_strings[connection_name]
  if(connection_string == null) {
    res.status(500)
    res.end(`Error:\n${connection_name} env variable is not provided.`)
  }
  else respond(connection_string, sql, params, res, map)
}

const respond_helix = (sql, params, res, map = x => x) => respond_with_connection_name('helix_connection_string', sql, params, res, map)
const respond_jewel = (sql, params, res, map = x => x) => respond_with_connection_name('jewel_connection_string', sql, params, res, map)
const respond_sigma = (sql, params, res, map = x => x) => respond_with_connection_name('sigma_stats', sql, params, res, map)

const respond_query_text = (sql, params, res) => {
  res.set("Content-Type", "text/plain")
  res.set("Cache-Control", "public, max-age=7200")
  res.end(makeQuery(sql, params))
}

const respond_query_or_result = (resp, sql, params, req, res, transform) =>
  !!req.query && req.query.queryText == "1"
    ? respond_query_text(sql, params, res)
    : resp(sql, params, res, transform)

app.get('/api/query', (req, res) => {
  respond_helix(fs.readFileSync('./server/query.sql', 'utf8'), req.query, res)
})

app.get('/api/countries', (req, res) => {
  respond_helix(`select distinct(code) as country from ss_locations order by code`, {}, res, xs => xs.map(x => x.country))
})

const filter_to_pipe_syntax = x => (!x || x == '-') ? '' : R.pipe(
    R.split(',')
  , R.map(R.pipe(R.split('='), R.map(x => x.trim())))
  , R.reject(x => x.length != 2)
  , R.map(R.join(','))
  , R.join(',')
)(x)

app.get('/api/hello', authenticate(), (req, res) => {
  // console.log(req.cookies)
  // res.end('hello ' + req.user + ' ' + req.isAuthenticated())
  res.send(200)
},
  (err, req, res) => {
    res.send(401)
  },
)

app.get('/api/v1/home_targets', [ ], (req, res) => {
  const params = req.query

  respond_query_or_result(
      respond_sigma
    , fs.readFileSync('./server/sql-templates/targets_home/index.sql', 'utf8')
    , params
    , req
    , res
    , x => x
  )
})

// example: http://127.0.0.1:3081/api/v1/filter_section_row/2017-04-01/2017-04-07/country_code=ZA,affiliate_name=Gotzha/publisher_id/day
app.get('/api/v1/filter_section_row/:from_date/:to_date/:filter/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_query_or_result(
      respond_helix
    , fs.readFileSync('./server/sql-templates/filter_section_row/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/filter_section_row')(params)
  )
})

app.get('/api/v1/filter_page_section_row/:timezone/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/filter_page_section_row/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/filter_page_section_row')(params)
  )
})

app.get('/api/v1/filter_page_section_row/flat/:timezone/:from_date/:to_date/:filter/:page/:section/:row', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/filter_page_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_page_section_row/flat')(params)
  )
})

app.get('/api/v1/all_countries/:from_date/:to_date', (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
    respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/all_countries/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/all_countries')(params)
  )
})

app.get('/api/v1/cohort/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_helix(
      fs.readFileSync('./server/sql-templates/cohort/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/cohort')(params)
  )
})

app.get('/api/v1/transactions/:timezone/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/transactions/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/transactions')(params)
  )
})

app.get('/api/v1/transaction-cohorts/:timezone/:from_date/:to_date/:filter/:cohort/:resolution', (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
    respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/transaction_cohorts/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/transaction_cohorts')(params)
  )
})

app.get('/api/v1/arpu_long/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
    respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/arpu_long/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/arpu_long')(params)
  )
})

app.get('/api/v1/user_sessions/:timezone/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
    respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/user_sessions/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/user_sessions')(params)
  )
})

app.get('/api/v1/user_subscriptions/:timezone/:from_date/:to_date/:filter', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_jewel(
    fs.readFileSync('./server/sql-templates/user_subscriptions/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/user_subscriptions')(params)
  )
})

app.get('/api/v1/user_transactions/:timezone/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_jewel(
    fs.readFileSync('./server/sql-templates/user_subscriptions//user_transactions/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/user_subscriptions')(params)
  )
})

app.get('/api/v1/co_invoices/:timezone/:from_date/:to_date/:filter', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_jewel(
    fs.readFileSync('./server/sql-templates/co_invoices/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/co_invoices')(params)
  )
})

app.post('/api/v1/co_invoices/generate_pdf', authenticate(), (req, res) => {
  const body = req.body
  generate_invoice(body)
    .then((x) => {
      res.setHeader('Content-disposition', `attachment;`)
      res.setHeader('Content-type', 'application/pdf')
      res.send(x).pipe(res)
    })
    .catch((ex) => {
      console.error(ex)
      res.sendStatus(500)
      // res.json(err)
    })
})

app.get('/api/v1/all_affiliates', (req, res) => {
  respond_jewel(`select * from affiliate_mapping`, {}, res, R.pipe(
      R.groupBy(x => x.affiliate_name)
    , R.map(R.map(x => x.affiliate_id))
    , R.toPairs
    , R.map(([affiliate_name, affiliate_ids]) => ({affiliate_name, affiliate_ids}))
  ))
})

app.get('/api/v1/publisher_ids/:timezone/:from_date/:to_date/:filter', (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_jewel(fs.readFileSync('./server/sql-templates/publisher_ids/index.sql', 'utf8'), params, res, x => R.pipe(R.map(R.values), R.flatten)(x))
})

app.get('/api/v1/converting_ips/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) }))
  respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/converting_ips/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/converting_ips')(params))
})

app.get('/api/v1/traffic_breakdown/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/traffic_breakdown/index.sql', 'utf8')
    , params
    , req
    , res
  )
})

app.get('/api/v1/monthly_reports/:from_date/:to_date/:filter/:section', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.params, { 
      filter: filter_to_pipe_syntax(req.params.filter)
    , page: req.params.section == 'gateway' ? 'operator_code' : 'gateway' 
  })

  respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/monthly_reports/index.sql', 'utf8')
    , params
    , req
    , res
    , require('./sql-templates/monthly_reports')(params)
  )

})


app.get('/api/v1/monthly/:from_date/:to_date/:filter/:section', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.query, R.merge(req.params, { 
      filter: filter_to_pipe_syntax(req.params.filter) 
    , page: req.params.section == 'gateway' ? 'operator_code' : 'gateway' 
    , timezone: req.query.timezone || '0'
  }))
  respond_query_or_result(
      respond_jewel
    , fs.readFileSync('./server/sql-templates/monthly_reports/chart.sql', 'utf8')
    , params
    , req
    , res
    , x => x
  )
})


app.get('/api/v1/weekly_reports/:from_date/:to_date/:filter/:page/:section/:row', [ authenticate(), logUserAction ], (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter), timezone: '2' })

  const helix_connection_string = connection_strings.helix_connection_string
  const jewel_connection_string = connection_strings.jewel_connection_string
  if(helix_connection_string == null) {
    res.status(500)
    res.end(`Error:\nhelix_connection_string env variable is not provided.`)
  } else if(jewel_connection_string == null) {
    res.status(500)
    res.end(`Error:\njewel_connection_string env variable is not provided.`)
  } else {
    query_weekly_reports(helix_connection_string, jewel_connection_string, params)
    .then(data => {
      res.set('Content-Type', 'text/json')
      res.set('Cache-Control', 'public, max-age=7200')
      res.json(data)
    })
    .catch(ex => {
      console.error(ex)
      res.status(500)
      res.end(ex.toString())
    })
  }
})

// sessions

app.get('/api/v1/sessions/:timezone/:from_date/:to_date/:filter/:breakdown', (req, res) => {
  const params = req.params

  const go = async () => {
    const template = fs.readFileSync('./server/sql-templates/sessions.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates(params.filter || '')(params.breakdown || '-')(parseFloat(params.timezone) || 0)(params.from_date)(params.to_date)(template)
    )()
    
    console.log(sql)
    
    return fromAff(jewelQueryServer.querySync(!!req.query.cache_buster)(md5(sql))(sql))()
  }

  go()
  .then(result => res.send(result))
  .catch(error => res.send({error: error.toString()}))

})

//

// revenue

app.get('/api/v1/revenue/:timezone/:from_date/:to_date/:filter/:breakdown', [ authenticate(), logUserAction ], (req, res) => {
  const params = req.params

  const go = async () => {
    const template = fs.readFileSync('./server/sql-templates/revenue.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates(params.filter || '')(params.breakdown || '-')(parseFloat(params.timezone) || 0)(params.from_date)(params.to_date)(template)
    )()
    
    console.log(sql)
    
    return fromAff(jewelQueryServer.querySync(!!req.query.cache_buster)(md5(sql))(sql))()
  }

  go()
  .then(result => res.send(result))
  .catch(error => res.send({error: error.toString()}))

})

// 

// Ouisys flow events
app.get('/api/v1/ouisys-flow-events/:timezone/:from_date/:to_date/:filter/:breakdown', (req, res) => {
  const params = req.params

  const go = async () => {
    const template = fs.readFileSync('./server/sql-templates/ouisys-flow-events.sql', 'utf8')

    console.log(template)

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates(params.filter || '')(params.breakdown || '-')(parseFloat(params.timezone) || 0)(params.from_date)(params.to_date)(template)
    )()
    
    console.log(sql)
    
    return fromAff(jewelQueryServer.querySync(!!req.query.cache_buster)(md5(sql))(sql))()
  }

  go()
  .then(result => res.send(result))
  .catch(error => res.send({error: error.toString()}))

})


//

// tola

const ensureTolaReportsAreUpToDate = (() => {

  return async () => true;

  // refresh tola reports every 10 minute

  const query = 'select refresh_tola_reports()'

  const mkRunningQuery = async () => {
    console.log(query)
    const result = await fromAff(tolaQueryServer.querySync(false)(md5(query))(query))()
    return result;
  }

  setInterval(async () =>{
    try {
      await mkRunningQuery()
    } catch(ex) {
      console.error(ex)
    }
  }, 1000 * 60 * 20);

  return (cache_buster) => !!cache_buster ? mkRunningQuery() : null
})()

app.get('/api/v1/m-pesa/:timezone/:from_date/:to_date/:filter/:breakdown', [ authenticate(), logUserAction ], async (req, res) => {
  const params = req.params

  const go = async () => {

    const template = fs.readFileSync('./server/sql-templates/tola.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates(params.filter || '')(params.breakdown || '-')(parseInt(params.timezone))(params.from_date)(params.to_date)(template)
    )();

    await ensureTolaReportsAreUpToDate(req.query.cache_buster)
    
    console.log(sql)
    
    return await fromAff(tolaQueryServer.querySync(!!req.query.cache_buster)(md5(sql))(sql))()
  }

  go()
  .then(result => res.send(result))
  .catch(error => res.send({error: error.toString()}))

})

const refresh_user_sessions_temp = async () => {

  const sql = `select refresh_user_sessions_temp()`

  console.log(sql)
  
  return await fromAff(tolaQueryServer.querySync(false)(md5(sql))(sql))()
}

const refresh_user_sessions = async () => {

  const sql = `select refresh_user_sessions()`

  console.log(sql)
  
  return await fromAff(tolaQueryServer.querySync(false)(md5(sql))(sql))()
}

if(process.env.NODE_ENV != "development") {
  new CronJob('12,45 * * * *', function() {
    console.log('refresh_user_sessions_temp started')
    refresh_user_sessions_temp()
      .then(() => console.log('refresh_user_sessions_temp ended'))
      .catch(ex => console.error(ex))
  }, null, true);


  new CronJob('29 1,18 * * *', function() {
    console.log('refresh_user_sessions started')
    refresh_user_sessions()
      .then(() => console.log('refresh_user_sessions ended'))
      .catch(ex => console.error(ex))
  }, null, true);
}


app.get('/api/v1/dmb/:timezone/:from_date/:to_date/:filter/:breakdown', [ authenticate(), logUserAction ], async (req, res) => {
  const params = req.params

  const go = async () => {

    const template = fs.readFileSync('./server/sql-templates/dmb-iq-gb.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates(params.filter || '')(params.breakdown || '-')(parseInt(params.timezone))(params.from_date)(params.to_date)(template)
    )();

    console.log(sql)
    
    return await fromAff(tolaQueryServer.querySync(!!req.query.cache_buster)(md5(sql))(sql))()
  }

  go()
  .then(result => res.send(result))
  .catch(error => res.send({error: error.toString()}))

})

// end of tola


//ouisys_pages


app.get('/api/v1/get_uploaded_pages', authenticate(), async(req, res)=>{
  const finalResult = await getUploadedPages();
  if(finalResult !== null){
    
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.get('/api/v1/search_uploaded_pages', async(req, res)=>{
  const params = req.query;
  const finalResult = await getSearchPages(params);
  if(finalResult !== null){
    
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.get('/api/v1/get_page_releases', authenticate(), async(req, res)=>{
  const finalResult = await getPageReleases();
  if(finalResult !== null){
    
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }

});
app.get('/api/v1/get_sources', authenticate(), async(req, res)=>{
  const finalResult = await getSources();
  if(finalResult !== null){
    
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }

});

app.get('/api/v1/get_all_campaigns', async(req, res)=>{
  const finalResult = await getAllCampaigns();
  if(finalResult !== null){
    
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }

});


app.post('/api/v1/publish_page', authenticate(), async (req, res) => {
  try {
    const username = req.user.split("@")[0]
    const data = req.body || null;
    const { html_url, page_upload_id, page, country, scenario } = data;
  
    const finalResultFetch = await fetch(`https://c1.ouisys.com/api/v1/release-page`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html_url: html_url,
        page_upload_id: page_upload_id,
        username: username
      })
    })

    const finalResult = await finalResultFetch.json()

    if(finalResultFetch.status != 200) {
      throw finalResult 
    }

    if (finalResult !== null) {
      res.status(200).send({
        code: 200,
        data: finalResult
      })
    } else {
      res.status(401).send({
        code: 401,
        message: "Not authorized to view this page"
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      code: 500,
      data: err
    })
  }
});

app.post('/api/v1/create_campaign', authenticate(), async(req, res)=>{
  
  const username = req.user.split("@")[0];
  const { page, country, affid, comments, scenario, strategy, scenarios_config, dontReUse } = req.body;
  
  try{
    const finalResult = scenario ? 
    await (!dontReUse ? findOrCreateCampaign(page, country, affid, comments, scenario, null, null, username) : createCampaign(page, country, affid, comments, scenario, null, null, username))
    :await (!dontReUse ? findOrCreateCampaign(page, country, affid, comments, null, strategy, scenarios_config, username) : createCampaign(page, country, affid, comments, null, strategy, scenarios_config, username));
    if(finalResult !== null){ 
      res.status(200).send({
        code:200,
        data:finalResult
      })
    }else{
      res.status(401).send({
        code:401,
        message:"Not authorised to view this page"
      })
    }
  }catch(err){
    throw err
  }
});

app.post('/api/v1/create_multiple_campaigns', authenticate(), async(req, res)=>{
  //const { page, country, affid, comments, scenario, dontReUse } = req.body;
  const username = req.user.split("@")[0];
  console.log("USERRR", req.user)
  const finalResult = await createMultipleCampaigns(req.body, username);
  if(finalResult !== null){ 

    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.post('/api/v1/update_campaign', authenticate(), async(req, res)=>{
  //const { page, country, affid, comments, scenario, dontReUse } = req.body;
  const finalResult = await updateCampaign(req.body);
  if(finalResult !== null){ 

    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.post('/api/v1/update_published_page', authenticate(), async(req, res)=>{
  //const { page, country, affid, comments, scenario, dontReUse } = req.body;
  const finalResult = await updatePublishedPage(req.body);
  if(finalResult !== null){ 

    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.post('/api/v1/find_campaign', authenticate(), async(req, res)=>{
  const { page, country, affid, scenario, strategy, scenarios_config } = req.body;
  const finalResult = Array.isArray(affid) ? 
    await findMultipleCampaigns(page, country, affid, scenario, strategy, scenarios_config) :
    await findCampaigns(page, country, affid, scenario, strategy, scenarios_config);
  if(finalResult !== null){ 

    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.post('/api/v1/update_campaign_status', authenticate(), async(req, res)=>{
  const { xcid, http_status } = req.body;
  const finalResult = await updateCampaignStatus(xcid, http_status);
  if(finalResult !== null){ 
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
});

app.get("/api/v1/get_handle", async(req, res)=>{
  const params = req.query;
  console.log("params", params)
  const response = await fetch(`https://bupper.sam-media.com/api/resources/login`,
  {
    method: 'POST',
    headers:{
      "Content-Type": "application/json;charset=UTF-8"
    },
    body:JSON.stringify(params)
  }
);
const bupperUser = await response.json();
console.log("bupperUser", bupperUser)

  const resp = await fetch(`https://bupper.sam-media.com/api/resources/handle?country=${params.country}&limit=1&slug=${params.slug}`,{
    method:'get',
    headers:{
      'SAM-Access-Token':`Username=\"${params.username}\", AccessToken=\"${bupperUser.accessToken}\"`
    }
  });
  const finalResult = await resp.json();
  
  if(finalResult !== null){ 
    res.status(200).send({
      code:200,
      data:finalResult
    })
  }else{
    res.status(401).send({
      code:401,
      message:"Not authorised to view this page"
    })
  }
})

app.post('/api/v1/save_scenario_configuration', authenticate(), async(req, res, next)=>{
  
  try{
    const finalResult = await createScenarioConfiguration(req.body);
    if(finalResult !== null){ 
      res.status(200).send({
        code:200,
        data:finalResult
      })
    }
  }catch(err){
    res.status(500).send({
      code:500,
      message:`${err.message}\n\n ${err.detail ? err.detail : ""}`
    })
  }
});

app.get('/api/v1/get_scenarios', authenticate(), async(req, res, next)=>{
  
  try{
    const finalResult = await getScenarios();
    if(finalResult !== null){ 
      res.status(200).send({
        code:200,
        data:finalResult
      })
    }
  }catch(err){
    res.status(500).send({
      code:500,
      message:`${err.message}\n\n ${err.detail ? err.detail : ""}`
    })
  }
});


//end of ouisys pages

app.use('/*', express.static('dist'))

const port = process.env.PORT || 3081
const server = app.listen(port)
server.setTimeout(10 * 60 * 1000)
console.log(`app started at port ${port}`)
