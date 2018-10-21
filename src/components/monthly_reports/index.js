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

import { get } from '../../helpers'

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

  state = {
    chart_data: null
  }

  fetch_and_draw_chart(params) {
    get({url: 
      `/api/v1/monthly/${params.date_from}/${params.date_to}/${params.filter}/${params.breakdown}`
      , cache: "force-cache"}, {cache: "force-cache"}
    ).then(data => {
        
      const safe_div = (a, b) => 
          a == 0 && b == 0 ? null
        : b == 0 ? 'DIV BY ZERO'
        : a / b
        
      const toSection = data => R.pipe(
            R.groupBy(x => x.section)
          , R.map(R.map(d => ({
              d_month: d.d_month
            , section: d.section
            , revenue: d.revenue
            , cost: d.cost
            , sales: d.sales
            , resubscribes: d.resubscribes
            , firstbillings: d.firstbillings
            , optouts: d.optouts
            , net_growth: d.sales - d.optouts
            , tb_revenue: d.tb_revenue
          
            , eCPA: safe_div(d.cost, d.sales)
            , arpu_now: safe_div(d.tb_revenue, d.sales)
            , arpu_week_1:   safe_div(d.revenue_week_1,   d.sales_week_1)
            , arpu_week_2:   safe_div(d.revenue_week_2,   d.sales_week_2)
            , arpu_month_1:  safe_div(d.revenue_month_1,  d.sales_month_1)
            , arpu_month_2:  safe_div(d.revenue_month_2,  d.sales_month_2)
            , arpu_month_3:  safe_div(d.revenue_month_3,  d.sales_month_3)
            , arpu_month_4:  safe_div(d.revenue_month_4,  d.sales_month_4)
            , arpu_month_5:  safe_div(d.revenue_month_5,  d.sales_month_5)
            , arpu_month_6:  safe_div(d.revenue_month_6,  d.sales_month_6)
            , arpu_month_7:  safe_div(d.revenue_month_7,  d.sales_month_7)
            , arpu_month_8:  safe_div(d.revenue_month_8,  d.sales_month_8)
            , arpu_month_9:  safe_div(d.revenue_month_9,  d.sales_month_9)
            , arpu_month_10: safe_div(d.revenue_month_10, d.sales_month_10)
            , arpu_month_11: safe_div(d.revenue_month_11, d.sales_month_11)
            , arpu_month_12: safe_div(d.revenue_month_12, d.sales_month_12)
            
            , revenue_week_1: d.revenue_week_1
            , revenue_week_2: d.revenue_week_2
            , revenue_month_1: d.revenue_month_1
            , revenue_month_2: d.revenue_month_2
            , revenue_month_3: d.revenue_month_3
            , revenue_month_4: d.revenue_month_4
            , revenue_month_5: d.revenue_month_5
            , revenue_month_6: d.revenue_month_6
            , revenue_month_7: d.revenue_month_7
            , revenue_month_8: d.revenue_month_8
            , revenue_month_9: d.revenue_month_9
            , revenue_month_10: d.revenue_month_10
            , revenue_month_11: d.revenue_month_11
            , revenue_month_12: d.revenue_month_12
            , sales_week_1: d.sales_week_1
            , sales_week_2: d.sales_week_2
            , sales_month_1: d.sales_month_1
            , sales_month_2: d.sales_month_2
            , sales_month_3: d.sales_month_3
            , sales_month_4: d.sales_month_4
            , sales_month_5: d.sales_month_5
            , sales_month_6: d.sales_month_6
            , sales_month_7: d.sales_month_7
            , sales_month_8: d.sales_month_8
            , sales_month_9: d.sales_month_9
            , sales_month_10: d.sales_month_10
            , sales_month_11: d.sales_month_11
            , sales_month_12: d.sales_month_12
            })))
          , R.toPairs
          , R.map(([section, data]) => ({
              section: section
            , sales: R.sum(data.map(d => d.sales || 0))
            , revenue: R.sum(data.map(d => d.revenue || 0))
            , cost: R.sum(data.map(d => d.cost || 0))
            , data: R.map(d => R.merge({
                arpus: [
                    ['week' ,  1]
                  , ['week' ,  2]
                  , ['month',  1]
                  , ['month',  2]
                  , ['month',  3]
                  , ['month',  4]
                  , ['month',  5]
                  , ['month',  6]
                  , ['month',  7]
                  , ['month',  8]
                  , ['month',  9]
                  , ['month', 10]
                  , ['month', 11]
                  , ['month', 12]
                ].map(([part, n]) => ({
                      date: moment(d.d_month).add(n, part).toJSON()
                    , arpu: d[`arpu_${part}_${n}`]
                    , base: d[`sales_${part}_${n}`]
                    , days: moment(d.d_month).add(n, part).diff(moment(d.d_month), 'day')
                    , breakeven: d[`arpu_${part}_${n}`] >= d.eCPA 
                })).filter(a => a.arpu != null)
              }, d))(data)
          }))
      )(data)
      
      return R.pipe(
          R.groupBy(x => x.page)
        , R.toPairs
        , R.chain(([page, pdata]) => toSection(pdata).map(s => R.merge({page}, s)))
      )(data)
    })
    .then(chart_data => this.setState({chart_data}))
  }

  constructor(props : any) {
    super(props)
  
    const params = props_to_params(props)
    if(params.filter != '-') {
      props.fetch_monthly_reports(params.date_from, params.date_to, params.filter, params.breakdown)
      this.fetch_and_draw_chart(params);

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

    if(params.filter != '-' && (params.filter != current_params.filter || params.breakdown != current_params.breakdown || params.date_from != current_params.date_from || params.date_to != current_params.date_to )) {
      this.fetch_and_draw_chart(params);
    }

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
          // const page_data = R.pipe(
          //     R.map(x => R.merge(x, {page: x.section}))
          //   , R.sortBy(x => R.pipe(R.map(x => !!x.sales ? x.sales : 0), R.sum, x => x * - 1)(x.data))
          // )(data)

          const page_data = R.pipe(
              R.map(p => R.merge(p, {data: R.sortBy(s => s.sales * -1)(p.data)}))
            , R.sortBy(p => p.sales * -1)
          )(data)
          
          return <Tabs pages={page_data} params={params}
                sort={ this.props.sort  } // this.props.sort
                onSort={ (field, order) => this.props.sort_row_filter_page_section_row(field, order) }
                page={ 
                  (args) => {
                    return <div>
                      {
                        args.data.map((section, i) => {
                          const chart_data = !this.state.chart_data ? null : this.state.chart_data.find(c => c.page == section.page && c.section == section.section)
                          const page_args = {...section, chart_data: chart_data}
                          return <div key={i.toString()} style={{margin: '0 0 4em 0', borderBottom: 'solid 1px gray'}}>
                            <h3 style={{clear: 'both'}}>{section.section}</h3>
                            <Page { ...page_args } />
                          </div>
                        }
                        )
                      }
                    </div>
                  }
                }
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
