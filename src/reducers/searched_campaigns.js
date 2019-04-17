// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'reset_existing_campaigns':
      return []
    case 'fetch_campaigns_success':
      return action.payload.data
    case 'fetch_campaigns':
      return fetchState.Nothing()
    default:
      return state
  }
}