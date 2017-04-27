// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

const reducer = (state: FetchState<boolean> = fetchState.Nothing(), action: Action) : FetchState<boolean> => {
  switch (action.type) {
    case 'login_success':
      return fetchState.Loaded(true)
    case 'login_loading':
      return fetchState.Loading()
    case 'login_failed':
      return fetchState.Loaded(false)
    default:
      return state
  }
}

export default reducer
