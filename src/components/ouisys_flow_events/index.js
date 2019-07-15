// @flow

import React from 'react'
import { connect } from 'react-redux'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_user_sessions, cleanup_fetch_user_sessions
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'

import Controls from './Controls'
import View from './View'

import { match, fetchState } from '../../adts'

import user_sessions_selector from '../../selectors/user_sessions.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'
const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")

const { get } = require('../../helpers/fetch')

class ViewComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fetchState: fetchState.Nothing()
    }

    const {params} = props.match

    this.props.fetch_all_affiliates()
    if(!!params.date_from && !!params.date_to) {
      this.props.fetch_all_countries(params.date_from, params.date_to)
    }

    // listen((location, action) => {
    //   console.log(action, location.pathname, location.state)
    // })
  }
  render() {
    console.log('this.props', this.props)
    return <div className="main-bottom">
      <div id="sidebar" className="visible">
        <Controls
          history={ this.props.history } 
          { ...this.props.match.params } 
          all_countries={this.props.all_countries}
          all_affiliates={this.props.all_affiliates}
          fetchState={ this.state.fetchState }
          onChange={({timezone, date_from, date_to, breakdown, filter, noCache}) => {
            this.props.history.push(`/ouisys-flow-events/${formatTimezone(timezone)}/${date_from}/${date_to}/${filter.length == 0 ? '-' : filter}/${breakdown}`)
            if(!filter || filter.length == 0) {
              return 
            }
            const url = `/api/v1/ouisys-flow-events/${timezone}/${date_from}/${date_to}/${filter.length == 0 ? '-' : filter}/${breakdown}${noCache ? `?cache_buster=${new Date().valueOf()}` : ''}`

            this.setState({fetchState: fetchState.Loading()})
            get({url})
              .then(result => {
                if(!!result.error) {
                  throw result.error
                }
                return result
              })
              .then(result => this.setState({fetchState: fetchState.Loaded(
                R.map(x => ({
                  ...x,
                  resales: x.sales - x.unique_sales_per_rockman_id
                }))(result)
              )}))
              .catch(error => this.setState({fetchState: fetchState.Error(error)}))
          }} />
      </div>
      <div id="container" className="default">
        {
          match({
              Nothing: () => <div>Press GO!</div>
            , Loading: () => <div>Loading...</div>
            , Error: (error) => <div>Error: {error.toString()}</div>
            , Loaded: (data) => <View data={data} affiliates_mapping={this.props.affiliates_mapping} /> // JSON.stringify(data, null, 2)
          })(this.state.fetchState)
        }
      </div>
    </div>
  }
}

const Index = (...args) => {
  return ViewComponent
}


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
) (Index())
