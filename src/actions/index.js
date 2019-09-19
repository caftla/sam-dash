// @flow

import R from 'ramda'
import { post, postMayReturnError, get, toQueryString } from '../helpers'

import type { QueryParams } from 'my-types'
import type { Dispatch } from './types'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import prefix_index from './country_prefixes'

export const get_countries = () => (dispatch: Dispatch) =>  {
  get({url: 'http://0.0.0.0:3081/api/countries'})
  .then(d => dispatch({ type: 'SET_Countries', payload: d }))
}

export const query = (params: QueryParams) => (dispatch: Dispatch) => {
  get({url: 'http://0.0.0.0:3081/api/query/?' + toQueryString(params)})
  .then(d => dispatch({ type: 'QUERY_SUCCESS', payload: d }))
}

export const cleanup_fetch_filter_section_row = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_filter_section_row' })

export const set_params = (value: QueryParams) => (dispatch: Dispatch) => {
  dispatch({ type: `SET_Params`, payload: value })
  // fetch_filter_section_row(value.date_from, value.date_to, value.filter, value.section, value.row)(dispatch)
}


// ---

const api_root = process.env.api_root || '' // in production api_root is the same as the client server

export const login = (username : string, password : string) => (dispatch : Dispatch) => {
  dispatch({ type: 'login_loading' })
  post({url: `${api_root}/api/login`, body: {username, password}})
  .then((d : {success : boolean, token : string }) => {
    if (d.success) {
      dispatch({ type: 'login_success' })
      localStorage.setItem('token', d.token)
    } else { dispatch({ type: 'login_failed' }) }
    return d
  }).catch(d => {
    dispatch({ type: 'login_error', payload: d })
    console.error(d)
  })
}

export const check_loggedin = () => (dispatch : Dispatch) =>
  postMayReturnError({url: `${api_root}/api/is_loggedin`})
  .then((d : {success : boolean}) => {
    if (d.success) {
      dispatch({ type: 'login_success' })
      d.token
      ? localStorage.setItem('token', d.token)
      : null
    } else { dispatch({ type: 'login_failed' }) }
    return d
  }).catch(d => {
    console.error(d)
    d.toString() == 'Unauthorized'
      ? dispatch({ type: 'login_failed' })
    : dispatch({ type: 'login_error', payload: d })
  })

