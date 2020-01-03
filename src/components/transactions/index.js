// @flow

import React from 'react'
import { connect } from 'react-redux'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_transactions, cleanup_fetch_transactions
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'

import Tabs from './Tabs'
import Controls from './Controls'

import transactions_selector from '../../selectors/transactions.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'

import Index from '../common-controls/page_section_rows_index'

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")
const make_path = (params, query) => `/transactions/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}${query}`


export default connect(
    state => ({
        data: transactions_selector(state)
      , affiliates_mapping: affiliates_mapping_selector(state)
      , sort: state.sort
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
      , controls: state.controls
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_data: fetch_transactions
      , cleanup_fetch_data: cleanup_fetch_transactions
      , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
      , set_params
    }
)(Index({make_path, Tabs, Controls, require_filter: true}))
