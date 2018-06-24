// @flow

// monthly_reports

import React from 'react'
import { connect } from 'react-redux'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'
import R from 'ramda'
import moment from 'moment'
const d3 = require('d3-format')

import type { QueryParams } from 'my-types'
import { fetchState, match } from '../../adts'
import type { FetchState } from '../../adts'

import Tabs from '../plottables/tabs'
import Page from './Page'
import Controls from './Controls'

import {
    fetch_all_countries , set_params
  , fetch_monthly_reports, cleanup_fetch_monthly_reports, sort_row_filter_page_section_row
} from '../../actions'


type Props = {
    match: { params: QueryParams }
  , history: any
  , data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_monthly_reports: (date_from : string, date_to : string, filter : string, section: string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , cleanup_fetch_monthly_reports: () => void
  , sort_row_filter_page_section_row: (field: string, order: number) => void
  , sort: { field: string, order: number }
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
  const {timeFormat} = require('d3-time-format')
  const formatDate = timeFormat('%Y-%m-%d')
  const m = moment().add(-6, 'months').startOf('month')
  const defaultDateFrom = formatDate(m.toDate())
  const defaultDateTo   = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
  const {params} = props.match
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  // const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , filter: p => p.filter || '-'
  })(params))
  return mparams
}


class MonthlyReport extends React.Component {

  props: Props

  unlisten : any
  route_changed: false

  constructor(props : any) {
    super(props)
  
    const params = props_to_params(props)
    if(params.filter != '-') {
      props.fetch_monthly_reports(params.date_from, params.date_to, params.filter, params.breakdown)
    }
    props.fetch_all_countries(params.date_from, params.date_to)
  }

  componentWillUpdate(nextProps : Props, b) {
    
    const params = props_to_params(nextProps)
    const current_params = props_to_params(this.props)

    const data = nextProps.data

    match({
        Nothing: () => params.filter != '-' ? nextProps.fetch_monthly_reports(params.date_from, params.date_to, params.filter, params.breakdown) : void 9
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(data)

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }


  render() {
    const params = props_to_params(this.props)
    const data_component = params.filter == '-' ? <div className='route-message'>Please select some filters first</div> : match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => {
          const page_data = R.pipe(
              R.map(x => R.merge(x, {page: x.section}))
            , R.sortBy(x => R.pipe(R.map(x => !!x.sales ? x.sales : 0), R.sum, x => x * - 1)(x.data))
          )(data)
          return <Tabs pages={page_data} params={params}
                sort={ this.props.sort  } // this.props.sort
                onSort={ (field, order) => this.props.sort_row_filter_page_section_row(field, order) }
                page={ Page }
                />
        }
    })(this.props.data)

    const controls_component = <div>
      {
        maybe.maybe(
            _ => {
              return <div>Loading...</div>
            }
          , all_countries => _ => {
              return  <Controls
                className="main-left show"
                params={ params }
                countries={ all_countries }
                set_params={ params => {
                  this.props.set_params(params)
                  this.props.cleanup_fetch_monthly_reports()
                  // this.props.fetch_monthly_reports(params.date_from, params.date_to, params.filter, params.breakdown)
                  this.props.history.push(`/monthly_reports/${params.date_from}/${params.date_to}/${params.filter}/${params.breakdown}`)
                } }
              />
            }
          , this.props.all_countries
        )()
      }
    </div>

    return <div className="main-bottom">
      <div id="sidebar" className="visible">
        <div id="filters">
          { controls_component }
        </div>
      </div>
      <div id="container" className="default">
        { data_component } 
      </div>
    </div>

  }
}

export default connect(
    state => ({
        all_countries: state.all_countries
      , data: state.monthly_reports
      , controls: state.controls
    })
  , {
        fetch_all_countries, set_params
      , fetch_monthly_reports, cleanup_fetch_monthly_reports, sort_row_filter_page_section_row
    }
)(MonthlyReport)