export const fetch_all_countries = (date_from : string, date_to : string) => (dispatch : Dispatch) => {
  if (new Date().valueOf() - new Date(date_from).valueOf() > 29 * 24 * 3600 * 1000) {
    // all_countries API can only query up to one month ago from the current date
    date_from = new Date(new Date().valueOf() - 29 * 24 * 3600 * 1000).toISOString().substr(0, 10)
    date_to = new Date(new Date().valueOf()).toISOString().substr(0, 10)
  } else if (date_to == 'today' && date_from.indexOf('days') > -1) {
    const today =  new Date(new Date().valueOf() + 1 * 1000 * 3600 * 24).toISOString().substr(0, 10) 
    date_to = today
    date_from = new Date(new Date().valueOf() - 29 * 24 * 3600 * 1000).toISOString().substr(0, 10)
  }
  dispatch({ type: 'fetch_all_countries_loading' })
  get({url: `${api_root}/api/v1/all_countries/${date_from}/${date_to}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_all_countries_success', payload: d }))
}

export const fetch_all_affiliates = () => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_all_affiliates_loading' })
  get({url: `${api_root}/api/v1/all_affiliates`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_all_affiliates_success', payload: d }))
}

export const fetch_filter_section_row = (date_from : string, date_to : string, filter : string, section : string, row : string) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_filter_section_row_loading' })
  get({url: `${api_root}/api/v1/filter_section_row/${date_from}/${date_to}/${filter}/${section}/${row}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_filter_section_row_success', payload: d }))
}


// filter page section row

export const fetch_filter_page_section_row = (timezone: int, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_filter_page_section_row_loading' })
  // support for relative date begins
  if (date_to == 'today' && date_from.indexOf('days') > -1) {
    const today =  new Date(new Date().valueOf() + 1 * 1000 * 3600 * 24).toISOString().substr(0, 10) 
    date_to = today
    const find_relative_date = x_days => new Date(new Date().valueOf() - x_days * 1000 * 3600 * 24).toISOString().split('T')[0] + 'T00:00:00'
    date_from = find_relative_date(parseInt(date_from))    
  }
  // support for relative date ends
  get({url: `${api_root}/api/v1/filter_page_section_row/${timezone}/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  .then(d => dispatch({ type: 'fetch_filter_page_section_row_success', payload: d }))
}

export const cleanup_fetch_filter_page_section_row = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_filter_page_section_row' })

export const sort_row_filter_page_section_row = (field: string, order: number) => (dispatch: Dispatch) =>
  dispatch({ type: 'sort_row_filter_page_section_row', payload: {field, order} })

export const sort_row_filter_page_section = (field: string, order: number) => (dispatch: Dispatch) =>
  dispatch({ type: 'sort_row_filter_page_section', payload: {field, order} })

export const min_row_filter_page_section_row = (field: string, value: number) => (dispatch: Dispatch) =>
  dispatch({ type: 'min_row_filter_page_section_row', payload: {field, value} })

export const min_row_filter_page_section = (field: string, value: number) => (dispatch: Dispatch) =>
  dispatch({ type: 'min_row_filter_page_section', payload: {field, value} })

export const set_sorters = (sorters) => (dispatch : Dispatch) =>
  dispatch({ type: 'set_sorters', payload: sorters })


// ARPU

export const fetch_arpu = (timezone: int, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_arpu_loading' })
  get({url: `${api_root}/api/v1/arpu/2017-06-14/2017-08-16/country_code=GR/operator_code/gateway/affiliate_id`, nocache})
  .then(d => dispatch({ type: 'fetch_arpu_success', payload: d }))
}

export const cleanup_fetch_arpu = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_arpu' })

// transactions

export const fetch_transactions = (timezone: int, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_transactions_loading' })
  get({url: `${api_root}/api/v1/transactions/${timezone}/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  .then(d => dispatch({ type: 'fetch_transactions_success', payload: d }))
}

export const cleanup_fetch_transactions = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_transactions' })

// transactions

// transaction_cohorts

export const fetch_transaction_cohorts = (timezone: int, date_from: string, date_to: string, filter: string, cohort: string, resolution: int, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_transaction_cohorts_loading' })
  get({url: `${api_root}/api/v1/transaction-cohorts/${timezone}/${date_from}/${date_to}/${filter}/${cohort}/${resolution}`, nocache})
  .then(d => dispatch({ type: 'fetch_transaction_cohorts_success', payload: d }))
}

export const cleanup_fetch_transaction_cohorts = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_transaction_cohorts' })

// transaction_cohorts

export const fetch_arpu_long = (date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_arpu_long_loading' })
  get({url: `${api_root}/api/v1/arpu_long/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  .then(d => dispatch({ type: 'fetch_arpu_long_success', payload: d }))
}

export const cleanup_fetch_arpu_long = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_arpu_long' })

// weekly_reports
  
export const fetch_weekly_reports = (timezone, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_weekly_reports_loading' })
  get({url: `${api_root}/api/v1/weekly_reports/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  .then(d => dispatch({ type: 'fetch_weekly_reports_success', payload: d }))
}

export const cleanup_fetch_weekly_reports = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_weekly_reports' })

// user_sessions

export const fetch_user_sessions = (timezone, date_from: string, date_to: string, filter: string, page: string, section: string, row: string, nocache: boolean) => (dispatch: Dispatch) => {
  dispatch({ type: 'fetch_user_sessions_loading' })
  get({ url: `${api_root}/api/v1/user_sessions/${timezone}/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache })
    .then(d => dispatch({ type: 'fetch_user_sessions_success', payload: d }))
}

export const cleanup_fetch_user_sessions = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_user_sessions' })


// user subscriptions

const find_prefix = country_code => country_code? R.find(R.propEq('code', country_code))(prefix_index).prefix : console.log('country code not there yet!')

export const fetch_user_subscriptions = (timezone: string, date_from: string, date_to: string, filter: string, nocache: boolean) => async (dispatch: Dispatch) => {
  dispatch({ type: 'fetch_user_subscriptions_loading' })
  const no_mod = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/${filter}`, nocache })
  if (no_mod.length > 0) {
    dispatch({ type: 'fetch_user_subscriptions_success', payload: no_mod }) 
  } else {
    const msisdn = filter.split('n=')[1]
    const country_code = filter.split('e=')[1].substring(0,2)
    const prefix = find_prefix(country_code)
    const prefix_present = msisdn.indexOf(prefix) > -1
    const starts_with_zero = msisdn.startsWith('0')
    
    switch (true) {
      case (!prefix_present && starts_with_zero):
        const remove_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(1)}`, nocache })
        if (remove_zero.length > 0){
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_zero })
        } else {
          const remove_zero_add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + msisdn.substr(1)}`, nocache })
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_zero_add_prefix })
        }
        break
        
      case (!prefix_present && !starts_with_zero):
        const add_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${'0' + msisdn}`, nocache })
        if (add_zero.length > 0) {
          dispatch({ type: 'fetch_user_subscriptions_success', payload: add_zero })
        } else {
          const add_zero_add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + '0' + msisdn}`, nocache })
          if (add_zero_add_prefix.length > 0) {
            dispatch({ type: 'fetch_user_subscriptions_success', payload: add_zero_add_prefix })
          } else {
            const add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + msisdn}`, nocache })
            dispatch({ type: 'fetch_user_subscriptions_success', payload: add_prefix })
          }
        }
        break
      
      case (prefix_present):
        const prefix_length: number = prefix.length
        const remove_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(prefix_length)}`, nocache })
        if (remove_prefix.length > 0){
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_prefix })
        } else {
          const remove_prefix_add_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${'0' + msisdn.substr(prefix_length)}`, nocache })
          
          if (remove_prefix_add_zero.length > 0) {
            dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_prefix_add_zero })
          } else {
            const remove_prefix_remove_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(prefix_length + 1)}`, nocache })
            dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_prefix_remove_zero })
          }
        }
        break

      default:
        dispatch({ type: 'fetch_user_subscriptions_success', payload: no_mod })

    }
  }
}

