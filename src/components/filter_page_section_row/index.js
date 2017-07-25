// @flow

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_filter_page_section_row, cleanup_fetch_filter_page_section_row
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'
import type { QueryParams } from 'my-types'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'

import Tabs from './Tabs'
import Controls from './Controls'

import filter_page_section_row_selector from '../../selectors/filter_page_section_row.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'
import { fromQueryString } from '../../helpers'

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")


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
  , formSectionButtonsFlexDirection: 'column'
  , checkBoxDivTransform: ' '
}

type Props = {
    match: { params: QueryParams }
  , history: any
  , data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_filter_page_section_row: (date_from : string, date_to : string, filter : string, page : string, section : string, row : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , cleanup_fetch_filter_page_section_row: () => void
  , sort_row_filter_page_section_row: (field: string, order: number) => void
  , sort: any
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
  const {timeFormat} = require('d3-time-format')
  const formatDate = timeFormat('%Y-%m-%d')
  const defaultDateFrom = formatDate(new Date(new Date().valueOf() - 7 * 24 * 3600 * 1000))
  const defaultDateTo   = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
  const {params} = props.match
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      timezone: () => parseFloat(params.timezone) || new Date().getTimezoneOffset() / -60
    , nocache:  () => query.nocache == 'true' ? true : false
    , date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , filter: p => p.filter || '-'
    , page: p => p.page || '-'
    , section: p => p.section || '-'
    , row: p => p.row || 'day'
  })(params))
  return mparams
}

const query_to_sort = props => {
  const defaultSort = props.sort
    const query = fromQueryString(props.location.search)
    return R.merge(defaultSort, {
      rowSorter: { ...defaultSort.rowSorter, minViews: (!!query.min_views ? parseInt(query.min_views) : 0), minSales: (!!query.min_sales ? parseInt(query.min_sales) : 0) }
    })
}


// This is a route
class Filter_Page_Section_Row extends React.Component {

  props: Props

  unlisten : any
  route_changed: false


  constructor(props : Props) {
    super(props)

    this.unlisten = this.props.history.listen((location, action) => {
      this.props.cleanup_fetch_filter_page_section_row()
      this.route_changed = true
    });
  }

  componentWillUnMount() {
    if(!!this.unlisten) {
      this.unlisten();
    }
  }

  componentWillUpdate(nextProps, b) {
    const params = props_to_params(nextProps)
    const current_params = props_to_params(this.props)
    
    const data = this.route_changed ? fetchState.Nothing() : nextProps.data
    this.route_changed = false

    match({
        Nothing: () => {
          // compatiblity with affiliate_name in the filter part of the URL
          const filter = R.pipe(
              R.split(',')
            , R.map(R.split('='))
          )(params.filter || '-')
          const affiliate_tuple = filter.find(([key, val]) => key == 'affiliate_name')
          if(!!affiliate_tuple) {
            if(maybe.isJust(nextProps.all_affiliates)) {
              const affiliate_ids = R.pipe(
                  R.filter(x => x.affiliate_name == affiliate_tuple[1])
                , R.chain(x => x.affiliate_ids)
                , R.join(';')
              )(nextProps.all_affiliates)

              params.filter = R.pipe(
                R.reject(([key, value]) => !value || value == '-')
                , R.map(([key, value]) => key == 'affiliate_name'
                  ? ['affiliate_id', affiliate_ids]
                  : [key, value]
                )
                , R.map(R.join('='))
                , R.join(',')
              )(filter)

              nextProps.fetch_filter_page_section_row(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)  
            }
          } else {
            nextProps.fetch_filter_page_section_row(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)
          }
        }
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(data)

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  componentWillMount() {
    
    const params = props_to_params(this.props)
    if(maybe.isNothing(this.props.all_affiliates)) {
      this.props.fetch_all_affiliates(params.date_from, params.date_to)
    }
    if(maybe.isNothing(this.props.all_countries)) {
      this.props.fetch_all_countries(
          params.date_from
        , params.date_to
      )
    }

    const sort = query_to_sort(this.props)
    this.props.min_row_filter_page_section_row('views', sort.rowSorter.minViews)
    this.props.min_row_filter_page_section_row('sales', sort.rowSorter.minSales)
  }

  render() {
    const params = props_to_params(this.props)

    const data_component = match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => maybe.isNothing(this.props.affiliates_mapping)
        ? <div>Loading affiliates...</div>
        : <Tabs 
          pages={data} 
          params={params}
          sort={ this.props.sort }
          affiliates={ this.props.affiliates_mapping }
          onSort={ (row_or_section, field, order) => 
            row_or_section == 'row'
              ? this.props.sort_row_filter_page_section_row(field, order) 
              : this.props.sort_row_filter_page_section(field, order)
          } />
    })(this.props.data)

    return <div className="main-bottom">
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                return <div>Loading...</div>
              }
            , all_countries => _ => maybe.maybe(
                _ => {
                  return <div>Loading affiliates ...</div>
                }
                , all_affiliates => _ => {
                  return  <Controls
                    className="main-left show"
                    params={ params }
                    countries={ all_countries }
                    affiliates={ all_affiliates }
                    sort={ this.props.sort }
                    set_params={ params => {
                      this.props.set_params(params)
                      this.props.cleanup_fetch_filter_page_section_row()
                      const query = params.nocache ? `?nocache=true&` : '?'
                      this.props.history.push(`/filter_page_section_row/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}${query}min_views=${this.props.sort.rowSorter.minViews}&min_sales=${this.props.sort.rowSorter.minSales}`)
                    } }
                    set_min={ (views_or_sales, value) => {
                      this.props.min_row_filter_page_section_row(views_or_sales, value)
                    } }
                  />
                }
              , this.props.all_affiliates
            )()
            , this.props.all_countries
          )()
        }
      </ThemeProvider>
      <div className="main-right expand">
        { data_component } 
      </div>
    </div>
  }
}

export default connect(
    state => ({
        data: filter_page_section_row_selector(state)
      , affiliates_mapping: affiliates_mapping_selector(state)
      , sort: state.sort
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_filter_page_section_row, cleanup_fetch_filter_page_section_row
      , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
      , set_params 
    }
)(Filter_Page_Section_Row)
