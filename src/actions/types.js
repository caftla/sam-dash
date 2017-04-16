// @flow

import type { QueryParams } from 'my-types'

export type Action =
    { type: 'SET_Countries', payload: Array<string> }
  | { type: 'QUERY_SUCCESS', payload: any }
  | { type: 'SET_Params', payload: QueryParams }
  | { type: 'cleanup_fetch_filter_section_row' }
  // ---
  | { type: 'fetch_filter_section_row_success', payload: Array<any> }
  | { type: 'fetch_all_countries_loading' }
  | { type: 'fetch_all_countries_success', payload: Array<any> }
  | { type: 'fetch_filter_section_row_loading'}
  //--
  | { type: 'fetch_filter_page_section_row_loading' }
  | { type: 'fetch_filter_page_section_row_success', payload: Array<any> }
  | { type: 'cleanup_fetch_filter_page_section_row' }
  | { type: 'sort_row_filter_page_section_row', payload: {field: string, order: number} }
  // -- login
  | { type: 'login_loading' }
  | { type: 'login_success' }
  | { type: 'login_failed' }

export type Dispatch = (Action) => void; // (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
