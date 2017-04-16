// @flow

import type { Action } from '../actions/types'
import type { FetchState } from 'my-types'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Either from 'flow-static-land/lib/Either'

export default (state: FetchState<Array<any>> = 'Nothing', action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'fetch_filter_page_section_row_success':
      return action.payload
    case 'fetch_filter_page_section_row_loading':
      return 'Loading'
    case 'cleanup_fetch_filter_page_section_row':
      return 'Nothing'
    default:
      return state
  }
}
