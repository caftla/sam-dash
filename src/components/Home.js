// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import SimpleTabs from './plottables/simple-tabs'

import StandardControls from './filter_page_section_row/Controls'
import ConvertingIPsControls from './converting_ips/Controls'
import CohortControls from './cohort/Controls'
import MonthlyReportsControls from './monthly_reports/Controls'

import type { QueryParams } from 'my-types'
import type { FetchState } from '../adts'
import { match } from '../adts'
import { sequence } from '../helpers'

import "./Home.styl"

import {
  fetch_all_countries
  , fetch_all_affiliates
  , fetch_home_targets
} from '../actions'

import { fromQueryString } from '../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from './Styled'
import { getCookie, NewFeatures } from './NewFeatures'

import registerForPushNotifications, { getSubscription } from "../push"

const { format: d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")

const formatMoney = d3Format(',.3r')
const formatARPU = x => isNaN(x) || x === null ? '':  d3Format('.2f')(x)
const formatSales = x=> isNaN(x) || x === null ? '' : d3Format(",.2r")(x)
const formatPercent = d3Format(".0%")

type HomeProps = {
  fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , fetch_home_targets: () => Maybe<Array<any>>
  , history: any
}

type HomeState = {
  push_enabled: Boolean
}

class Home extends React.Component {

  state: HomeState
  props: HomeProps

  constructor(props: HomeProps) {
    super(props)
    this.state = {
      push_enabled: false,
      targets_sort: 'cost desc'
    }
  }

  componentWillUpdate(nextProps, b) {

    // this.props.fetch_all_affiliates()

  }

  componentDidMount() {
    const { params } = this.props
    getSubscription().then(t => this.setState({ push_enabled: !!t }))

    this.props.fetch_home_targets()
  }

  render() {

    const { timeFormat } = require('d3-time-format')
    const { format: d3Format } = require('d3-format')
    const formatDate = timeFormat('%Y-%m-%d')
    const formatTimezone = d3Format("+.1f")
    const timezone = new Date().getTimezoneOffset() / -60
    const date_from = formatDate(new Date(new Date().valueOf() - 7 * 24 * 3600 * 1000))
    const date_to = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
    const new_feature_check = getCookie('announce')

    const make_user_sessions_url = params =>
      `/user_sessions/${formatTimezone(timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}?${params.query}`

    const make_standard_plus_url = params =>
      `/weekly_reports/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}?${params.query}`

    const make_query = (tab, section, row) => `tabSorter=${tab}&sectionSorter=${section}&rowSorter=${row}`
    const make_sorter = (by, order, views, sales) => `${by},${order},${views},${sales}`

    const urls = [
      {
        href: make_user_sessions_url({ date_from, date_to, filter: '-', page: '-', section: '-', row: 'day', query: '' })
        , label: 'Short Daily Summary of Past 7 Days +'
      }
      ,
      {
        href: make_user_sessions_url({ date_from, date_to, filter: '-', page: '-', section: '-', row: 'country_code', query: 'rowSorter=row,1,0,0' })
        , label: 'Countries Summary of Past 7 Days'
      }
      ,
      {
        href: make_user_sessions_url({ date_from, date_to, filter: '-', page: '-', section: 'country_code', row: 'day', query: 'sectionSorter=section,1,0,0&rowSorter=row,-1,0,0' })
        , label: 'Daily Summary of Countries in the Past 7 Days +'
      }
      ,
      {
        href: make_user_sessions_url({
          date_from, date_to, filter: '-', page: 'country_code', section: 'affiliate_id', row: 'day'
          , query: make_query(make_sorter('sales', -1, 0, 200), make_sorter('sales', -1, 0, 50), make_sorter('row', -1, 0, 0))
        })
        , label: 'Top affiliates in every country in the past 7 days'
      }
      ,
      {
        href: make_standard_plus_url({
          date_from, date_to, filter: '-', page: '-', section: 'country_code', row: 'day'
          , query: make_query(make_sorter('page', -1, 0, 0), make_sorter('cost', -1, 0, 100), make_sorter('row', -1, 0, 0))
        })
        , label: 'Top countries by total cost in the past 7 days'
      }
    ]

    const sortF = ({
      "cost desc": ([country_code, [now, before]]) => now.cost * -1,
      "revenue desc": ([country_code, [now, before]]) => now.revenue * -1,
      "sales desc": ([country_code, [now, before]]) => ((now.dmb_sales || 0) + (now.aff_sales || 0))  * -1,
      "target.cost desc": ([country_code, [now, before]]) => ((now.min_dmb_sales || 0) + (now.min_aff_sales || 0)) * (now.ecpa_target || 0) * -1,
      "target.sales desc": ([country_code, [now, before]]) => ((now.min_dmb_sales || 0) + (now.min_aff_sales || 0)),
      "country_code asc": ([country_code, [now, before]]) => country_code,
    })[this.state.targets_sort]

    return <div style={{ margin: '24px' }}>
      <div style={{ margin: '80px 80px' }}>
        {!this.state.push_enabled &&
          <button onClick={() =>
            registerForPushNotifications().then(t => {
              if (t) {
                this.setState({ push_enabled: true })
              }
            })
          }>Subscribe to Push Notifications</button>
        }
      </div>
      {urls.map((u, i) => <div style={{ margin: '1em' }} key={i}>
        <a href={u.href}>{u.label}</a>
      </div>)}
      {
        // !new_feature_check
        // ? <NewFeatures>
        //   <h3>Sigma has a new feature!</h3>
        //   <p>You can now find user subscriptions and transactions details by MSISDN in the "Subscriptions" report.</p>
        //   <Submit onClick={ e => {
        //     e.preventDefault()
        //     document.getElementsByClassName("newFeature")[0].style.display = "none";
        //   }}>Procced</Submit>
        // </NewFeatures>
        // : '' 
      }
      <div className='home-targets-section'>
      <h3>Sales Targets</h3>
      <p>
        
      </p>
      <div style={{textAlign: 'right', marginBottom: '12px'}}>
        Sort by: <select value={this.state.targets_sort} onChange={ev => {
          this.setState({targets_sort: ev.target.value})
        }}>
          <option value="cost desc">Cost DESC</option>
          <option value="revenue desc">Revenue DESC</option>
          <option value="sales desc">Sales DESC</option>
          <option value="target.cost desc">Min Target Cost DESC</option>
          <option value="target.sales desc">Min Target Sales DESC</option>
          <option value="country_code asc">Country Code ASC</option>
        </select>
      </div>
      {
        this.props.home_targets({
          Nothing: () => "Nothing",
          Loading: () => "Loading",
          Error: (err) => <div>${err.toString()}</div>,
          Loaded: (data) => <table className='home-targets'>
            {
              R.pipe(
                R.groupBy(d => d.country_code)
                , R.toPairs
                , R.sortBy(sortF)
              )(data)
              .map(([country_code, [now, before]]) => {
                
                const is_less_than_aff_sales_targets = (now.aff_sales / 7) < now.min_aff_sales
                const is_less_than_dmb_sales_targets = (now.dmb_sales / 7) < now.min_dmb_sales
                const is_more_than_dmb_ecpa_targets = (now.dmb_ecpa) > now.ecpa_target * 1.1
                const is_more_than_aff_ecpa_targets = (now.aff_ecpa) > now.ecpa_target * 1.1
                const dmb_sales_achievement = !now.max_dmb_sales ? null : 1 - ((now.max_dmb_sales - now.dmb_sales / 7 ) / (now.max_dmb_sales - now.min_dmb_sales))
                const aff_sales_achievement = !now.max_aff_sales ? null : 1 - ((now.max_aff_sales - now.aff_sales / 7 ) / (now.max_aff_sales - now.min_aff_sales))
                const has_no_targets = !now.min_dmb_sales && !now.min_aff_sales

                return <tbody className={`
                  ${is_less_than_aff_sales_targets ? 'less-than-aff-sales-targets' : ''}
                  ${is_less_than_dmb_sales_targets ? 'less-than-dmb-sales-targets' : ''}
                  ${is_more_than_aff_ecpa_targets ? 'more-than-aff-ecpa-targets' : ''}
                  ${is_more_than_dmb_ecpa_targets ? 'more-than-dmb-ecpa-targets' : ''}
                  ${aff_sales_achievement > 0.5 ? 'achieving-aff' : ''}
                  ${dmb_sales_achievement > 0.5 ? 'achieving-dmb' : ''}
                  ${has_no_targets ? 'has-no-targets' : ''}
                `} style={{marginBottom: '12px'}}>
                  <tr className='main-titles'>
                    <th rowspan={5} className="country_code">
                      <a href={`https://notion-dashboard.sam-media.com/dashboard/${country_code}`} target="_blank">{country_code}</a>
                    </th>
                    <th>{/* Date */}</th>
                    <th colspan={3}>Affiliates</th>
                    <th colspan={3}>DMB</th>
                    <th colspan={1} rowspan={2} className='cost'>Monthly Cost</th>
                    <th colspan={1} rowspan={2} className='revenue'>Monthly Revenue</th>
                  </tr>
                  <tr className='aff-dmb-titles'>             
                    <th>{/* Date */}</th>
                    <th>Daily Sales</th>
                    <th>eCPA</th>
                    <th>ARPU 7</th>
                    <th>Daily Sales</th>
                    <th>eCPA</th>
                    <th>ARPU 7</th>

                  </tr>
                  <tr className='targets'>
                    <td>{/* Date */}</td>
                    <td className='aff sales'>
                      <div className='min'>Min: {formatSales(now.min_aff_sales)}</div>
                      <div className='max'>Max: {formatSales(now.max_aff_sales)}</div>
                    </td>
                    <td className='aff ecpa'>
                      <div className='target'> Target: {formatARPU(now.ecpa_target)}</div>
                    </td>
                    <td>
                      {/* ARPU 7*/}
                    </td>
                    <td className='dmb sales'>
                      <div className='min'>Min: {formatSales(now.min_dmb_sales)}</div>
                      <div className='max'>Max: {formatSales(now.max_dmb_sales)}</div>
                    </td>
                    <td className='dmb ecpa'>
                      <div className='target'> Target: {formatARPU(now.ecpa_target)}</div>
                    </td>
                    <td>
                      {/* ARPU 7*/}
                    </td>
                    <td>
                      {/* Cost */}
                      <div className='min'>Min: {formatMoney((now.min_dmb_sales + now.min_aff_sales) * now.ecpa_target * 30.5)}</div>
                      <div className='max'>Max: {formatMoney((now.max_dmb_sales + now.max_aff_sales) * now.ecpa_target * 30.5)}</div>
                    </td>
                    <td>
                      {/* Revenue */}
                    </td>
                  </tr>
                  <tr className="now">                  
                    <td className="date">
                      {now.day.split('T')[0]}
                    </td>
                    <td className='aff sales' title="Average of Sales by Affiliates in the past 7 days">
                      {formatSales(now.aff_sales / 7)}
                      {
                        !!now.min_aff_sales ?
                          <>&nbsp;<span className='achievement'>({formatPercent(aff_sales_achievement)})</span></>
                        : ''
                      }
                    </td>
                    <td className='aff ecpa' title="Average of eCPA of Affiliates in the past 7 days">
                      {formatARPU(now.aff_ecpa)}
                    </td>
                    <td title="Average of ARPU(7) from Affiliate Sales in the past 31 days">
                      {formatARPU(now.aff_arpu_7)}
                    </td>
                    <td className='dmb sales' title="Average of Sales by DMB in the past 7 days">
                      {formatSales(now.dmb_sales / 7)}
                      {
                        !!now.min_dmb_sales ?
                          <>&nbsp;<span className='achievement'>({formatPercent(dmb_sales_achievement)})</span></>
                        : ''
                      }
                    </td>
                    <td className='dmb ecpa' title="Average of eCPA of DMB Sales in the past 7 days">
                      {formatARPU(now.dmb_ecpa)   }
                    </td>
                    <td title="Average of ARPU(7) from DMB Sales in the past 31 days">
                      {formatARPU(now.dmb_arpu_7)}
                    </td>
                    <td title="Total Cost of Sales in the past 30.5 days">
                      {formatMoney(30.5 * now.cost / 7)}
                    </td>
                    <td title="Total Revenue in the past 30.5 days">
                      {formatMoney(30.5 * now.revenue /31)}
                    </td>
                  </tr>
                  <tr className="before">
                    <td className="date">
                      {before.day.split('T')[0]}
                    </td>
                    <td className='aff sales'>
                      {formatSales(before.aff_sales / 31)}
                    </td>
                    <td className='aff ecpa'>
                      {formatARPU(before.aff_ecpa)}
                    </td>
                    <td>
                      {formatARPU(before.aff_arpu_7)}
                    </td>
                    <td className='dmb sales'>
                      {formatSales(before.dmb_sales / 31)}
                    </td>
                    <td className='dmb ecpa'>
                      {formatARPU(before.dmb_ecpa)}
                    </td>
                    <td>
                      {formatARPU(before.dmb_arpu_7)}
                    </td>
                    <td>
                      {formatMoney(30.5 * before.cost /31)}
                    </td>
                    <td>
                      {formatMoney(30.5 * before.revenue / 31 )}
                    </td>
                  </tr>
                </tbody>
                })
            }
          </table>
        })
      }
    </div>
    </div>
  }
}


export default connect(
  state => ({
    all_countries: state.all_countries
    , all_affiliates: state.all_affiliates
    , home_targets: state.home_targets
  })
  , {
    fetch_all_countries
    , fetch_all_affiliates
    , fetch_home_targets
  }
)(Home)
