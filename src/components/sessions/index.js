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

import { match, fetchState } from '../../adts'

import user_sessions_selector from '../../selectors/user_sessions.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'


const Index = (_) => {

  const { get } = require('../../helpers/fetch')

  class ViewComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        fetchState: fetchState.Nothing()
      }

      console.log('***', this.props.match)

      // listen((location, action) => {
      //   console.log(action, location.pathname, location.state)
      // })
    }
    render() {
      console.log('this.props.match', this.props.match)
      return <div className="main-bottom">
        <div id="sidebar" className="visible">
          <Controls
            history={ this.props.history } 
            { ...this.props.match.params } 
            fetchState={ this.state.fetchState }
            onChange={({timezone, date_from, date_to, breakdown, filter}) => {
              this.props.history.push(`/sessions/${formatTimezone(timezone)}/${date_from}/${date_to}/${filter}/${breakdown}`)
              const url = `/api/v1/sessions/${timezone}/${date_from}/${date_to}/${filter}/${breakdown}`

              this.setState({fetchState: fetchState.Loading()})
              get({url})
                .then(result => this.setState({fetchState: fetchState.Loaded(result)}))
                .catch(error => this.setState({fetchState: fetchState.Error(error)}))
            }} />
        </div>
        <div id="container" className="default">
          <pre style={{ marginTop: '0px' }}>
          {
            match({
                Nothing: () => <div>Press GO!</div>
              , Loading: () => <div>Loading...</div>
              , Error: (error) => <div>Error: {error.toString()}</div>
              , Loaded: (data) => JSON.stringify(data, null, 2)
            })(this.state.fetchState)
          }
          </pre>
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
  'affiliate_id', 'publisher_id', 'sub_id',
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
        affiliates_mapping: affiliates_mapping_selector(state)
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
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
