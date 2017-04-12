// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import controls from './controls'
import all_countries from './all_countries'
import filter_section_row from './filter_section_row'

const rootReducer = combineReducers({
  dashboard, controls
  // ---
  , all_countries
  , filter_section_row
})

export default rootReducer
