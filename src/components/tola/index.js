// @flow

import React from 'react'
import { connect } from 'react-redux'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_user_sessions, cleanup_fetch_user_sessions
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'

import Tabs from './Tabs'
import Controls from './Controls'

import user_sessions_selector from '../../selectors/user_sessions.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'

class UVal {
  constructor(value, original = true){
    this.value = value
    this.original = original;
  }

  manipulate(value) {
    return new UVal(value, false)
  }

  merge(right) {
    return UVal.merge(this, right)
  }

  static merge(left, right) {
    return  left.original ? right
          : right.original ? left
          : right
  }
}

const Index = (_) => {

  class ControlComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        filterU : new UVal(props.filter),
        breakdownU: new UVal(props.breakdown)
      }
    }
    static getDerivedStateFromProps(props, state) {
      console.log('getDerivedStateFromProps', props, state)
      return {
        filterU: new UVal(props.filter).merge(state.filterU),
        breakdownU: new UVal(props.breakdown).merge(state.breakdownU)
      }
    }
    render() {
      return <div id="filters">
        <div>
          <textarea 
            onChange={ev => this.setState({filterU: new UVal(ev.target.value, false)}) }
          >{this.state.filterU.value}</textarea>
        </div>
        <div>
          <textarea
            onChange={ev => this.setState({ breakdownU: new UVal(ev.target.value, false) })}
          >{this.state.breakdownU.value}</textarea>
        </div>
        <button
          onClick={() => {
            console.log(PT.continueEither(x => x)(PT.breakdownToJson)(P.runBreakdownParser(this.state.breakdownU.value)))
          }}
        >GO!</button>
      </div>
    }
  }

  class ViewComponent extends React.Component {
    constructor(props) {
      super(props)
    }
    render() {
      console.log('this.props.match', this.props.match)
      return <div className="main-bottom">
        <div id="sidebar" className="visible">
          <ControlComponent { ...this.props.match.params } />
        </div>
        <div id="container" className="default">
          <pre style={{ marginTop: '100px' }}>${JSON.stringify(this.props, null, 2)}</pre>
        </div>
      </div>
    }
  }

  return ViewComponent
}

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")
const make_path = (params, query) => `/user_sessions/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}${query}`

const breakdown_list = [
  'affiliate_id', 'publisher_id', 'sub_id', 'sub_id',
  'gateway', 'country_code', 'operator_code',
  'handle_name', 'ad_name', 'landing_page',
  'scenario_name', 'product_type', 'service_identifier1', 'service_identifier2',
  'get_sub_method',
  'webview_app',
  'ab_test', 'ab_test_identify_key',
  'os_name', 'os_version1', 'os_version', 'browser_name', 'browser_version1', 'browser_version', 'browser_language', 'browser_languages', 'brand_name', 'model_name', 'screen_size', 'viewport_size', 'device_class',
  'hour', 'day', 'week', 'month', 'hour_of_day']

export default connect(
    state => ({
        data: user_sessions_selector(state)
      , affiliates_mapping: affiliates_mapping_selector(state)
      , sort: state.sort
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
      , controls: state.controls
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_data: fetch_user_sessions
      , cleanup_fetch_data: cleanup_fetch_user_sessions
      , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
      , set_params 
    }
) (Index({make_path, Tabs, Controls, breakdown_list}))
