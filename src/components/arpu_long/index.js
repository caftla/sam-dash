// @flow

import React from 'react'
import { connect } from 'react-redux'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_arpu_long, cleanup_fetch_arpu_long
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'

import Tabs from './Tabs'
import Controls from './Controls'

import arpu_long_selector from '../../selectors/arpu_long.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'

import Index from '../common-controls/page_section_rows_index'

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")
const make_path = (params, query) => `/arpu_long/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}${query}`


export default connect(
    state => ({
        data: arpu_long_selector(state)
      , affiliates_mapping: affiliates_mapping_selector(state)
      , sort: state.sort
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
      , controls: state.controls
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_data: (timezone, ...args) => fetch_arpu_long(...args)
      , cleanup_fetch_data: cleanup_fetch_arpu_long
      , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
      , set_params 
    }
)(Index({make_path, Tabs, Controls}))
