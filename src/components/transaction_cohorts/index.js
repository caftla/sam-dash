// @flow

import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_transaction_cohorts, cleanup_fetch_transaction_cohorts
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'

import Controls from './Controls'
import View from './View'
import { fromQueryString, sequence } from '../../helpers'

import { match, fetchState } from '../../adts'

import user_sessions_selector from '../../selectors/user_sessions.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'
const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")

const { get } = require('../../helpers/fetch')


const props_to_params = props => {
  const defaultDateFrom = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  const defaultDateTo   = moment().subtract(1, 'month').endOf('month').add(1, 'days').format('YYYY-MM-DD')
  const deafultTimezone = '+0'
  const { params } = props.match
  const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , timezone: p => p.timezone || deafultTimezone
    , filter: p => !!p.filter? p.filter.replace(/\t/g, '%09') : '-'
    , nocache: () => query.nocache == 'true' ? true : false
  })(params))
  return mparams
}

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
  }
  render() {
    return <div className="main-bottom">
      <div id="sidebar" className="visible">
      <div id="filters">
        <Controls
          className="main-left show"
          history={ this.props.history } 
          { ...this.props.match.params } 
          all_countries={this.props.all_countries}
          all_affiliates={this.props.all_affiliates}
          fetchState={ this.state.fetchState }
          params={props_to_params(this.props)}
          set_params={({timezone, date_from, date_to, filter, cohort, resolution}) => {
            this.props.history.push(`/transaction-cohorts/${formatTimezone(timezone)}/${date_from}/${date_to}/${filter.length == 0 ? '-' : filter}/${cohort}/${resolution}`)
            this.props.fetch_data(timezone, date_from, date_to, filter, cohort, resolution)
          }}
          />
        </div>
      </div>
      <div id="container" className="default">
        {
          match({
              Nothing: () => <div>Press GO!</div>
            , Loading: () => <div>Loading...<br/><br/>This is a slow report, be patient.</div>
            , Error: (error) => <div>Error: {error.toString()}</div>
            , Loaded: (data) => <View data={data} affiliates_mapping={this.props.affiliates_mapping} /> // JSON.stringify(data, null, 2)
          })(this.props.fetchState)
        }
      </div>
    </div>
  }
}

const Index = (...args) => {
  return ViewComponent
}


export default connect(
    state => {
      return {
        affiliates_mapping: affiliates_mapping_selector(state)
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
      , fetchState: state.transaction_cohorts
    }
  }
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_data: fetch_transaction_cohorts
      , cleanup_fetch_data: cleanup_fetch_transaction_cohorts
      , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
      , set_params 
    }
) (Index())
