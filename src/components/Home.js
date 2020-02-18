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

const formatMoney = d3Format('.3s')
const formatARPU = x => isNaN(x) || x === null ? '':  d3Format('.2f')(x)
const formatSales = x=> isNaN(x) || x === null ? '' : d3Format(",.2r")(x)

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
      push_enabled: false
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

    console.log('this.state.home_targets', this.state.home_targets)

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

    return <div style={{ margin: '6px' }}>
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
        //   <p>You can now find user supscriptions and transactions details by MSISDN in the "Subscriptions" report.</p>
        //   <Submit onClick={ e => {
        //     e.preventDefault()
        //     document.getElementsByClassName("newFeature")[0].style.display = "none";
        //   }}>Procced</Submit>
        // </NewFeatures>
        // : '' 
      }
      <h3>Sales Targets</h3>
      <p>
        
      </p>
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
              )(data)
              .map(([country_code, [now, before]]) => {
                
                const is_less_than_aff_sales_targets = (now.aff_sales / 7) < now.min_aff_sales
                const is_less_than_dmb_sales_targets = (now.dmb_sales / 7) < now.min_dmb_sales

                return <tbody className={`
                  ${is_less_than_aff_sales_targets ? 'less-than-aff-sales-targets' : ''}
                  ${is_less_than_dmb_sales_targets ? 'less-than-dmb-sales-targets' : ''}
                `} style={{marginBottom: '12px'}}>
                  <tr className='main-titles'>
                    <th rowspan={5} className="country_code">{country_code}</th>
                    <th>{/* Date */}</th>
                    <th colspan={3}>Affiliates</th>
                    <th colspan={3}>DMB</th>
                    <th colspan={1} className='cost'>Monthly Cost</th>
                    <th colspan={1} className='revenue'>Monthly Revenue</th>
                  </tr>
                  <tr className='aff-dmb-titles'>             
                    <th>{/* Date */}</th>
                    <th>Sales</th>
                    <th>eCPA</th>
                    <th>ARPU 7</th>
                    <th>Sales</th>
                    <th>eCPA</th>
                    <th>ARPU 7</th>
                    <th>{/* Cost */}</th>
                    <th>{/* Revenue */}</th>
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
                    </td>
                    <td>
                      {/* Revenue */}
                    </td>
                  </tr>
                  <tr className="now">                  
                    <td className="date">
                      {now.day.split('T')[0]}
                    </td>
                    <td className='aff sales'>
                      <div className='actual'>{formatSales(now.aff_sales / 7)}</div>
                    </td>
                    <td className='aff ecpa'>
                      <div className='actual'>{formatARPU(now.aff_ecpa)}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatARPU(now.aff_arpu_7)}</div>
                    </td>
                    <td className='dmb sales'>
                      <div className='actual'>{formatSales(now.dmb_sales / 7)}</div>
                    </td>
                    <td className='dmv epca'>
                      <div className='actual'>{formatARPU(now.dmb_ecpa)   }</div>
                    </td>
                    <td>
                      <div className='actual'>{formatARPU(now.dmb_arpu_7)}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatMoney(now.cost )}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatMoney(now.revenue )}</div>
                    </td>
                  </tr>
                  <tr className="before">
                    <td className="date">
                      {before.day.split('T')[0]}
                    </td>
                    <td className='aff sales'>
                      <div className='actual'>{formatSales(before.aff_sales / 31)}</div>
                    </td>
                    <td className='aff ecpa'>
                      <div className='actual'>{formatARPU(before.aff_ecpa)}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatARPU(before.aff_arpu_7)}</div>
                    </td>
                    <td className='dmb sales'>
                      <div className='actual'>{formatSales(before.dmb_sales / 31)}</div>
                    </td>
                    <td className='dmb ecpa'>
                      <div className='actual'>{formatARPU(before.dmb_ecpa)}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatARPU(before.dmb_arpu_7)}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatMoney(before.cost )}</div>
                    </td>
                    <td>
                      <div className='actual'>{formatMoney(before.revenue )}</div>
                    </td>
                  </tr>
                </tbody>
                })
            }
          </table>
        })
      }
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
