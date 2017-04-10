// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import controls from './controls'
import countries from './countries'
import filter_section_row from './filter_section_row'

const rootReducer = combineReducers({
  dashboard, controls, countries
  // ---
  , filter_section_row
})

export default rootReducer
