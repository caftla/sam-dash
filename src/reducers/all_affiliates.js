// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'


const query = (state: Maybe.Maybe<Array<any>> = Maybe.Nothing, action: Action) => {
  switch (action.type) {
    case 'fetch_all_affiliates_success':
      return Maybe.of(action.payload)
    default:
      return state
  }
}

export default query
