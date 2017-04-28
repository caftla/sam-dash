// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import controls from './controls'
import all_countries from './all_countries'
import filter_section_row from './filter_section_row'
import filter_page_section_row from './filter_page_section_row'
import cohort from './cohort'
import sort from './sort'
import login from './login'

const rootReducer = combineReducers({
  dashboard, controls
  // ---
  , all_countries
  , filter_section_row
  , filter_page_section_row
  , cohort
  , sort
  , login
})

export default rootReducer
