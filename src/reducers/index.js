// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import makeControls from './controls'
import all_countries from './all_countries'
import all_affiliates from './all_affiliates'
import traffic_breakdown from './traffic_breakdown'
import filter_section_row from './filter_section_row'
import filter_page_section_row from './filter_page_section_row'
import weekly_reports from './weekly_reports'
import user_sessions from './user_sessions'
import user_subscriptions from './user_subscriptions'
import arpu from './arpu'
import transactions from './transactions'
import arpu_long from './arpu_long'
import cohort from './cohort'
import converting_ips from './converting_ips'
import monthly_reports from './monthly_reports'
import sort from './sort'
import login from './login'

const rootReducer = combineReducers({
    dashboard
  , controls: makeControls({})
  , converting_ips_controls: makeControls({
      rowSorter: { field: 'sales', order: -1, minViews: 0, minSales: 10 }
    , sectionSorter: { field: 'sales', order: -1, minViews: 0, minSales: 10 }
    })
  // ---
  , all_countries
  , all_affiliates
  , traffic_breakdown
  , filter_section_row
  , filter_page_section_row
  , weekly_reports
  , user_sessions
  , user_subscriptions
  , arpu
  , transactions
  , arpu_long
  , cohort
  , converting_ips
  , monthly_reports
  , sort
  , login
})

export default rootReducer
