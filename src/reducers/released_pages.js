// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'fetch_released_pages_success':

    console.log("isCreateCampaign", action.payload.data.isCreateCampaign)
      if(action.payload.data.isCreateCampaign){
        console.log("HERE", state.released_pages)
        const data = state.released_pages.concat(action.payload.data)
        return data
      }else{
        return action.payload.data
      }
    case 'fetch_released_pages':
      return fetchState.Nothing()
    default:
      return state
  }
}