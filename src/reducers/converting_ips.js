// @flow

import type { Action } from '../actions/types'
import type { FetchState } from '../adts'
import { fetchState } from '../adts'

export default (state: FetchState<Array<any>> = fetchState.Nothing(), action: Action) : FetchState<Array<any>> => {
  switch (action.type) {
    case 'fetch_converting_ips_success':
      return fetchState.Loaded(action.payload)
    case 'fetch_converting_ips_loading':
      return fetchState.Loading()
    case 'cleanup_fetch_converting_ips':
      return fetchState.Nothing()
    default:
      return state
  }
}
