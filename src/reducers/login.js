// @flow

import type { Action } from '../actions/types'
import type { FetchState } from 'my-types'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

const reducer = (state: FetchState<boolean> = 'Nothing', action: Action) : FetchState<boolean> => {
  switch (action.type) {
    case 'login_success':
      return true
    case 'login_loading':
      return 'Loading'
    case 'login_failed':
      return false
    default:
      return state
  }
}

export default reducer
