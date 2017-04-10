// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'


const reducer = (state: Maybe.Maybe<Array<any>> = Maybe.Nothing, action: Action) => {
  switch (action.type) {
    case 'fetch_filter_section_row_success':
      return Maybe.of(action.payload)
    case 'cleanup_fetch_filter_section_row':
      return Maybe.Nothing
    default:
      return state
  }
}

export default reducer
