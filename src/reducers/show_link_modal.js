// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'toggle_show_link':
      return action.payload
    default:
      return state
  }
}