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

import {
    fetch_all_countries
  , fetch_all_affiliates
} from '../actions'

import { fromQueryString } from '../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from './Styled'
import { getCookie, NewFeatures } from './NewFeatures'

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")


type HomeProps = {
    fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , history: any
}

type HomeState = {
}

class Home extends React.Component {

  state: HomeState
  props: HomeProps

  constructor(props: HomeProps) {
    super(props)
  }

  componentWillUpdate(nextProps, b) {

    const {params} = nextProps
    const current_params = this.props.params

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }

    this.props.fetch_all_affiliates()
    this.props.fetch_all_countries(params.date_from, params.date_to)

  }

  componentDidMount() {
    const { params } = this.props
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

    const make_standard_url = params =>
      `/filter_page_section_row/${formatTimezone(timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}?${params.query}`

    const make_user_sessions_url = params =>
      `/user_sessions/${formatTimezone(timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}?${params.query}`

    const make_standard_plus_url = params =>
      `/weekly_reports/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}?${params.query}`

    const make_query = (tab,section,row) => `tabSorter=${tab}&sectionSorter=${section}&rowSorter=${row}`
    const make_sorter = (by, order, views, sales) => `${by},${order},${views},${sales}`

    const urls= [
      {
          href: make_user_sessions_url({date_from, date_to, filter: '-', page: '-', section: '-', row: 'day', query: ''})
        , label: 'Short Daily Summary of Past 7 Days +'
      }
      ,
      {
          href: make_user_sessions_url({date_from, date_to, filter: '-', page: '-', section: '-', row: 'country_code', query: 'rowSorter=row,1,0,0'})
        , label: 'Countries Summary of Past 7 Days'
      }
      ,
      {
          href: make_user_sessions_url({date_from, date_to, filter: '-', page: '-', section: 'country_code', row: 'day', query: 'sectionSorter=section,1,0,0&rowSorter=row,-1,0,0'})
        , label: 'Daily Summary of Countries in the Past 7 Days +'
      }
      ,
      {
          href: make_standard_url({ date_from, date_to, filter: '-', page: 'country_code', section: 'affiliate_id', row: 'day'
            , query: make_query(make_sorter('sales', -1, 0, 200), make_sorter('sales', -1, 0, 50), make_sorter('row', -1, 0, 0)) })          
        , label: 'Top affiliates in every country in the past 7 days'
      }
      ,
      {
        href: make_standard_plus_url({
          date_from, date_to, filter: '-', page: '-', section: 'country_code', row: 'day'
          , query: make_query(make_sorter('page', -1, 0, 0), make_sorter('cost', -1, 0, 100), make_sorter('row', -1, 0, 0)) })
        , label: 'Top countries by total cost in the past 7 days'
      }
    ]
    
    return <div style={{ margin: '80px 80px' }}>
      {urls.map((u, i) => <div style={ {margin: '1em'} } key={i}>
          <a href={u.href}>{u.label}</a>
        </div>) }
        {!new_feature_check
          ? <NewFeatures>
            <h3>Sigma has a new feature!</h3>
            <p>You can now find user supscriptions and transactions details by MSISDN in the "Subscriptions" report.</p>
            <Submit onClick={ e => {
              e.preventDefault()
              document.getElementsByClassName("newFeature")[0].style.display = "none";
            }}>Procced</Submit>
          </NewFeatures>
          : '' }
    </div>
  }
}

export default connect(
    state => ({
        all_countries: state.all_countries
      , all_affiliates: state.all_affiliates
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
    }
)(Home)