export const cleanup_fetch_user_subscriptions = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_user_subscriptions' })

// cohort

export const fetch_cohort = (date_from : string, date_to : string, filter : string) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_cohort_loading' })
  get({url: `${api_root}/api/v1/cohort/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_cohort_success', payload: d }))
}

export const cleanup_fetch_cohort = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_cohort' })

// converting_ips

export const fetch_converting_ips = (date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_converting_ips_loading' })
  get({url: `${api_root}/api/v1/converting_ips/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  .then(d => dispatch({ type: 'fetch_converting_ips_success', payload: d }))
}

export const cleanup_fetch_converting_ips = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_converting_ips' })

export const sort_converting_ips = (field: string, order: number) => (dispatch: Dispatch) =>
  dispatch({ type: 'sort_converting_ips', payload: {field, order} })

// traffic_breakdown

export const fetch_traffic_breakdown = (date_from : string, date_to : string, filter : string) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_traffic_breakdown_loading' })
  get({url: `${api_root}/api/v1/traffic_breakdown/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_traffic_breakdown_success', payload: d }))
}


// monthly_reports

export const fetch_monthly_reports = (date_from : string, date_to : string, filter : string, breakdown: string) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_monthly_reports_loading' })
  get({url: `${api_root}/api/v1/monthly_reports/${date_from}/${date_to}/${filter}/${breakdown}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_monthly_reports_success', payload: d }))
}

export const cleanup_fetch_monthly_reports = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_monthly_reports' })

// co_invoices

export const fetch_co_invoices = (timezone, date_from: string, date_to: string, filter: string, nocache: boolean) => (dispatch: Dispatch) => {
  dispatch({ type: 'fetch_co_invoices_loading' })
  get({ url: `${api_root}/api/v1/co_invoices/${timezone}/${date_from}/${date_to}/${filter}`, nocache })
    .then(d => dispatch({ type: 'fetch_co_invoices_success', payload: d }))
}

export const cleanup_fetch_co_invoices = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_co_invoices' })


// uploaded_pages

export const fetch_uploaded_pages = () => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'fetch_uploaded_pages' })
  get({url: `${api_root}/api/v1/get_uploaded_pages`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'fetch_uploaded_pages_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}


//search
export const search_uploaded_pages = ({key, value}) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'search_uploaded_pages' })
  get({url: `${api_root}/api/v1/search_uploaded_pages?${key}&${value}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'search_uploaded_pages_success', payload: d })
    dispatch(toggle_loader(false));
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}
// released_pages

export const fetch_released_pages = (isCreateCampaign) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'fetch_released_pages' })
  get({url: `${api_root}/api/v1/get_page_releases`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => {
    if(isCreateCampaign){
      dispatch({ type: 'fetch_released_pages_success', payload: {isCreateCampaign, ...d}})
    }else{
      dispatch({ type: 'fetch_released_pages_success', payload: d })
    }
    
    
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

// publish_page

export const publish_page = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'publish_page' })
  post({url: `${api_root}/api/v1/publish_page`, body:{...payload}}, {})
  .then(d => {
    if(d.code == 500 ) {
      throw Error(JSON.stringify(d, null, 2))
    } else {
      dispatch({ type: 'publish_page_success', payload: d })
      dispatch(toggle_loader(false));
    }
  })
  .then(()=>dispatch(create_campaign(payload)))
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}


// create_campaign

export const create_campaign = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'create_campaign' })
  post({url: `${api_root}/api/v1/create_campaign`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'create_campaign_success', payload: d })
    dispatch(toggle_loader(false));
  })
  .then(()=>dispatch(fetch_uploaded_pages()))
  .then(()=>dispatch(fetch_released_pages(true)))
  .then(()=>dispatch(toggle_show_link(true)))
  .then(()=>dispatch(toggle_create_campaign({})))
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}


//update_campaign
export const update_campaign = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'update_campaign' })
  post({url: `${api_root}/api/v1/update_campaign`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'update_campaign_success', payload: d })
    dispatch(toggle_loader(false));
    alert("Update successful")
  })
  .then(()=>{
    dispatch(get_all_campaigns());
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

//update_published_page
export const update_published_page = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'update_published_page' })
  post({url: `${api_root}/api/v1/update_published_page`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'update_published_page_success', payload: d })
    dispatch(toggle_loader(false));
    alert("Update successful")
  })
  .then(()=>{
    dispatch(get_all_campaigns());
    dispatch(fetch_released_pages());
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}
export const create_multiple_campaigns = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'create_multiple_campaigns' })
  post({url: `${api_root}/api/v1/create_multiple_campaigns`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'create_multiple_campaigns_success', payload: d })
    dispatch(toggle_loader(false));
  })
  .then(()=>dispatch(fetch_uploaded_pages()))
  .then(()=>dispatch(fetch_released_pages(true)))
  .then(()=>dispatch(toggle_show_link(true)))
  .then(()=>dispatch(toggle_create_campaign({})))
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

//get all campaigns
export const get_all_campaigns = () => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'get_all_campaigns' })
  get({url: `${api_root}/api/v1/get_all_campaigns`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'get_all_campaigns_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}
// show_campaign modal

export const toggle_show_link = (payload) => (dispatch : Dispatch) => {
  dispatch({ type: 'toggle_show_link', payload })
}

// toggle_loader

export const toggle_loader = (payload) => (dispatch : Dispatch) => {
  dispatch({ type: 'toggle_loader', payload })
}

// released_pages

const ouisys_api = "https://c1.ouisys.com";
//const ouisys_api = "http://localhost:3081";
export const get_legals = () => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'get_legals' })
  fetch(`${ouisys_api}/api/v1/get-all-legals`)
  .then(async d => {

    const data = await d.json()
    dispatch({ type: 'get_legals_success', payload: data })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}



// add-legals

export const add_legals = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'add_legals' })
  post({url: `${ouisys_api}/api/v1/add-legals`, body:{...payload}}, {})
  .then(d => {
    dispatch({ type: 'add_legals_success', payload: d })
    dispatch(toggle_loader(false));
    alert("Legal text saved!");
  }
  )
  .then(()=>{
    dispatch(get_legals());
    dispatch(toggle_legal_modal({}));
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

// update legals
export const update_legals = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'update_legals' })
  post({url: `${ouisys_api}/api/v1/update-legals`, body:{...payload}}, {})
  .then(d => {
    dispatch({ type: 'update_legals_success', payload: d })
    dispatch(toggle_loader(false));
    alert("Legal text updated!");
  }
  )
  .then(()=>{
    dispatch(toggle_legal_modal({}));
    dispatch(get_legals());
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

//delete legal
export const delete_legal = (id) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'delete_legal' })
  post({url: `${ouisys_api}/api/v1/delete-legal`, body:{id}}, {})
  .then(d => {
    dispatch({ type: 'delete_legal_success', payload: d })
    dispatch(toggle_loader(false));
    alert("Legal text deleted!");
  }
  )
  .then(()=>{
    dispatch(toggle_legal_modal({}));
    dispatch(get_legals());
  })
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}



export const toggle_legal_modal = (payload) => (dispatch : Dispatch) => {
  dispatch({ type: 'toggle_legal_modal', payload })
}


//create a campaign from affiliates


export const toggle_create_campaign = (payload) => (dispatch : Dispatch) => {
  dispatch({ type: 'toggle_create_campaign', payload })
}

export const fetch_get_sources = () => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'fetch_get_sources' })
  get({url: `${api_root}/api/v1/get_sources`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'fetch_get_sources_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

export const find_campaigns = (payload) => (dispatch : Dispatch) => {
  console.log("payload", payload)
  dispatch(toggle_loader(true));
  dispatch({ type: 'fetch_campaigns' })
  post({url: `${api_root}/api/v1/find_campaign`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch({ type: 'fetch_campaigns_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}

export const update_campaign_status = (payload) => (dispatch : Dispatch) => {
  console.log("payload", payload)
  dispatch(toggle_loader(true));
  dispatch({ type: 'update_campaign_status' })
  post({url: `${api_root}/api/v1/update_campaign_status`, body:{...payload}}, {})
  
  .then(d => {
    dispatch({ type: 'update_campaign_status_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}


export const reset_existing_campaigns = (payload) => (dispatch : Dispatch) => {
  dispatch({ type: 'reset_existing_campaigns', payload })
}


//manage-configs

export const get_scenarios = (params) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'get_handle' })
  get({url: `${api_root}/api/v1/get_scenarios`})
  
  .then(d => {
    dispatch({ type: 'get_scenarios_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}


export const get_handle = (params) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'get_handle' })
  get({url: `${api_root}/api/v1/get_handle?${toQueryString(params)}`})
  
  .then(d => {
    dispatch({ type: 'get_handle_success', payload: d })
    dispatch(toggle_loader(false));
  }
  )
  .catch((err)=>{
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}



export const save_scenario_configuration = (payload) => (dispatch : Dispatch) => {
  dispatch(toggle_loader(true));
  dispatch({ type: 'save_scenario_configuration' })
  post({url: `${api_root}/api/v1/save_scenario_configuration`, cache: "force-cache", body:{...payload}}, {cache: "force-cache"})
  .then(d => {
    dispatch(toggle_loader(false));
    if(d.code !== 200){
      alert("ERROR:\n\n" + d.message)
    }else{
      dispatch({ type: 'save_scenario_configuration_success', payload: d })
      alert("Configuration Saved Successfully!")
      location.reload();
    }
  })
  .catch((err)=>{
    console.log(err.message)
    dispatch(toggle_loader(false));
    alert("ERROR:\n\n" + err.message);
  })
}