// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as R from 'ramda'

import type { QueryParams } from 'my-types'
const { format : d3Format } = require('d3-format')


const tz = new Date().getTimezoneOffset() 
const tz_60 = tz / -60
const tz_ext = `T00:00:00+${d3Format('02.0f')(Math.floor(tz_60))}:${d3Format('02.0f')(tz_60 - Math.floor(tz_60))}`

const defaultParams : QueryParams = {
    date_from: new Date(new Date().valueOf() - 15 * 24 * 3600 * 1000 -1).toISOString().split('T')[0] + tz_ext
  , date_to:   new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000 -1).toISOString().split('T')[0] + tz_ext
  , timezone:   -1 * tz / 60
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
