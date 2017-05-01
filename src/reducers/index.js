// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import controls from './controls'
import all_countries from './all_countries'
import filter_section_row from './filter_section_row'
import filter_page_section_row from './filter_page_section_row'
import cohort from './cohort'
import converting_ips from './converting_ips'
import monthly_reports from './monthly_reports'
import sort from './sort'
import login from './login'

const rootReducer = combineReducers({
  dashboard, controls
  // ---
  , all_countries
  , filter_section_row
  , filter_page_section_row
  , cohort
  , converting_ips
  , monthly_reports
  , sort
  , login
})

export default rootReducer
