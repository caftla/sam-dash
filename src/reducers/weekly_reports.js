// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'fetch_weekly_reports_success':
      return fetchState.Loaded(action.payload)
    case 'fetch_weekly_reports_loading':
      return fetchState.Loading()
    case 'cleanup_fetch_weekly_reports':
      return fetchState.Nothing()
    default:
      return state
  }
}
