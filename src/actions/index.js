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
  const no_mod = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/${filter}/-/-/-`, nocache })
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
        const remove_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(1)}/-/-/-`, nocache })
        if (remove_zero.length > 0){
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_zero })
        } else {
          const remove_zero_add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + msisdn.substr(1)}/-/-/-`, nocache })
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_zero_add_prefix })
        }
        break
        
      case (!prefix_present && !starts_with_zero):
        const add_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${'0' + msisdn}/-/-/-`, nocache })
        if (add_zero.length > 0) {
          dispatch({ type: 'fetch_user_subscriptions_success', payload: add_zero })
        } else {
          const add_zero_add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + '0' + msisdn}/-/-/-`, nocache })
          if (add_zero_add_prefix.length > 0) {
            dispatch({ type: 'fetch_user_subscriptions_success', payload: add_zero_add_prefix })
          } else {
            const add_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${prefix + msisdn}/-/-/-`, nocache })
            dispatch({ type: 'fetch_user_subscriptions_success', payload: add_prefix })
          }
        }
        break
      
      case (prefix_present):
        const prefix_length: number = prefix.length
        const remove_prefix = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(prefix_length)}/-/-/-`, nocache })
        if (remove_prefix.length > 0){
          dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_prefix })
        } else {
          const remove_prefix_add_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${'0' + msisdn.substr(prefix_length)}/-/-/-`, nocache })
          
          if (remove_prefix_add_zero.length > 0) {
            dispatch({ type: 'fetch_user_subscriptions_success', payload: remove_prefix_add_zero })
          } else {
            const remove_prefix_remove_zero = await get({ url: `${api_root}/api/v1/user_subscriptions/${timezone}/${date_from}/${date_to}/country_code=${country_code},msisdn=${msisdn.substr(prefix_length + 1)}/-/-/-`, nocache })
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

  
