// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'



export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    
    case 'get_scenarios_success':
        console.log("jjjj", action.payload.data)
      return action.payload.data
    case 'get_senarios':
      return fetchState.Nothing()
    default:
      return state
  }
}