// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as R from 'ramda'

import type { QueryParams } from 'my-types'

const defaultParams : QueryParams = {
    date_from: new Date(new Date().valueOf() - 8 * 24 * 3600 * 1000).toISOString().split('T')[0]
  , date_to:   new Date(new Date().valueOf() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0]
  , filter:    '-'
  , page:      'country_code'
  , section:   'country_code'
  , row:       'affiliate_name'
}

type AppState = QueryParams

const controls = (state : AppState = defaultParams , action: Action) => {
  console.log('action', action)
  switch (action.type) {
    case 'SET_Params':
      return R.merge(state, action.payload)
    default:
      return state
  }
}

export default controls
