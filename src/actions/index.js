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

export const set_params = (value: QueryParams) => (dispatch: Dispatch) =>
  dispatch({ type: `SET_Params`, payload: value })


// ---

const api_root = process.env.api_root || ''

export const fetch_all_countries = (date_from : string, date_to : string) => (dispatch : Dispatch) =>
  get({url: `${api_root}/api/v1/all_countries/${date_from}/${date_to}`})
  .then(d => dispatch({ type: 'fetch_all_countries_success', payload: d }))


export const fetch_filter_section_row = (date_from : string, date_to : string, filter : string, section : string, row : string) => (dispatch : Dispatch) =>
  get({url: `${api_root}/api/v1/filter_section_row/${date_from}/${date_to}/${filter}/${section}/${row}`})
  .then(d => dispatch({ type: 'fetch_filter_section_row_success', payload: d }))
