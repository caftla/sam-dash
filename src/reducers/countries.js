// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'


const query = (state: Maybe.Maybe<Array<string>> = Maybe.Nothing, action: Action) => {
  switch (action.type) {
    case 'SET_Countries':
      return Maybe.of(action.payload)
    default:
      return state
  }
}

export default query
