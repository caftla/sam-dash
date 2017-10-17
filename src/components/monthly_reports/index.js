// @flow

// monthly_reports

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'
import R from 'ramda'

import type { QueryParams } from 'my-types'
import { fetchState, match } from '../../adts'
import type { FetchState } from '../../adts'

import Tabs from '../plottables/tabs'


import {
    fetch_all_countries , set_params
  , fetch_monthly_reports, cleanup_fetch_monthly_reports, sort_row_filter_page_section_row
} from '../../actions'


import Table from './Table'
import Controls from './Controls'

import moment from 'moment'

const theme = {
    flexDirection: 'row'
  , formSectionWidth: '260px'
  , formLabelWidth: '60px'
  , formLabelTextAlign: 'right'
  , filterFormSectionDisplay: 'flex'
  , filterFormSectionWidth: '600px'
  , elementHeight: '22px'
  , elementWidth: '200px'
  , fontSize: '1em'
  , formContainerMargin: '0'
  , formTitleFontSize: '1em'
  , flexAlignItems: 'flex-start'
  , submitAlignSelf: 'flex-end'
}

type Props = {
    match: { params: QueryParams }
  , history: any
  , data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_monthly_reports: (date_from : string, date_to : string, filter : string) => void
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

const Section = props => {
  return <div>Section</div>
}

const d3 = require('d3-format')
import {TD, TH, TABLE} from '../plottables/table'

const format_arpu = x => x == null ? '' : d3.format('0.2f')(x)


const Page = ({page, sales, data, params, onSort, sort} :
  { page: string, sales: number, data: Array<any>, params: QueryParams, onSort: (string, number) => void, sort: { field: string, order: number } }) => {

  const td = f => data.map((d, i) => <TD key={i}>{f(d)}</TD>)
  const Row = ({label, f, ...props}) => <tr {...props}>
    <TD>{label}</TD>
    { td(f) }
  </tr>

  const TBody = ({children}) => <tbody>
    {children.map((c, i) => R.merge(c, {
        props: R.merge(c.props, {style: { backgroundColor: i % 2 == 0 ? '' : '#f9f9f9' }})
      })
    )}
  </tbody>

  const format_null = (lens, format) => R.pipe(lens, x => x == null || isNaN(x) ? '' : format(x))

  return <TABLE width={1020} style={{marginTop: '1em'}} data-id={ page }>
    <thead>
      <TH width='150' className='clipboard-hover' onClick={ () => {
        window.clipboard.copy({"text/html": document.querySelectorAll(`table[data-id="${ page }"]`)[0].outerHTML})
      } }>{ page }</TH>
        { data.map((d, i) => <TH key={i} width='90'>{d.year_code}-{d.month_code}</TH>) }
      </thead>
    <TBody>
      <Row label='Sales' f={format_null(R.prop('sales'), d3.format(','))} />
      <Row label='Pixels %' f={format_null(x => (x.pixels / x.sales), d3.format('0.0%'))} />
      <Row label='CQ %' f={format_null(x => (x.firstbilling_count / x.sales), d3.format('0.0%'))} />
      <Row label='Active 24 %' f={format_null(x => ((x.sales - x.optout_24h) / x.sales), d3.format('0.0%'))} />
      <Row label='Cost' f={format_null(R.prop('cost'), d3.format(',.0f'))} />
      <Row label='eCPA' f={format_null(x => x.cost / x.sales, d3.format('0.2f'))} />
      <Row label='Net Subscribers Growth' f={format_null(x => (x.sales - x.optouts), d3.format(','))} />
      <Row label='Total Unsubscribers' f={format_null(R.prop('optouts'), d3.format(','))} />
      <Row label='Attempts' f={format_null(R.prop('msg_sent'), d3.format(','))} />
      <Row label='Billed' f={format_null(R.prop('msg_delivered'), d3.format(','))} />
      <Row label='Billed %' f={format_null(x => (x.msg_delivered / x.msg_sent), d3.format('0.0%'))} />
      <Row label='ARPU 7' f={format_null(R.prop('arpu_week_1'), format_arpu)} />
      <Row label='ARPU 30' f={format_null(R.prop('arpu_month_1'), format_arpu)} />
      <Row label='ARPU 60' f={format_null(R.prop('arpu_month_2'), format_arpu)} />
      <Row label='ARPU 90' f={format_null(R.prop('arpu_month_3'), format_arpu)} />
      <Row label='Revenue' f={format_null(R.prop('revenue'), d3.format(',.0f'))} />
    </TBody>
 </TABLE>
}

class MonthlyReport extends React.Component {

  props: Props

  unlisten : any
  route_changed: false

  constructor(props : any) {
    super(props)

    this.unlisten = this.props.history.listen((location, action) => {
      this.props.cleanup_fetch_monthly_reports()
      this.route_changed = true
    });
  }

  componentWillUnMount() {
    if(!!this.unlisten) {
      this.unlisten();
    }
  }

  componentWillUpdate(nextProps : Props, b) {
    const params = props_to_params(nextProps)
    const current_params = props_to_params(this.props)

    const data = this.route_changed ? fetchState.Nothing() : nextProps.data
    this.route_changed = false

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
              R.map(x => R.merge(x, {page: x.operator_code}))
            , R.sortBy(x => R.pipe(R.map(x => !!x.sales ? x.sales : 0), R.sum, x => x * - 1)(x.data))
          )(data)
          return <Tabs pages={page_data} params={params}
                sort={ this.props.sort  } // this.props.sort
                onSort={ (field, order) => this.props.sort_row_filter_page_section_row(field, order) }
                page={ Page }
                />
        }
    })(this.props.data)

    const controls_component = <ThemeProvider theme={theme}>
      {
        maybe.maybe(
            _ => {
              this.props.fetch_all_countries(params.date_from, params.date_to)
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
                  this.props.history.push(`/monthly_reports/${params.date_from}/${params.date_to}/${params.filter}/${params.breakdown}`)
                } }
              />
            }
          , this.props.all_countries
        )()
      }
    </ThemeProvider>

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
