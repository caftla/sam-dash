// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'

import type { QueryLoadingState, DashboardQuery } from 'my-types'

const query = (state: Maybe.Maybe<QueryLoadingState> = Maybe.Nothing, action: Action) => {
  switch (action.type) {
    case 'QUERY_SUCCESS':
      return Maybe.of({
          queryLoadingState: 'Loaded'
        , queryResult: action.payload
      })
    case 'CLEANUP_QUERY_RESULT':
      return Maybe.Nothing
    default:
      return state
  }
}

export default query
