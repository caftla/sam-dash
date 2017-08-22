// @flow

import { post, get, toQueryString } from '../helpers'

import type { QueryParams } from 'my-types'
import type { Dispatch } from './types'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

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
    dispatch({ type: 'login_failed' })
    console.error(d)
    throw d
  })
}

export const check_loggedin = () => (dispatch : Dispatch) =>
  post({url: `${api_root}/api/is_loggedin`})
  .then((d : {success : boolean}) => {
    d.success
    ? dispatch({ type: 'login_success' })
    : dispatch({ type: 'login_failed' })
    return d
  }).catch(d => {
    console.error(d)
    throw d
  })

export const fetch_all_countries = (date_from : string, date_to : string) => (dispatch : Dispatch) => {
  if (new Date().valueOf() - new Date(date_from).valueOf() > 29 * 24 * 3600 * 1000) {
    // all_countries API can only query up to one month ago from the current date
    date_from = new Date(new Date().valueOf() - 29 * 24 * 3600 * 1000).toISOString().substr(0, 10)
    date_to = new Date(new Date().valueOf()).toISOString().substr(0, 10)
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

export const fetch_monthly_reports = (date_from : string, date_to : string, filter : string) => (dispatch : Dispatch) => {
  dispatch({ type: 'fetch_monthly_reports_loading' })
  get({url: `${api_root}/api/v1/monthly_reports/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
  .then(d => dispatch({ type: 'fetch_monthly_reports_success', payload: d }))
}

export const cleanup_fetch_monthly_reports = () => (dispatch: Dispatch) =>
  dispatch({ type: 'cleanup_fetch_monthly_reports' })

  
