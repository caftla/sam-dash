// @flow

import type { QueryParams } from 'my-types'

export type Action =
    { type: 'SET_Countries', payload: Array<string> }
  | { type: 'QUERY_SUCCESS', payload: any }
  | { type: 'SET_Params', payload: QueryParams }
  | { type: 'cleanup_fetch_filter_section_row' }
  // ---
  | { type: 'fetch_filter_section_row_success', payload: Array<any> }
  | { type: 'fetch_filter_section_row_loading'}
  // -- all_countries
  | { type: 'fetch_all_countries_loading' }
  | { type: 'fetch_all_countries_success', payload: Array<any> }
  // -- arpu
  | { type: 'fetch_arpu_loading' }
  | { type: 'fetch_arpu_success', payload: Array<any> }
  
  // -- all_affiliates
  | { type: 'fetch_all_affiliates_loading' }
  | { type: 'fetch_all_affiliates_success', payload: Array<any> }
  //-- filter page section row
  | { type: 'fetch_filter_page_section_row_loading' }
  | { type: 'fetch_filter_page_section_row_success', payload: Array<any> }
  | { type: 'cleanup_fetch_filter_page_section_row' }
  | { type: 'sort_row_filter_page_section_row', payload: {field: string, order: number} }
  | { type: 'sort_row_filter_page_section', payload: {field: string, order: number} }
  | { type: 'min_row_filter_page_section_row', payload: {field: string, value: number} }
  | { type: 'min_row_filter_page_section', payload: {field: string, value: number} }
  // -- cohort
  | { type: 'fetch_cohort_loading' }
  | { type: 'fetch_cohort_success', payload: Array<any> }
  | { type: 'cleanup_fetch_cohort' }
  // --
  | { type: 'fetch_converting_ips_loading' }
  | { type: 'fetch_converting_ips_success', payload: Array<any> }
  | { type: 'cleanup_fetch_converting_ips' }
  | { type: 'sort_converting_ips', payload: { field: string, order: number }}
  // --
  | { type: 'fetch_traffic_breakdown_loading' }
  | { type: 'fetch_traffic_breakdown_success', payload: Array<any> }
  // --
  | { type: 'fetch_monthly_reports_loading' }
  | { type: 'fetch_monthly_reports_success', payload: Array<any> }
  | { type: 'cleanup_fetch_monthly_reports' }
  // -- login
  | { type: 'login_loading' }
  | { type: 'login_success' }
  | { type: 'login_failed' }

export type Dispatch = (Action) => void; // (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
