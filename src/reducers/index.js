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
import co_invoices from './co_invoices'
import sort from './sort'
import login from './login'
import uploaded_pages from './uploaded_pages'
import released_pages from './released_pages'
import published_page from './published_page'
import created_campaign from './created_campaign'
import show_link_modal from './show_link_modal'
import is_loading from './is_loading'

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
  , co_invoices
  , sort
  , login
  , uploaded_pages
  , released_pages
  , published_page
  , created_campaign
  , show_link_modal
  , is_loading
})

export default rootReducer
